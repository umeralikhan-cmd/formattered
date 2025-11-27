<template>
  <header class="top-navbar">
    <div class="navbar-left">
      <v-btn icon variant="text" class="menu-btn" @click="toggleMobileSidebar">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <div class="breadcrumbs">
        <v-icon size="24" color="primary">{{ currentPageIcon }}</v-icon>
        <div class="page-info">
        <h1 class="page-title">{{ currentPageTitle }}</h1>
          <p v-if="currentPageSubtitle" class="page-subtitle">{{ currentPageSubtitle }}</p>
        </div>
        <v-chip v-if="currentPageBadge" size="small" color="primary" variant="flat">
          {{ currentPageBadge }}
        </v-chip>
      </div>
    </div>

    <div class="navbar-right">
      <ThemeToggle />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()

const emit = defineEmits(['toggle-mobile-sidebar'])

const pageConfig: Record<string, { title: string; icon: string; badge?: string; subtitle?: string }> = {
  '/': { 
    title: 'Document Upload & Processing', 
    icon: 'mdi-cloud-upload-outline'
  },
  '/results': { title: 'Results & Analytics', icon: 'mdi-chart-bar' },
  '/facilities': { title: 'Facilities Management', icon: 'mdi-domain' },
  '/queue': { 
    title: 'Scholarship Queue', 
    icon: 'mdi-format-list-checks',
    subtitle: 'Manage and approve scholarship applications'
  },
  '/mail': { title: 'Mail Management', icon: 'mdi-email-outline' },
  '/dev': { title: 'Developer Board', icon: 'mdi-console' },
  '/mavericks': { 
    title: 'Mavericks Directory', 
    icon: 'mdi-account-group',
    subtitle: 'Search and manage Maverick profiles'
  },
}

const currentPageTitle = computed(() => {
  return pageConfig[route.path]?.title || 'Dashboard'
})

const currentPageIcon = computed(() => {
  return pageConfig[route.path]?.icon || 'mdi-view-dashboard'
})

const currentPageBadge = computed(() => {
  return pageConfig[route.path]?.badge
})

const currentPageSubtitle = computed(() => {
  return pageConfig[route.path]?.subtitle
})

const toggleMobileSidebar = () => {
  emit('toggle-mobile-sidebar')
}
</script>

<style scoped>
.top-navbar {
  min-height: 72px;
  background: linear-gradient(to bottom, #FFFFFF, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
}

.v-theme--dark .top-navbar {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.menu-btn {
  display: none;
  color: #64748B;
}

.v-theme--dark .menu-btn {
  color: #94A3B8;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.page-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.v-theme--dark .page-title {
  color: #F8FAFC;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-theme--dark .page-subtitle {
  color: #94A3B8;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Mobile responsive */
@media (max-width: 968px) {
  .page-subtitle {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-navbar {
    padding: 12px 20px;
    min-height: 64px;
  }

  .menu-btn {
    display: flex;
  }

  .navbar-left {
    gap: 12px;
  }

  .breadcrumbs {
    gap: 12px;
  }

  .page-title {
    font-size: 1.125rem;
  }

  .page-subtitle {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .top-navbar {
    padding: 12px 16px;
  }

  .breadcrumbs {
    gap: 10px;
  }

  .page-title {
    font-size: 1rem;
  }
}
</style>
