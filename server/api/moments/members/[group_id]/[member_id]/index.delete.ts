
export default defineSupabaseEventHandler(async (event, user, client, server) => {

    if (!user) return useReturnResponse(event, unauthorizedError);

    const { group_id, member_id } = getRouterParams(event);

    const { data, error: memberError } = await client.from("members").select("*").eq("user_id", member_id).eq("group_id", group_id).single<Tables<"members">>()
    if (memberError) return useReturnResponse(event, notFoundError)

    const { error } = await client.from("members").delete().eq("user_id", member_id).eq("group_id", group_id)
    if (error) return useReturnResponse(event, notFoundError)

    const { error: user_left_error }= await server.from("posts").update({ user_left: true }).eq("author_id", member_id).eq("group_id", group_id).select("*")
    if (user_left_error) return useReturnResponse(event, internalServerError)

    const { error: logError } = await server.from("logbook").insert({
        message: data.accepted ? "Kicked :member: from the group" : "Rejected :member: join request",
        performed_by_id: user.id,
        target_user_id: member_id,
        action_type: "deleted",
        group_id: group_id,
    })

    await server.from("notifications").insert({
        group_id: group_id,
        target_id: member_id,
        title: data.accepted ? "Removed from the group" : "Join request declined",
        message: data.accepted ? "You have been removed from the group by a moderator." : "Your request to join the group was declined by a moderator.",
        type: "group",
    })

    await useSendNotification({
        title: data.accepted ? "Removed from the group"  : "Join request declined",
        message: data.accepted ? "You have been removed from the group by a moderator." : "Your request to join the group was declined by a moderator.",
        target_id: member_id as string,
    }).catch(() => {
        console.error("Failed to send notification");
    });
    
    if (logError) return useReturnResponse(event, internalServerError)

    return useReturnResponse(event, {
        status: {
            success: true,
            redirect: data.accepted ? `/moments/`: undefined,
            message: "Ok",
            code: 200
        },
    });
})
