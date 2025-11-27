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
            <v-tab value="PRESEASON">
              <v-icon start size="18">mdi-calendar-clock</v-icon>
              Preseason
            </v-tab>
            <v-tab value="BOOK ONE">
              <v-icon start size="18">mdi-book-open-variant</v-icon>
              Book One
            </v-tab>
            <v-tab value="BOOK TWO">
              <v-icon start size="18">mdi-book-open-page-variant</v-icon>
              Book Two
            </v-tab>
            <v-tab value="ALL">
              <v-icon start size="18">mdi-all-inclusive</v-icon>
              All
            </v-tab>
      </v-tabs>
          <v-btn
            @click="refetchCurrentQueue"
            :loading="isFetching"
            class="refresh-btn"
            prepend-icon="mdi-refresh"
            variant="text"
            color="primary"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <div class="table-header">
          <div class="table-stats">
            <v-icon class="stats-icon">mdi-format-list-bulleted</v-icon>
            <span class="stats-text">
              {{ currentQueueItems.length }} {{ currentQueueItems.length === 1 ? 'Item' : 'Items' }}
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

        <div class="table-content">
          <div v-if="isLoading" class="loader-container">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="loader-text">Loading queue...</p>
          </div>

          <div v-else class="table-wrapper">
            <v-data-table
              :headers="headers"
              :items="currentQueueItems"
              :items-per-page="20"
              fixed-header
              height="600"
            >
              <template v-slot:item.created_at="{ item }">
                <span class="date-text">{{ formatDate(item.created_at) }}</span>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  variant="flat"
                  size="small"
                  class="status-chip"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="action-buttons">
                  <v-btn
                    v-if="item.status === 'Pending'"
                    icon
                    size="small"
                    @click="approveItem(item)"
                    title="Approve"
                    variant="text"
                    class="action-btn approve-btn"
                  >
                    <v-icon size="16">mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    v-else-if="item.status === 'Approved'"
                    icon
                    size="small"
                    @click="setPendingItem(item)"
                    title="Set to Pending"
                    variant="text"
                    class="action-btn pending-btn"
                  >
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    @click="confirmArchive(item)"
                    title="Archive"
                    variant="text"
                    class="action-btn archive-btn"
                  >
                    <v-icon size="16">mdi-archive</v-icon>
                  </v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <div class="empty-state">
                  <v-icon size="48" color="grey-lighten-1">mdi-inbox</v-icon>
                  <p class="empty-text">No queue items found for {{ activeTab }}</p>
                </div>
              </template>
            </v-data-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Archive Confirmation Dialog -->
    <v-dialog v-model="archiveDialog" max-width="500">
      <v-card class="modern-dialog">
        <v-card-title class="modern-dialog-header">
          <div class="dialog-header-content">
            <v-icon class="dialog-header-icon" size="28">mdi-archive</v-icon>
            <span class="dialog-header-title">Archive Item</span>
          </div>
        </v-card-title>
        <v-card-text class="dialog-content">
          <p>Are you sure you want to archive queue item #{{ itemToArchive?.id }}?</p>
      </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="archiveDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="archiveItem" :loading="archiving">
            Archive
          </v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import api from '@/plugins/axios';

// Reactive state
const activeTab = ref('PRESEASON');
const archiveDialog = ref(false);
const itemToArchive = ref(null);
const archiving = ref(false);

// Table headers
const headers = [
        { title: 'First Name', key: 'first_name', sortable: true },
        { title: 'Last Name', key: 'last_name', sortable: true },
  { title: 'Facility Name', key: 'facility_name', sortable: true },
        { title: 'Document Type', key: 'document_type', sortable: true },
        { title: 'Status', key: 'status', sortable: true },
        { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
];

// TanStack Query - Fetch queue
const { data: queueData, isLoading, isFetching, error, refetch: refetchCurrentQueue } = useQuery({
  queryKey: ['queue', activeTab],
  queryFn: async () => {
        const response = await api.post('/local-dash', {
          instructions: {
            action: 'get_queue'
          },
      document_type: activeTab.value
        });

        if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  },
  staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh
  gcTime: 1000 * 60 * 60, // 60 minutes - data stays in cache
  refetchOnWindowFocus: false, // Don't refetch on tab focus
  refetchOnMount: false, // Use cached data if available
  refetchOnReconnect: false, // Don't refetch on network reconnect
});

// Computed properties
const currentQueueItems = computed(() => queueData.value || []);

// Watch tab changes to refetch
watch(activeTab, () => {
  refetchCurrentQueue();
});

// Helper functions
const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
};

const getStatusColor = (status) => {
      const statusColors = {
        'pending': 'orange',
    'approved': 'green',
        'processing': 'blue',
        'completed': 'green',
        'failed': 'red',
        'on-hold': 'grey'
      };
      return statusColors[status?.toLowerCase()] || 'grey';
};

// Action methods
const approveItem = async (item) => {
      try {
        const response = await api.post('/local-dash', {
          instructions: {
            action: 'update_queue'
          },
          queue_id: item.id,
          status: 'Approved'
        });

        if (response.data && response.data.success) {
      await refetchCurrentQueue();
        } else {
          throw new Error(response.data?.error || 'Failed to approve item');
        }
      } catch (error) {
        console.error('Error approving item:', error);
  }
};

const setPendingItem = async (item) => {
      try {
        const response = await api.post('/local-dash', {
          instructions: {
            action: 'update_queue'
          },
          queue_id: item.id,
          status: 'Pending'
        });

        if (response.data && response.data.success) {
      await refetchCurrentQueue();
        } else {
          throw new Error(response.data?.error || 'Failed to set item to pending');
        }
      } catch (error) {
        console.error('Error setting item to pending:', error);
  }
};

const confirmArchive = (item) => {
  itemToArchive.value = item;
  archiveDialog.value = true;
};

const archiveItem = async () => {
  if (!itemToArchive.value) return;

  archiving.value = true;
  try {
          const response = await api.post('/local-dash', {
            instructions: {
              action: 'archive_queue_item'
            },
      queue_id: itemToArchive.value.id
          });

          if (response.data && response.data.success) {
      await refetchCurrentQueue();
      archiveDialog.value = false;
      itemToArchive.value = null;
          } else {
            throw new Error(response.data?.error || 'Failed to archive item');
          }
        } catch (error) {
          console.error('Error archiving item:', error);
  } finally {
    archiving.value = false;
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

/* Table Section */
.table-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.table-section:hover {
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08), 0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
  transform: translateY(-2px);
}

.v-theme--dark .table-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .table-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.table-header {
  padding: 24px 28px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
}

.v-theme--dark .table-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1A2332, #151E2E);
}

/* Table Stats Section */
.table-stats :deep(.v-chip) {
  background: linear-gradient(135deg, #EEF2FF, #E0E7FF) !important;
  color: #4F46E5 !important;
  border: 1px solid #C7D2FE !important;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.1) !important;
  font-weight: 600 !important;
}

.v-theme--dark .table-stats :deep(.v-chip) {
  background: linear-gradient(135deg, #312E81, #3730A3) !important;
  color: #A5B4FC !important;
  border: 1px solid #4C1D95 !important;
}

.table-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  color: #6366F1;
  opacity: 0.7;
}

.v-theme--dark .stats-icon {
  color: #818CF8;
  opacity: 0.8;
}

.stats-text {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .stats-text {
  color: #F9FAFB;
}

.table-content {
  padding: 28px;
  background: #FAFBFC;
  border-top: 1px solid #E2E8F0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.v-theme--dark .table-content {
  background: #151E2E;
  border-top-color: #334155;
}

/* Loader Container */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  padding: 40px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.v-theme--dark .loader-container {
  background: #1E293B;
  border-color: #334155;
}

.loader-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .loader-text {
  color: #9CA3AF;
}

/* Error Container */
.error-container {
  padding: 20px 0;
}

.modern-alert {
  border-radius: 12px !important;
  font-weight: 500;
}


/* Modern Dialog Styling */
.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.modern-dialog-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 24px 32px !important;
  background: #3B82F6 !important; /* Solid blue */
  color: white !important;
  border-bottom: none !important;
}

.v-theme--dark .modern-dialog-header {
  background: #2563EB !important; /* Darker blue for dark mode */
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header-icon {
  color: white !important;
  opacity: 0.95;
}

.dialog-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

.dialog-content {
  padding: 32px !important;
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
}

.v-theme--dark .dialog-content {
  color: #D1D5DB;
}

.dialog-actions {
  padding: 24px 32px !important;
  border-top: none !important;
  background: #FFFFFF;
}

.v-theme--dark .dialog-actions {
  background: #1E293B;
}

.dialog-actions :deep(.v-btn) {
  cursor: pointer !important;
}

/* Table Wrapper */
.table-wrapper {
  width: 100%;
  max-width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  z-index: 1;
  contain: layout style;
}

.v-theme--dark .table-wrapper {
  background: #1E293B;
  border-color: #334155;
}

/* The data-table wrapper - handles scrolling */
.table-wrapper :deep(.v-data-table__wrapper) {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
  touch-action: pan-y pan-x;
  will-change: scroll-position;
  position: relative;
  z-index: 1;
}

/* Scrollbar styling for webkit browsers */
.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: #1E293B;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #475569;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}

/* Fixed header - Vuetify handles this with fixed-header prop */
.table-wrapper :deep(thead th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

.table-wrapper :deep(.v-table) {
  width: auto;
  min-width: 100%;
  table-layout: auto;
}

.table-wrapper :deep(.v-table tbody) {
  width: auto;
}

.table-wrapper :deep(.v-table th),
.table-wrapper :deep(.v-table td) {
  min-width: 120px;
}

/* Better row spacing */
.table-wrapper :deep(.v-data-table__tr) {
  height: auto !important;
  min-height: 52px !important;
}

/* Data Table Styling */
:deep(.v-data-table) {
  background: transparent !important;
  isolation: isolate;
}

:deep(.v-data-table tbody tr) {
  position: relative;
  isolation: isolate;
  cursor: default;
}

:deep(.v-data-table__tr--clickable) {
  cursor: default !important;
}

/* Checkboxes */
:deep(.v-checkbox) {
  cursor: pointer !important;
}

:deep(.v-checkbox .v-selection-control__input) {
  cursor: pointer !important;
}

:deep(.v-data-table__th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748B !important;
  background: #F9FAFB !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  white-space: nowrap !important;
  padding: 14px 16px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.3 !important;
}

:deep(.v-theme--dark .v-data-table__th) {
  color: #94A3B8 !important;
  background: #0F172A !important;
}

:deep(.v-data-table__td) {
  color: #1E293B !important;
  border-bottom: 1px solid #E5E7EB !important;
  font-size: 0.875rem !important;
  white-space: nowrap !important;
  padding: 12px 16px !important;
  vertical-align: middle !important;
  line-height: 1.5 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.v-theme--dark .v-data-table__td) {
  color: #F9FAFB !important;
  border-bottom-color: #334155 !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}

:deep(.v-theme--dark .v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

/* Date Text */
.date-text {
  font-size: 0.8125rem;
  color: #6B7280;
  font-weight: 400;
  white-space: nowrap;
}

.v-theme--dark .date-text {
  color: #9CA3AF;
}

/* Status Chips */
.status-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.02em !important;
  text-transform: uppercase !important;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  box-shadow: none !important;
  transition: all 0.2s ease;
  cursor: pointer !important;
}

.approve-btn {
  color: #16A34A !important;
}

.approve-btn:hover {
  background: rgba(22, 163, 74, 0.1) !important;
}

.v-theme--dark .approve-btn:hover {
  background: rgba(22, 163, 74, 0.15) !important;
}

.pending-btn {
  color: #F59E0B !important;
}

.pending-btn:hover {
  background: rgba(245, 158, 11, 0.1) !important;
}

.v-theme--dark .pending-btn:hover {
  background: rgba(245, 158, 11, 0.15) !important;
}

.archive-btn {
  color: #64748B !important;
}

.archive-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #EF4444 !important;
}

.v-theme--dark .archive-btn:hover {
  background: rgba(239, 68, 68, 0.15) !important;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #9CA3AF;
  margin: 0;
}

.v-theme--dark .empty-text {
  color: #6B7280;
}

/* Pagination Footer Styling */
:deep(.v-data-table__footer) {
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 12px 16px;
}

:deep(.v-theme--dark .v-data-table__footer) {
  border-top-color: #334155;
  background: #0F172A;
}

:deep(.v-pagination__item) {
  border-radius: 6px !important;
  transition: all 0.2s ease;
  cursor: pointer !important;
}

:deep(.v-pagination__item:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
  cursor: pointer !important;
}

:deep(.v-pagination__item--is-active) {
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3) !important;
  color: white !important;
}

:deep(.v-pagination__prev),
:deep(.v-pagination__next),
:deep(.v-pagination__first),
:deep(.v-pagination__last) {
  cursor: pointer !important;
}

:deep(.v-pagination__prev:hover),
:deep(.v-pagination__next:hover),
:deep(.v-pagination__first:hover),
:deep(.v-pagination__last:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .tabs-header {
    flex-direction: column;
    align-items: stretch;
    padding: 20 !important;
  }

  .modern-tabs {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    margin: 0 16px 16px 16px;
  }

  .table-content {
    padding: 16px;
  }

  .table-header {
    padding: 16px;
  }
}
</style>
