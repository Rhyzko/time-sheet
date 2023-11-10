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
    <header class="appbar flex flex-row items-center z-20 bg-white dark:bg-slate-800">
        <img src="/img/logo.png" width="50" class="ml-4" @click="router.push('/')" :class="'cursor-pointer'">
        <NuxtLink to="/">
            <h2 class="font-bold text-xl text-orange-500 ml-2">Avatime-sheet</h2>
        </NuxtLink>

        <span class="ml-auto">
            <NuxtLink to="/settings" class="ml-auto" v-if="user && router.currentRoute.value.name !== 'settings'">
                <UButton icon="i-heroicons-cog-6-tooth" class="ml-auto" />
            </NuxtLink>
            <NuxtLink to="/" class="ml-auto" v-if="user && router.currentRoute.value.name === 'settings'">
                <UButton icon="i-mdi-list-box" class="ml-auto" />
            </NuxtLink>
            <ColorModeButton class="mr-2" />
            <span class="cursor-pointer mr-2" v-if="user">
                <UButton icon="i-material-symbols-exit-to-app-rounded" @click="logout" />
            </span>
        </span>
    </header>
    <main class="mainContent dark:bg-slate-800">
        <slot />
    </main>
    <footer class="footerContent bg-white dark:bg-slate-800">
        <UDivider />
        <div class="flex flex-row items-center justify-center bg-white dark:bg-slate-800">
            <p class="text-gray-500 dark:text-gray-400 text-sm flex flex-row align-middle items-center">
                &copy; {{ new Date().getFullYear() }} Avatime-sheet 0.1.2, made with
                <NuxtLink to="https://nuxt.com/" target="_blank">
                    <Icon name="logos:nuxt-icon" />
                </NuxtLink>
            </p>
        </div>
    </footer>
</template>
<style lang="scss" scoped>
.appbar {
    top: 0;
    left: 0;
    width: 100%;
    height: 64px;
    position: fixed;
    //background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 0, 0, 0));
    backdrop-filter: 0.5rem;
    transition: transform 3s ease-in-out;
}

.mainContent {
    margin-top: 64px;
    height: calc(100% + 64px);
}

.footerContent {
    padding-top: 48px;
}
</style>