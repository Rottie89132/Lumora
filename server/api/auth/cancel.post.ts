export default defineSupabaseEventHandler(async (event, user, client, server) => {

    if (!user) return useReturnResponse(event, unauthorizedError);
    
    await server.from("factor_sessions").delete().eq("user_id", user.id)

    const { error } = await server.rpc('delete_sessions_by_user_id', {
        user_id_param: user.id
    });

    if (error) return useReturnResponse(event, badRequestError)

    /*
    ************************************************************************************
    */

    await useDeleteCookies(event)


    return useReturnResponse(event, {
        status: {
            success: true,
            redirect: "/auth",
            message: "Ok",
            code: 200
        }
    })

});
