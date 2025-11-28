<template>
  <div class="app-layout">
    <Sidebar @collapse-changed="handleSidebarCollapse" />

    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <TopNavbar @toggle-mobile-sidebar="toggleMobileSidebar" />

      <div class="content-wrapper">
        <div class="content-container">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import TopNavbar from '@/components/TopNavbar.vue';

const mobileSidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const handleSidebarCollapse = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed;
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.v-theme--dark .app-layout {
  background: #0f172a;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
}

.content-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 70px;
  }

  .content-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 12px;
  }
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
