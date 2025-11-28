<template>
  <v-app :theme="appStore.theme">
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'

const theme = useTheme()
const appStore = useAppStore()

// Initialize theme
onMounted(() => {
  appStore.initTheme()
  theme.global.name.value = appStore.theme
})

// Watch for theme changes using the new API
watch(() => appStore.theme, (newTheme) => {
  theme.global.name.value = newTheme
})
</script>

<style>
/* Force font loading */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

* {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Global font override - Force everywhere */
html,
body,
#app,
.v-application,
.v-application *,
input,
textarea,
select,
button {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}

.v-application {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px !important;
  line-height: 1.6;
}

/* Headings - Force Poppins */
h1, h2, h3, h4, h5, h6,
.v-card-title,
.dialog-title,
.page-title,
.section-title,
.table-title,
.modal-title,
.dialog-header-title {
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
}

h1 {
  font-size: 2.5rem !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
}

h2 {
  font-size: 2rem !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
}

h3 {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
}

h4 {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
}

h5 {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  line-height: 1.5 !important;
}

h6 {
  font-size: 1rem !important;
  font-weight: 600 !important;
  line-height: 1.5 !important;
}

/* Vuetify Typography Overrides */
.v-btn,
.v-btn * {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.9375rem !important;
  letter-spacing: 0.02em !important;
  text-transform: none !important;
}

.v-card-title,
.v-card-title * {
  font-family: 'Poppins', sans-serif !important;
  font-weight: 700 !important;
  font-size: 1.375rem !important;
  letter-spacing: -0.01em !important;
}

.v-card-subtitle,
.v-card-subtitle * {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.9375rem !important;
}

.v-card-text,
.v-card-text * {
  font-family: 'Inter', sans-serif !important;
  font-size: 1rem !important;
  line-height: 1.6 !important;
}

.v-list-item-title {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.9375rem !important;
}

.v-tab,
.v-tab * {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.9375rem !important;
  letter-spacing: 0 !important;
}

.v-data-table th,
.v-data-table-header th {
  font-family: 'Inter', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.875rem !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

.v-data-table td,
.v-data-table tbody td {
  font-family: 'Inter', sans-serif !important;
  font-size: 0.9375rem !important;
}

.v-label,
.v-field-label,
.v-input label {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.9375rem !important;
}

.v-chip,
.v-chip * {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  letter-spacing: 0.02em !important;
}

.v-text-field input,
.v-select input,
.v-autocomplete input,
.v-textarea textarea {
  font-family: 'Inter', sans-serif !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
}

.v-menu .v-list,
.v-dialog .v-card,
.v-overlay .v-card {
  font-family: 'Inter', sans-serif !important;
}

/* Dialogs and Modals */
.v-dialog .v-card-title,
.modern-dialog-header,
.dialog-header-title {
  font-family: 'Poppins', sans-serif !important;
  font-weight: 700 !important;
  font-size: 1.5rem !important;
}

.v-dialog .v-card-text,
.dialog-content {
  font-family: 'Inter', sans-serif !important;
  font-size: 1rem !important;
  line-height: 1.6 !important;
}

/* Page content */
p, span, div {
  font-family: 'Inter', sans-serif !important;
  font-size: 1rem !important;
}

/* Stats and labels */
.stats-text,
.stats-label,
.table-stats {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.9375rem !important;
}

/* Smooth scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Dark mode scrollbar */
.v-theme--dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.v-theme--dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.v-theme--dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Vue Toastification Custom Styling - App Color Scheme */
.Vue-Toastification__toast {
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  padding: 16px 20px !important;
  min-width: 320px !important;
  max-width: 500px !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.9375rem !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.Vue-Toastification__toast--success {
  background: linear-gradient(135deg, #6366F1, #4F46E5) !important;
  color: white !important;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(99, 102, 241, 0.15) !important;
}

.Vue-Toastification__toast--error {
  background: linear-gradient(135deg, #EF4444, #DC2626) !important;
  color: white !important;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(239, 68, 68, 0.15) !important;
}

.Vue-Toastification__toast--warning {
  background: linear-gradient(135deg, #F59E0B, #D97706) !important;
  color: white !important;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3), 0 4px 12px rgba(245, 158, 11, 0.15) !important;
}

.Vue-Toastification__toast--info {
  background: linear-gradient(135deg, #818CF8, #6366F1) !important;
  color: white !important;
  box-shadow: 0 10px 30px rgba(129, 140, 248, 0.3), 0 4px 12px rgba(129, 140, 248, 0.15) !important;
}

.Vue-Toastification__toast-body {
  color: white !important;
  font-weight: 500 !important;
  line-height: 1.5 !important;
}

.Vue-Toastification__close-button {
  color: white !important;
  opacity: 0.9 !important;
  font-size: 20px !important;
}

.Vue-Toastification__close-button:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.Vue-Toastification__icon {
  color: white !important;
  width: 24px !important;
  margin-right: 12px !important;
}

.Vue-Toastification__progress-bar {
  background: rgba(255, 255, 255, 0.4) !important;
  height: 4px !important;
  border-radius: 0 0 12px 12px !important;
}

/* Dark theme adjustments */
.v-theme--dark .Vue-Toastification__toast {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.v-theme--dark .Vue-Toastification__toast--success {
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(99, 102, 241, 0.2) !important;
}

.v-theme--dark .Vue-Toastification__toast--error {
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(239, 68, 68, 0.2) !important;
}

.v-theme--dark .Vue-Toastification__toast--warning {
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(245, 158, 11, 0.2) !important;
}

.v-theme--dark .Vue-Toastification__toast--info {
  box-shadow: 0 10px 30px rgba(129, 140, 248, 0.4), 0 4px 12px rgba(129, 140, 248, 0.2) !important;
}

/* Animation */
.Vue-Toastification__bounce-enter-active {
  animation: bounceInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.Vue-Toastification__bounce-leave-active {
  animation: bounceOutRight 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes bounceInRight {
  from {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
  60% {
    transform: translate3d(-10px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes bounceOutRight {
  20% {
    opacity: 1;
    transform: translate3d(-10px, 0, 0);
  }
  to {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }
}
</style>
