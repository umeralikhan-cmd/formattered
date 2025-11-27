<template>
  <v-btn
    icon
    variant="text"
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <v-icon size="22">{{ themeIcon }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'

const theme = useTheme()
const appStore = useAppStore()

const isDark = computed(() => appStore.isDark)
const themeIcon = computed(() => isDark.value ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent')

const toggleTheme = () => {
  appStore.toggleTheme()
  // Use the correct method to change theme
  theme.global.name.value = appStore.theme
}
</script>

<style scoped>
.theme-toggle {
  color: #6B7280 !important;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  color: #111827 !important;
}

.v-theme--dark .theme-toggle {
  color: #9CA3AF !important;
}

.v-theme--dark .theme-toggle:hover {
  color: #F9FAFB !important;
}
</style>

