export const useUserStore = defineStore('user', () => {
    const { getCurrentUser } = useTimeSheetDatabase()

    const user = useSupabaseUser()
    const currentUser = ref<User>()

    async function getUser() {
        const userId = user.value?.id ?? ''
        currentUser.value = await getCurrentUser(userId) as User
    }

    return {
        currentUser,
        getUser
    }
})