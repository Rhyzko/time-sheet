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
    <h1>Login</h1>
    <UButton @click="signInWithAzure">
        <Icon name="mdi-azure" size="2em" class="mr-2"></Icon>Azure
    </UButton>
</template>

<style lang="scss" scoped></style>