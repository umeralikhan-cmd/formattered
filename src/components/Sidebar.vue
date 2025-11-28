<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <div class="sidebar-header">
      <transition name="fade" mode="out-in">
        <div v-if="!collapsed" class="logo-section" key="expanded">
          
          <div class="logo-text">
            <h2>Hustle 2.0</h2>
          </div>
        </div>
        <div v-else class="logo-section-collapsed" key="collapsed">
          <div class="logo-icon-small">
            <v-icon size="24" color="white">mdi-school</v-icon>
          </div>
        </div>
      </transition>
    </div>

    <nav class="nav-menu">
      <router-link
        v-for="item in mainMenuItems"
        :key="item.value"
        :to="item.route"
        class="nav-item"
        :class="{ active: isActive(item.route) }"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <transition name="fade">
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        </transition>
      </router-link>

      <template v-if="devMode">
        <div class="nav-divider"></div>

        <router-link
          v-for="item in devMenuItems"
          :key="item.value"
          :to="item.route"
          class="nav-item"
          :class="{ active: isActive(item.route) }"
        >
          <v-icon size="22">{{ item.icon }}</v-icon>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <v-btn
        icon
        variant="text"
        size="small"
        class="collapse-btn"
        @click="toggleSidebar"
      >
        <v-icon size="20">{{ collapsed ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left' }}</v-icon>
      </v-btn>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const collapsed = ref(false)
const devMode = import.meta.env.VITE_DEV_MODE === 'True'

const emit = defineEmits(['collapse-changed'])

const mainMenuItems = [
  { label: 'Upload', value: 'upload', icon: 'mdi-file-upload-outline', route: '/' },
  { label: 'Results', value: 'results', icon: 'mdi-chart-bar', route: '/results' },
  { label: 'Facilities', value: 'facilities', icon: 'mdi-domain', route: '/facilities' },
  { label: 'Queue', value: 'queue', icon: 'mdi-clock-outline', route: '/queue', badge: '3' },
  { label: 'Mail', value: 'mail', icon: 'mdi-email-outline', route: '/mail' },
]

const devMenuItems = [
  { label: 'Dev Board', value: 'dev', icon: 'mdi-console', route: '/dev' },
  { label: 'Mavericks', value: 'mavericks', icon: 'mdi-star-outline', route: '/mavericks' },
]

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  emit('collapse-changed', collapsed.value)
}

const isActive = (routePath: string) => {
  return route.path === routePath
}

// Emit initial state
watch(collapsed, (newValue) => {
  emit('collapse-changed', newValue)
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1E293B;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s ease;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 70px;
}

.v-theme--light .sidebar {
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #334155;
  min-height: 70px;
}

.v-theme--light .sidebar-header {
  border-bottom: 1px solid #E5E7EB;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-section-collapsed {
  display: flex;
  justify-content: center;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #3B82F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon-small {
  width: 36px;
  height: 36px;
  background: #3B82F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #F9FAFB;
  margin: 0;
  white-space: nowrap;
}

.v-theme--light .logo-text h2 {
  color: #1E293B;
}


.v-theme--light .logo-subtitle {
  color: #64748B;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-theme--light .sidebar-footer {
  border-top: 1px solid #E5E7EB;
}

.collapse-btn {
  color: #94A3B8 !important;
}

.collapse-btn:hover {
  color: #E2E8F0 !important;
  background: rgba(59, 130, 246, 0.1) !important;
}

.v-theme--light .collapse-btn:hover {
  color: #1E293B !important;
  background: rgba(0, 0, 0, 0.05) !important;
}

.nav-menu {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background: #334155;
  margin: 12px 0;
}

.v-theme--light .nav-divider {
  background: #E5E7EB;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  color: #94A3B8;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
}

.sidebar-collapsed .nav-item {
  padding: 12px 0;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #E2E8F0;
}

.v-theme--light .nav-item {
  color: #64748B;
}

.v-theme--light .nav-item:hover {
  background: #F1F5F9;
  color: #1E293B;
}

.nav-item.active {
  background: #3B82F6;
  color: #FFFFFF;
  font-weight: 600;
}

.v-theme--light .nav-item.active {
  background: #3B82F6;
  color: #FFFFFF;
}

.nav-label {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Scrollbar styling */
.nav-menu::-webkit-scrollbar {
  width: 4px;
}

.nav-menu::-webkit-scrollbar-track {
  background: transparent;
}

.nav-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.v-theme--light .nav-menu::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .sidebar-collapsed {
    width: 70px;
  }

  .logo-text,
  .nav-label {
    display: none !important;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
