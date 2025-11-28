<template>
  <v-app :theme="appStore.theme">
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { watch, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { useAppStore } from '@/stores/app';

const theme = useTheme();
const appStore = useAppStore();

// Initialize theme
onMounted(() => {
  appStore.initTheme();
  theme.global.name.value = appStore.theme;
});

// Watch for theme changes using the new API
watch(
  () => appStore.theme,
  (newTheme) => {
    theme.global.name.value = newTheme;
  }
);
</script>


