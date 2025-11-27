<template>
  <div class="mavericks-page">
    <div class="content-wrapper">
      
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <div class="filters-title-group">
            <v-icon size="20" class="filters-icon">mdi-filter-outline</v-icon>
            <h2 class="filters-title">Search & Actions</h2>
          </div>
          <div class="header-actions">
            <v-chip v-if="selected.length > 0" color="primary" variant="flat" class="selection-chip">
              {{ selected.length }} Selected
            </v-chip>
            <v-btn
              v-if="selected.length > 1"
              @click="mergeSelected"
              color="primary"
              variant="flat"
              prepend-icon="mdi-merge"
              class="merge-btn"
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
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
        <div class="table-header">
          <div class="table-stats">
            <v-icon class="stats-icon">mdi-account-group</v-icon>
            <span class="stats-text">{{ totalItems }} Mavericks</span>
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
            <p class="loader-text">Loading mavericks...</p>
          </div>

          <div v-else class="table-wrapper">
            <v-data-table
              :headers="headers"
              :items="items"
              :items-per-page="itemsPerPage"
              item-value="id"
              v-model="selected"
              return-object
              show-select
              hide-default-footer
              fixed-header
              height="500"
            >
              <template v-slot:item.action="{ item }">
                <div class="action-buttons">
                  <v-btn
                    variant="text"
                    size="small"
                    @click="onRowClick(item)"
                    prepend-icon="mdi-information-outline"
                    class="action-btn info-btn"
                  >
                    More Info
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    color="primary"
                    @click="openScholarshipDialog(item)"
                    prepend-icon="mdi-plus-circle-outline"
                    class="action-btn queue-btn"
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
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="page === 1"
              @click="changePage(1)"
            >
              <v-icon>mdi-page-first</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="page === 1"
              @click="changePage(page - 1)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="page-indicator">Page {{ page }} of {{ totalPages }}</span>
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="page >= totalPages"
              @click="changePage(page + 1)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="page >= totalPages"
              @click="changePage(totalPages)"
            >
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
              @update:model-value="onItemsPerPageChange"
              class="per-page-select"
            ></v-select>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Applicant Details Dialog -->
  <v-dialog v-model="dialog" max-width="1400px" scrollable>
    <ApplicationCard
      :selectedApplicant="selectedDocument"
      @closeDialog="closeDialog"
    />
  </v-dialog>

  <!-- Merge Dialog -->
  <v-dialog v-model="dialogMerge" max-width="1400px" scrollable>
    <MergeApplicants
      :selectedApplicants="selected"
      @closeDialog="dialogMerge = false"
    />
  </v-dialog>

  <!-- Add to Scholarship Queue Dialog -->
  <v-dialog v-model="scholarshipDialog" max-width="600px">
    <v-card class="modern-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <v-icon class="header-icon" size="24">mdi-school-outline</v-icon>
          <div>
            <h2 class="dialog-title">Add to Scholarship Queue</h2>
            <p class="dialog-subtitle">Select document type to add to queue</p>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="scholarshipDialog = false"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider></v-divider>

      <v-card-text class="dialog-content">
        <v-select
          v-model="selectedDocumentType"
          :items="documentTypeOptions"
          label="Document Type"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-file-document-outline"
        ></v-select>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="scholarshipDialog = false"
          class="cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="addToScholarshipQueue"
          prepend-icon="mdi-check"
          :disabled="!selectedDocumentType"
          class="confirm-btn"
        >
          Add to Queue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar for notifications -->
  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
    location="top"
  >
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
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
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
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

const { data: mavericksData, isLoading, isFetching, refetch } = useQuery({
  queryKey,
  queryFn: async () => {
    const response = await api.post('/get-applicants', {
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      search: searchQuery.value,
    });
    return response.data;
  },
  staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh
  gcTime: 1000 * 60 * 60, // 60 minutes - data stays in cache
  refetchOnWindowFocus: false, // Don't refetch on tab focus
  refetchOnMount: false, // Use cached data if available
  refetchOnReconnect: false, // Don't refetch on network reconnect
});

const items = computed(() => mavericksData.value?.items || []);
const totalItems = computed(() => mavericksData.value?.totalItems || 0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Watch for refresh prop
watch(() => props.refresh, (newValue) => {
      if (newValue) {
    refetch();
  }
});

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
    showSnackbar('Please select a document type', 'error');
        return;
      }

      try {
    const res = await api.post('/local-dash', {
      document_type: selectedDocumentType.value,
      maverick_id: selectedMaverick.value.id,
          instructions: {
        action: 'add_scholarship_queue'
          }
        });

        if (res.data.success) {
      showSnackbar('Successfully added to scholarship queue', 'success');
      scholarshipDialog.value = false;
        } else {
      showSnackbar(res.data.message || 'Failed to add to scholarship queue', 'error');
        }
      } catch (err) {
        console.error(err);
    showSnackbar('Error: ' + (err.response?.data?.detail || err.message), 'error');
  }
};

const showSnackbar = (message, color = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
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
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.filters-section:hover {
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08), 0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
  transform: translateY(-2px);
}

.v-theme--dark .filters-section {
  background: #1E293B;
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
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  flex-wrap: wrap;
  gap: 16px;
}

.v-theme--dark .filters-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1A2332, #151E2E);
}

.filters-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters-icon {
  color: #6366F1;
}

.v-theme--dark .filters-icon {
  color: #818CF8;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .filters-title {
  color: #F9FAFB;
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
  background: #FAFBFC;
}

.v-theme--dark .filters-content {
  background: #151E2E;
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
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
}

.v-theme--dark .table-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1A2332, #151E2E);
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
  max-height: 500px;
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
  color: #3B82F6 !important;
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
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.v-theme--dark .pagination-footer {
  background: #1E293B;
  border-top-color: #334155;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-text {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.v-theme--dark .pagination-text {
  color: #9CA3AF;
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
  color: #D1D5DB;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.per-page-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 500;
}

.v-theme--dark .per-page-label {
  color: #9CA3AF;
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
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .dialog-header {
  background: linear-gradient(to bottom, #1A2332, #151E2E);
  border-bottom-color: #334155;
}

.header-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.header-icon {
  color: #3B82F6;
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
  color: #F9FAFB;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .dialog-subtitle {
  color: #9CA3AF;
}

.close-btn {
  border-radius: 8px !important;
}

.dialog-content {
  padding: 28px !important;
}

.dialog-actions {
  padding: 20px 28px !important;
  background: #FAFBFC;
  border-top: 1px solid #E2E8F0;
}

.v-theme--dark .dialog-actions {
  background: #151E2E;
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
