<script setup lang="ts">
const fileSystem = useFileSystemAPI();
onMounted(async () => {
  try {
    await fileSystem.checkPermission();
  } catch (error) {
    console.log('erf');
  }

  //Read each file's content
  const files = await fileSystem.readFiles();
  // Push it into the app's data
  files.forEach((file) => {
    const { name } = JSON.parse(file);
    //crew.value.push(name);
    console.log('name', name);
  });
});
const showDirectoryPicker = async () => {
  await fileSystem.getDirectoryHandle();
};
</script>

<template>
  <div>
    Here are the settings
    <UButton @click="showDirectoryPicker">Set activity Folder</UButton>
  </div>
</template>

<style lang="scss" scoped></style>
