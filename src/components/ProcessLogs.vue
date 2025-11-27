<template>
  <div class="queue-container">
    <div class="content-wrapper">
      
      <!-- Tabs Section -->
      <div class="tabs-section">
        <div class="tabs-header">
          <v-tabs
            v-model="activeTab"
            class="modern-tabs"
            color="primary"
            density="compact"
          >
            <v-tab v-for="(tab, index) in tabs" :key="index" :value="index">
              <v-icon start size="18">{{ tab.icon }}</v-icon>
              {{ tab.name }}
            </v-tab>
          </v-tabs>
          <v-btn
            @click="refetchLogs"
            :loading="isLoading"
            class="refresh-btn"
            prepend-icon="mdi-refresh"
            variant="text"
            color="primary"
          >
            Refresh
          </v-btn>
        </div>
        
        <div v-if="activeTab === 0" class="filters-content">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search by name"
            prepend-inner-icon="mdi-magnify"
            clearable
            variant="outlined"
            density="comfortable"
            hide-details
            class="search-input"
          ></v-text-field>
        </div>
      </div>

      <!-- Table Section -->
      <div>
        <div>
          <div>
            <v-icon>mdi-format-list-bulleted</v-icon>
            <span>
              {{ currentTabName }}
            </span>
            <v-progress-circular
              v-if="isFetching"
              indeterminate
              color="primary"
              size="20"
              width="2"
              class="ml-2"
            />
          </div>
        </div>

        <div>
          <div v-if="isLoading">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p>Loading {{ currentTabName }}...</p>
          </div>

          <div v-else>
            <!-- Applications Tab - Use ApplicationsTable -->
            <applications-table v-if="activeTab === 0" :search-prop="searchQuery" />

            <!-- Other Tabs - Use ProcessLogsTable -->
            <process-logs-table
              v-else
              :tab-name="currentTabName"
              :logs="currentLogs"
              :loading="isLoading"
              @refresh="refetchLogs"
            />
          </div>
        </div>
      </div>
        
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import ProcessLogsTable from './ProcessLogsTable.vue';
import ApplicationsTable from './ApplicationsTable.vue';
import api from '@/plugins/axios';

const activeTab = ref(0);
const searchQuery = ref('');

const tabs = [
  { name: 'Applications', icon: 'mdi-file-document-multiple' },
  { name: 'TYH', icon: 'mdi-school' },
  { name: 'Preseason', icon: 'mdi-calendar-clock' },
  { name: 'Book One', icon: 'mdi-book-open-variant' },
  { name: 'Book Two', icon: 'mdi-book-open-page-variant' }
];

const currentTabName = computed(() => {
  const tabNames = ['Applications', 'TYH', 'PRESEASON', 'BOOK ONE', 'BOOK TWO'];
  return tabNames[activeTab.value] || 'Applications';
});

// Fetch logs using TanStack Query
const { data: logsData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['processLogs', currentTabName],
  queryFn: async () => {
    if (currentTabName.value === 'Applications') {
      return [];
    }
    
    const response = await api.post('/local-dash', {
      instructions: {
        action: `get_${currentTabName.value}`
      }
    });
    return response.data.grouped_logs || [];
  },
  enabled: computed(() => currentTabName.value !== 'Applications'),
  staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh
  gcTime: 1000 * 60 * 60, // 60 minutes - data stays in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

const currentLogs = computed(() => {
  return logsData.value || [];
});

const changeTab = (index) => {
  activeTab.value = index;
};

const refetchLogs = () => {
  if (currentTabName.value !== 'Applications') {
    refetch();
  }
};
</script>

<style scoped>
/* Main Container */
.queue-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  position: relative;
  isolation: isolate;
}

.v-theme--dark .queue-container {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
}

.queue-container::-webkit-scrollbar {
  display: none !important;
}

/* Hide all scrollbars for Chrome, Safari and Opera */
.queue-container *::-webkit-scrollbar {
  display: none !important;
}

.queue-container * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Tabs Section */
.tabs-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tabs-section:hover {
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08), 0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
  transform: translateY(-2px);
}

.v-theme--dark .tabs-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .tabs-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #FFFFFF;
}

.v-theme--dark .tabs-header {
  background: #1E293B;
}

.modern-tabs {
  background: transparent !important;
  flex: 1;
}

:deep(.modern-tabs .v-tab) {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  transition: all 0.2s ease;
  padding: 12px 20px !important;
  min-height: 48px !important;
  color: #64748B !important;
}

:deep(.modern-tabs .v-tab--selected) {
  color: #3B82F6 !important;
}

:deep(.v-theme--dark .modern-tabs .v-tab) {
  color: #94A3B8 !important;
}

:deep(.v-theme--dark .modern-tabs .v-tab--selected) {
  color: #60A5FA !important;
}

:deep(.modern-tabs .v-tab:hover) {
  background: rgba(59, 130, 246, 0.08) !important;
}

:deep(.v-theme--dark .modern-tabs .v-tab:hover) {
  background: rgba(96, 165, 250, 0.12) !important;
}

:deep(.modern-tabs .v-tab .v-icon) {
  opacity: 0.7;
}

:deep(.modern-tabs .v-tab--selected .v-icon) {
  opacity: 1;
}

:deep(.modern-tabs .v-tabs__container) {
  height: auto !important;
}

:deep(.modern-tabs .v-slide-group__content) {
  gap: 4px;
}

:deep(.modern-tabs .v-tab__slider) {
  height: 3px !important;
  border-radius: 3px 3px 0 0 !important;
}

.refresh-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  box-shadow: none !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  color: #3B82F6 !important;
  cursor: pointer !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
}

.refresh-btn:hover {
  background: rgba(59, 130, 246, 0.08) !important;
}

.refresh-btn :deep(.v-icon) {
  margin-right: 6px;
}

.v-theme--dark .refresh-btn {
  color: #60A5FA !important;
}

.v-theme--dark .refresh-btn:hover {
  background: rgba(96, 165, 250, 0.12) !important;
}

.filters-content {
  padding: 28px;
  background: #FAFBFC;
  border-top: 1px solid #E2E8F0;
}

.v-theme--dark .filters-content {
  background: #151E2E;
  border-top-color: #334155;
}

.search-input {
  max-width: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .tabs-header {
    flex-direction: column;
    align-items: stretch;
    padding: 20px !important;
  }

  .modern-tabs {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    margin: 0 16px 16px 16px;
  }

  .filters-content {
    padding: 16px;
  }

  .search-input {
    max-width: 100%;
  }
}
</style>
