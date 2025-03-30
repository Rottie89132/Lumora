export const useGetSession = async (client: SupabaseClient, currentSession: Session | Omit<Session, "user">) => {
    return await client.auth.getUser(currentSession.access_token || "non_Existing");
}

export const useRefreshSession = async (client: SupabaseClient, currentSession: Session | Omit<Session, "user">) => {
    const result = await client.auth.refreshSession(currentSession);
    return result;
}

export const useDeleteSession = async (client: SupabaseClient) => {
    return await client.auth.signOut();
}

export const useSetSessionData = (user: User | null) => {
    return user ? {
        id: user.id as string,
        name: user.user_metadata.name as string,
        avatar: user.user_metadata.avatar_url || "/profile.jpg" as string,
        email: user.user_metadata.email as string,
    } : null;
}

export const useSessionExists = async (event: H3Event, client: SupabaseClient) => {

    const currentSession = useGetCookies(event);
    const { data, error } = await useGetSession(client, currentSession);

    return { data: data?.user, error };
}