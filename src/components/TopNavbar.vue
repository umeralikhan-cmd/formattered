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
        </div>
        <v-chip v-if="currentPageBadge" size="small" color="primary" variant="flat">
          {{ currentPageBadge }}
        </v-chip>
      </div>
    </div>

    <div class="navbar-right">
      <ThemeToggle />
      
      <v-btn
        @click="handleLogout"
        variant="text"
        prepend-icon="mdi-logout"
        class="logout-btn"
      >
        Sign Out
      </v-btn>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { signOut } = useAuth()

const emit = defineEmits(['toggle-mobile-sidebar'])

const pageConfig: Record<string, { title: string; icon: string; badge?: string }> = {
  '/': { 
    title: 'Upload / Auto Grading', 
    icon: 'mdi-cloud-upload-outline'
  },
  '/results': { title: 'Results', icon: 'mdi-chart-bar' },
  '/facilities': { title: 'Facilities', icon: 'mdi-domain' },
  '/queue': { 
    title: 'Scholarship Queue', 
    icon: 'mdi-format-list-checks'
  },
  '/mail': { title: 'Regular Mail', icon: 'mdi-email-outline' },
  '/dev': { title: 'Dev Board', icon: 'mdi-console' },
  '/mavericks': { 
    title: 'Mavericks', 
    icon: 'mdi-account-group'
  },
  '/profile': { title: 'My Profile', icon: 'mdi-account-circle' },
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

const toggleMobileSidebar = () => {
  emit('toggle-mobile-sidebar')
}

const handleLogout = async () => {
  const result = await signOut()
  if (result.success) {
    router.push('/login')
  }
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
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.v-theme--dark .page-title {
  color: #F8FAFC;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #64748B;
  margin: 0;
  line-height: 1.4;
  letter-spacing: 0.01em;
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

.logout-btn {
  color: #EF4444 !important;
  text-transform: none !important;
  font-weight: 600 !important;
}

.v-theme--dark .logout-btn {
  color: #F87171 !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
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
