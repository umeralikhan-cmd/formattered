<template>
  <div class="mavericks-page">
    <div class="content-wrapper">
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <div class="filters-title-group">
            <v-icon size="20" class="filters-icon"> mdi-filter-outline </v-icon>
            <h2 class="filters-title">Search & Actions</h2>
          </div>
          <div class="header-actions">
            <v-chip v-if="selected.length > 0" color="primary" variant="flat" class="selection-chip">
              {{ selected.length }} Selected
            </v-chip>
            <v-btn
              v-if="selected.length > 1"
              color="primary"
              variant="flat"
              prepend-icon="mdi-merge"
              class="merge-btn"
              @click="mergeSelected"
            >
              Merge Selected
            </v-btn>
          </div>
        </div>

        <div class="filters-content">
          <v-row dense>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search by First and Last Name"
                prepend-inner-icon="mdi-magnify"
                clearable
                variant="outlined"
                density="comfortable"
                hide-details
                @input="onSearch"
              />
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <div class="table-header">
          <div class="table-stats">
            <v-icon class="stats-icon"> mdi-account-group </v-icon>
            <span class="stats-text">{{ totalItems }} Mavericks</span>
            <v-progress-circular v-if="isFetching" indeterminate color="primary" size="20" width="2" class="ml-2" />
          </div>
        </div>

        <div class="table-content">
          <div v-if="isLoading" class="loader-container">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="loader-text">Loading mavericks...</p>
          </div>

          <div v-else class="table-wrapper">
            <v-data-table
              v-model="selected"
              :headers="headers"
              :items="items"
              :loading="isLoading || isFetching"
              :items-per-page="itemsPerPage"
              item-value="id"
              return-object
              show-select
              hide-default-footer
              fixed-header
              height="500"
            >
              <template #item.action="{ item }">
                <div class="action-buttons">
                  <v-btn
                    variant="text"
                    size="small"
                    prepend-icon="mdi-information-outline"
                    class="action-btn info-btn"
                    @click="onRowClick(item)"
                  >
                    More Info
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    color="primary"
                    prepend-icon="mdi-plus-circle-outline"
                    class="action-btn queue-btn"
                    @click="openScholarshipDialog(item)"
                  >
                    Add to Queue
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-footer">
          <div class="pagination-info">
            <span class="pagination-text">
              {{ (page - 1) * itemsPerPage + 1 }}-{{ Math.min(page * itemsPerPage, totalItems) }} of {{ totalItems }}
            </span>
          </div>
          <div class="pagination-controls">
            <v-btn icon size="small" variant="text" :disabled="page === 1" @click="changePage(1)">
              <v-icon>mdi-page-first</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" :disabled="page === 1" @click="changePage(page - 1)">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="page-indicator">Page {{ page }} of {{ totalPages }}</span>
            <v-btn icon size="small" variant="text" :disabled="page >= totalPages" @click="changePage(page + 1)">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" :disabled="page >= totalPages" @click="changePage(totalPages)">
              <v-icon>mdi-page-last</v-icon>
            </v-btn>
          </div>
          <div class="items-per-page">
            <span class="per-page-label">Items per page:</span>
            <v-select
              v-model="itemsPerPage"
              :items="[10, 20, 50, 100]"
              variant="outlined"
              density="compact"
              hide-details
              class="per-page-select"
              @update:model-value="onItemsPerPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Applicant Details Dialog -->
  <v-dialog v-model="dialog" max-width="1400px" scrollable>
    <ApplicationCard :selected-applicant="selectedDocument" @close-dialog="closeDialog" />
  </v-dialog>

  <!-- Merge Dialog -->
  <v-dialog v-model="dialogMerge" max-width="1400px" scrollable>
    <MergeApplicants :selected-applicants="selected" @close-dialog="dialogMerge = false" />
  </v-dialog>

  <!-- Add to Scholarship Queue Dialog -->
  <v-dialog v-model="scholarshipDialog" max-width="600px">
    <v-card class="modern-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <v-icon class="header-icon" size="24"> mdi-school-outline </v-icon>
          <div>
            <h2 class="dialog-title">Add to Scholarship Queue</h2>
            <p class="dialog-subtitle">Select document type to add to queue</p>
          </div>
        </div>
        <v-btn icon variant="text" class="close-btn" @click="scholarshipDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="dialog-content">
        <v-select
          v-model="selectedDocumentType"
          :items="documentTypeOptions"
          label="Document Type"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-file-document-outline"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="outlined" class="cancel-btn" @click="scholarshipDialog = false"> Cancel </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-check"
          :disabled="!selectedDocumentType"
          class="confirm-btn"
          @click="addToScholarshipQueue"
        >
          Add to Queue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import api from '@/plugins/axios';
import ApplicationCard from './ApplicantCard.vue';
import MergeApplicants from './MergeApplicants.vue';

const props = defineProps({
  refresh: {
    type: Boolean,
    default: false,
  },
});

// State
const searchQuery = ref('');
const selected = ref([]);
const page = ref(1);
const itemsPerPage = ref(20);
const dialog = ref(false);
const dialogMerge = ref(false);
const scholarshipDialog = ref(false);
const selectedDocument = ref(null);
const selectedMaverick = ref(null);
const selectedDocumentType = ref(null);
const debounceTimeout = ref(null);

// Constants
const headers = [
  { title: 'First Name', key: 'first_name', align: 'start' },
  { title: 'Last Name', key: 'last_name', align: 'start' },
  { title: 'Middle Name', key: 'middle_name', align: 'start' },
  { title: 'Inmate Number', key: 'inmate_number', align: 'start' },
  { title: 'Institution', key: 'facility_name', align: 'start' },
  { title: 'Actions', key: 'action', sortable: false, align: 'end' },
];

const documentTypeOptions = ['PRESEASON', 'BOOK ONE', 'BOOK TWO'];

// Fetch mavericks using TanStack Query
const queryKey = computed(() => ['mavericks', page.value, itemsPerPage.value, searchQuery.value]);

const {
  data: mavericksData,
  isLoading,
  isFetching,
  refetch,
} = useQuery({
  queryKey,
  queryFn: async () => {
    const response = await api.post('/get-applicants', {
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      search: searchQuery.value,
    });
    return response.data;
  },
  staleTime: 1000 * 60 * 3, // 3 minutes - mavericks data stays fresh
  gcTime: 1000 * 60 * 15, // 15 minutes in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // ✅ Don't refetch on mount - only when page/search changes
  refetchOnReconnect: false,
  select: (data) => data || { items: [], totalItems: 0 }, // Ensure always returns proper structure
  placeholderData: { items: [], totalItems: 0 }, // Show empty structure while loading
  keepPreviousData: true, // Keep showing old data while paginating/searching
});

const items = computed(() => mavericksData.value?.items || []);
const totalItems = computed(() => mavericksData.value?.totalItems || 0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Watch for refresh prop
watch(
  () => props.refresh,
  (newValue) => {
    if (newValue) {
      refetch();
    }
  }
);

// Methods
const mergeSelected = () => {
  dialogMerge.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const onRowClick = (item) => {
  selectedDocument.value = item;
  dialog.value = true;
};

const onSearch = () => {
  clearTimeout(debounceTimeout.value);
  debounceTimeout.value = setTimeout(() => {
    page.value = 1;
    refetch();
  }, 500);
};

const changePage = (newPage) => {
  page.value = newPage;
};

const onItemsPerPageChange = () => {
  page.value = 1;
};

const openScholarshipDialog = (item) => {
  selectedMaverick.value = item;
  selectedDocumentType.value = null;
  scholarshipDialog.value = true;
};

const addToScholarshipQueue = async () => {
  if (!selectedDocumentType.value) {
    return;
  }

  try {
    const res = await api.post('/local-dash', {
      document_type: selectedDocumentType.value,
      maverick_id: selectedMaverick.value.id,
      instructions: {
        action: 'add_scholarship_queue',
      },
    });

    if (res.data.success) {
      scholarshipDialog.value = false;
    }
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>
/* Page Container */
.mavericks-page {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mavericks-page :deep(*) {
  scrollbar-width: none;
}

.mavericks-page :deep(*::-webkit-scrollbar) {
  display: none;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Filters Section */
.filters-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.filters-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
}

.v-theme--dark .filters-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .filters-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.filters-header {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
  flex-wrap: wrap;
  gap: 16px;
}

.v-theme--dark .filters-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1a2332, #151e2e);
}

.filters-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters-icon {
  color: #6366f1;
}

.v-theme--dark .filters-icon {
  color: #818cf8;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .filters-title {
  color: #f9fafb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selection-chip {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
}

.merge-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 10px 20px !important;
  height: auto !important;
  min-height: 40px !important;
  border-radius: 8px !important;
}

.filters-content {
  padding: 24px 28px;
  background: #fafbfc;
}

.v-theme--dark .filters-content {
  background: #151e2e;
}

/* Table Section */
.table-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.table-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
}

.v-theme--dark .table-section {
  background: #1e293b;
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
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
}

.v-theme--dark .table-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1a2332, #151e2e);
}

.table-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  color: #6366f1;
  opacity: 0.7;
}

.v-theme--dark .stats-icon {
  color: #818cf8;
  opacity: 0.8;
}

.stats-text {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .stats-text {
  color: #f9fafb;
}

.table-content {
  padding: 28px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.v-theme--dark .table-content {
  background: #151e2e;
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.v-theme--dark .loader-container {
  background: #1e293b;
  border-color: #334155;
}

.loader-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.v-theme--dark .loader-text {
  color: #9ca3af;
}

/* Table Wrapper */
.table-wrapper {
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  z-index: 1;
  contain: layout style;
}

.v-theme--dark .table-wrapper {
  background: #1e293b;
  border-color: #334155;
}

/* The data-table wrapper - handles scrolling */
.table-wrapper :deep(.v-data-table__wrapper) {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
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
  background: #f1f5f9;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: #1e293b;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #475569;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #64748b;
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
  color: #64748b !important;
  background: #f9fafb !important;
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
  color: #94a3b8 !important;
  background: #0f172a !important;
}

:deep(.v-data-table__td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-size: 0.875rem !important;
  white-space: nowrap !important;
  padding: 12px 16px !important;
  vertical-align: middle !important;
  line-height: 1.5 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.v-theme--dark .v-data-table__td) {
  color: #f9fafb !important;
  border-bottom-color: #334155 !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}

:deep(.v-theme--dark .v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
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
  text-transform: none !important;
  font-weight: 600 !important;
}

.info-btn {
  color: #3b82f6 !important;
}

.info-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

.v-theme--dark .info-btn:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

.queue-btn:hover {
  transform: translateY(-1px);
}

/* Pagination Footer */
.pagination-footer {
  padding: 16px 20px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.v-theme--dark .pagination-footer {
  background: #1e293b;
  border-top-color: #334155;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.v-theme--dark .pagination-text {
  color: #9ca3af;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-indicator {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  padding: 0 8px;
}

.v-theme--dark .page-indicator {
  color: #d1d5db;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.per-page-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.v-theme--dark .per-page-label {
  color: #9ca3af;
}

.per-page-select {
  width: 80px;
}

:deep(.per-page-select .v-field) {
  border-radius: 8px !important;
}

/* Modern Dialog */
.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-header {
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .dialog-header {
  background: linear-gradient(to bottom, #1a2332, #151e2e);
  border-bottom-color: #334155;
}

.header-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.header-icon {
  color: #3b82f6;
  margin-top: 2px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .dialog-title {
  color: #f9fafb;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.v-theme--dark .dialog-subtitle {
  color: #9ca3af;
}

.close-btn {
  border-radius: 8px !important;
}

.dialog-content {
  padding: 28px !important;
}

.dialog-actions {
  padding: 20px 28px !important;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
}

.v-theme--dark .dialog-actions {
  background: #151e2e;
  border-top-color: #334155;
}

.cancel-btn,
.confirm-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  border-radius: 8px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .filters-header,
  .table-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filters-content {
    padding: 20px;
  }

  .pagination-footer {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
