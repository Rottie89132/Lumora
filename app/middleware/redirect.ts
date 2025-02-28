export default defineNuxtRouteMiddleware(async (to, from) => {

    const store = useSessionsStore()
    const { error } = await store.getSession()
    if (error) return navigateTo("/auth")

    else if (document) return navigateTo("/home")
    
})