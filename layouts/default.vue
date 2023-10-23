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
    <header class="appbar flex flex-row items-center">
        <img src="/img/logo.png" width="50" class="ml-4" @click="router.push('/')" :class="'cursor-pointer'">
        <NuxtLink to="/">Avatime-sheet</NuxtLink>
        <NuxtLink to="/settings" class="ml-auto">
            <UButton icon="i-heroicons-cog-6-tooth" class="ml-auto" />
        </NuxtLink>
        <ColorModeButton />
        <span class="cursor-pointer ml-2">
            <UButton icon="i-material-symbols-exit-to-app-rounded" @click="logout" />
        </span>
    </header>
    <main class="mainContent">
        <slot />
    </main>
</template>

<style lang="scss" scoped>
.appbar {
    top: 0;
    left: 0;
    width: 100%;
    height: 64px;
    position: fixed;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 0, 0, 0));
    backdrop-filter: 0.5rem;
    transition: transform 3s ease-in-out;
}

.mainContent {
    margin-top: 64px;
}
</style>