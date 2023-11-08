<script setup lang="ts">
const { auth } = useSupabaseClient()

const signInWithAzure = async () => {
    const { data, error } = await auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'email',
        },
    })
}
</script>

<template>
    <div class="flex justify-center items-center pt-2 loginContainer">
        <UCard>
            <h1 class="text-xl text-center mb-4">Login</h1>
            <UButton @click="signInWithAzure">
                <Icon name="mdi-azure" size="2em" class="mr-2"></Icon>Azure
            </UButton>
        </UCard>
    </div>
</template>

<style lang="scss" scoped>
.loginContainer {
    height: calc(100vh - 148px);
}
</style>