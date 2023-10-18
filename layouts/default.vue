<script setup lang="ts">

</script>

<template>
    <header class="text-center flex items-center align-middle">
        <NuxtLink to="/">Default header content</NuxtLink>
        <NuxtLink to="/settings">
            <UIcon name="i-heroicons-cog-6-tooth" class="ml-auto" @click=""></UIcon>
        </NuxtLink>
    </header>
    <main>
        <slot />
    </main>
</template>

<style lang="scss" scoped></style>