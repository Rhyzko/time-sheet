export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore()
    const { getUser } = userStore
    const { currentUser } = storeToRefs(userStore)

    if (!currentUser.value) {
        await getUser()
    }

    if (currentUser.value?.role !== 'Manager') {
        return abortNavigation()
    }
})