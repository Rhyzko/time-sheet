<script setup lang="ts">
const { auth } = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

const logout = async () => {
    await auth.signOut()
    router.push('/login')
}
</script>

<template>
    <header class="text-center flex items-center align-middle">
        <NuxtLink to="/">Default header content</NuxtLink>
        <NuxtLink to="/settings">
            <Icon name="i-heroicons-cog-6-tooth" class="ml-auto"></Icon>
        </NuxtLink>
        <span class="ml-auto cursor-pointer">{{ user?.email }}
            <Icon name="i-heroicons-arrow-right-on-rectangle" size="1.5rem" @click="logout" />
        </span>
    </header>
    <main>
        <slot />
    </main>
</template>

<style lang="scss" scoped></style>