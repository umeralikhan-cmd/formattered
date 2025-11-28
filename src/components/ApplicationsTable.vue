<template>
  <div>
    <v-data-table
      v-model:page="page"
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      class="elevation-1"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100],
      }"
      @update:items-per-page="(val) => (itemsPerPage = val)"
    >
      <!-- Full Name -->
      <template #item.full_name="{ item }">
        <span class="font-weight-medium">{{ item.full_name || 'N/A' }}</span>
      </template>

      <!-- First Name -->
      <template #item.first_name="{ item }">
        {{ item.first_name || 'N/A' }}
      </template>

      <!-- Last Name -->
      <template #item.last_name="{ item }">
        {{ item.last_name || 'N/A' }}
      </template>

      <!-- DOC Number -->
      <template #item.doc_number="{ item }">
        <v-chip v-if="item.doc_number" x-small outlined color="primary">
          {{ item.doc_number }}
        </v-chip>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Facility Name -->
      <template #item.facility_name="{ item }">
        <div class="text-truncate" style="max-width: 200px">
          {{ item.facility_name || 'N/A' }}
        </div>
      </template>

      <!-- Document Type -->
      <template #item.document_type="{ item }">
        <v-chip x-small>
          {{ item.document_type || 'N/A' }}
        </v-chip>
      </template>

      <!-- Maverick Profile ID -->
      <template #item.maverick_profile_id="{ item }">
        <v-chip v-if="item.maverick_profile_id" x-small outlined color="success">
          {{ item.maverick_profile_id }}
        </v-chip>
        <v-chip v-else x-small outlined color="grey"> None </v-chip>
      </template>

      <!-- Facility ID -->
      <template #item.facility_id="{ item }">
        <v-chip v-if="item.facility_id" x-small outlined color="info">
          {{ item.facility_id }}
        </v-chip>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Mailing Address -->
      <template #item.mailing_address="{ item }">
        <v-btn
          v-if="item.mailing_address"
          icon
          size="small"
          variant="text"
          class="action-icon-btn"
          @click="showMailingAddressDialog(item.mailing_address)"
        >
          <v-icon color="primary"> mdi-map-marker-outline </v-icon>
        </v-btn>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Created At -->
      <template #item.created_at="{ item }">
        <span class="text-caption">{{ formatDate(item.created_at) }}</span>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" class="action-icon-btn" @click="viewDetails(item)">
          <v-icon color="primary"> mdi-eye-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Mailing Address Dialog -->
    <v-dialog v-model="mailingAddressDialog" max-width="600px">
      <v-card class="modern-dialog">
        <div class="dialog-header">
          <div class="header-content">
            <v-icon class="header-icon" size="24"> mdi-map-marker-radius </v-icon>
            <div>
              <h2 class="dialog-title">Mailing Address</h2>
              <p class="dialog-subtitle">View complete mailing address details</p>
            </div>
          </div>
          <v-btn icon variant="text" class="close-btn" @click="mailingAddressDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text v-if="selectedMailingAddress" class="dialog-content">
          <div class="address-details">
            <div v-for="(value, key) in selectedMailingAddress" :key="key" class="address-row">
              <div class="address-label">{{ key }}:</div>
              <div class="address-value">
                {{ value || 'N/A' }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="1600px" scrollable>
      <v-card class="modern-dialog details-dialog">
        <div class="dialog-header">
          <div class="header-content">
            <v-icon class="header-icon" size="24"> mdi-account-details </v-icon>
            <div>
              <h2 class="dialog-title">Applicant Details</h2>
              <p class="dialog-subtitle">View complete applicant information and documents</p>
            </div>
          </div>
          <v-btn icon variant="text" class="close-btn" @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text class="details-dialog-content">
          <!-- Loading State -->
          <div v-if="loadingDocuments" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="loading-text">Loading documents...</p>
          </div>

          <!-- Document URLs Section -->
          <div v-if="!loadingDocuments && documentUrls" class="documents-section">
            <div class="section-title-group">
              <v-icon size="20" color="primary"> mdi-file-document-multiple-outline </v-icon>
              <h3 class="section-title">Documents</h3>
            </div>

            <!-- Edovo Documents - Show Questions/Answers Table -->
            <div v-if="documentUrls.is_edovo">
              <div v-if="documentUrls.questions && documentUrls.questions.length > 0" class="edovo-table-container">
                <div class="table-header-section">
                  <div class="header-content">
                    <v-icon size="20" color="primary"> mdi-comment-question-outline </v-icon>
                    <h4 class="table-section-title">Edovo Questions & Answers</h4>
                  </div>
                  <v-chip size="small" color="primary" variant="flat">
                    {{ documentUrls.questions.length }} Questions
                  </v-chip>
                </div>

                <v-data-table
                  :headers="questionHeaders"
                  :items="documentUrls.questions"
                  :items-per-page="10"
                  class="edovo-questions-table"
                  :footer-props="{
                    'items-per-page-options': [10, 25, 50, -1],
                  }"
                >
                  <template #item.question_number="{ item }">
                    <v-chip size="small" color="primary" variant="flat" class="question-chip">
                      Q{{ item.question_number }}
                    </v-chip>
                  </template>

                  <template #item.lesson="{ item }">
                    <span class="lesson-text">{{ item.lesson || 'N/A' }}</span>
                  </template>

                  <template #item.question="{ item }">
                    <div class="question-text">
                      {{ item.question }}
                    </div>
                  </template>

                  <template #item.answer="{ item }">
                    <v-chip v-if="item.answer" size="small" variant="flat" color="success" class="answer-chip">
                      {{ item.answer }}
                    </v-chip>
                    <span v-else class="no-answer-text">No answer</span>
                  </template>
                </v-data-table>
              </div>

              <p v-else class="text-body-2 text-grey text-center py-4">
                <v-icon size="small" class="mr-1"> mdi-information-outline </v-icon>
                No questions found for this Edovo document.
              </p>
            </div>

            <!-- Non-Edovo Documents - Show Document/Image Previews -->
            <div v-else class="document-previews">
              <v-row>
                <v-col v-if="documentUrls.document_url" cols="12" md="6">
                  <div class="preview-section">
                    <div class="section-header">
                      <v-icon size="20" color="primary"> mdi-file-pdf-box </v-icon>
                      <h3 class="section-title">Document</h3>
                    </div>
                    <div class="iframe-wrapper">
                      <iframe :src="documentUrls.document_url" frameborder="0" />
                    </div>
                    <div class="section-actions">
                      <v-btn
                        variant="outlined"
                        :href="documentUrls.document_url"
                        target="_blank"
                        prepend-icon="mdi-open-in-new"
                        class="action-btn"
                      >
                        Open in New Tab
                      </v-btn>
                    </div>
                  </div>
                </v-col>

                <v-col v-if="documentUrls.image_url" cols="12" md="6">
                  <div class="preview-section">
                    <div class="section-header">
                      <v-icon size="20" color="primary"> mdi-image-outline </v-icon>
                      <h3 class="section-title">Image</h3>
                    </div>
                    <div class="iframe-wrapper">
                      <iframe :src="documentUrls.image_url" frameborder="0" />
                    </div>
                    <div class="section-actions">
                      <v-btn
                        variant="outlined"
                        :href="documentUrls.image_url"
                        target="_blank"
                        prepend-icon="mdi-open-in-new"
                        class="action-btn"
                      >
                        Open in New Tab
                      </v-btn>
                    </div>
                  </div>
                </v-col>

                <v-col v-if="!documentUrls.document_url && !documentUrls.image_url" cols="12">
                  <p class="text-body-2 text-grey text-center py-4">
                    <v-icon size="small" class="mr-1"> mdi-information-outline </v-icon>
                    No documents available for this applicant.
                  </p>
                </v-col>
              </v-row>
            </div>
          </div>

          <v-divider class="section-divider" />

          <!-- Applicant Data -->
          <div class="applicant-data-section">
            <div class="section-title-group">
              <v-icon size="20" color="primary"> mdi-code-json </v-icon>
              <h3 class="section-title">Applicant Data</h3>
            </div>
            <div class="json-preview-wrapper">
              <pre class="details-preview">{{ JSON.stringify(selectedApplicant, null, 2) }}</pre>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import api from '@/plugins/axios';

// Props
const props = defineProps({
  searchProp: {
    type: String,
    default: '',
  },
});

// State
const page = ref(1);
const itemsPerPage = ref(20);
const mailingAddressDialog = ref(false);
const selectedMailingAddress = ref(null);
const detailsDialog = ref(false);
const selectedApplicant = ref(null);
const loadingDocuments = ref(false);
const documentUrls = ref(null);
const searchDebounced = ref('');
const searchTimeout = ref(null);

// Headers
const headers = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'Full Name', key: 'full_name', width: 150 },
  { title: 'First Name', key: 'first_name', width: 120 },
  { title: 'Last Name', key: 'last_name', width: 120 },
  { title: 'DOC #', key: 'doc_number', width: 100 },
  { title: 'Facility', key: 'facility_name', width: 200 },
  { title: 'Document Type', key: 'document_type', width: 150 },
  { title: 'Maverick ID', key: 'maverick_profile_id', width: 120 },
  { title: 'Facility ID', key: 'facility_id', width: 100 },
  { title: 'Mailing', key: 'mailing_address', width: 100 },
  { title: 'Created', key: 'created_at', width: 150 },
  { title: 'Actions', key: 'actions', sortable: false, width: 100 },
];

const questionHeaders = [
  { title: '#', key: 'question_number', width: 80 },
  { title: 'Lesson', key: 'lesson', width: 150 },
  { title: 'Question', key: 'question', width: 400 },
  { title: 'Answer', key: 'answer', width: 150 },
];

// Debounce search
watch(
  () => props.searchProp,
  (newVal) => {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = setTimeout(() => {
      searchDebounced.value = newVal;
      page.value = 1; // Reset to first page on search
    }, 500);
  }
);

// TanStack Query for applicants
const {
  data: applicantsData,
  isLoading: loading,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ['applicants', page, itemsPerPage, searchDebounced],
  queryFn: async () => {
    const response = await api.post('/local-dash', {
      instructions: {
        action: 'get_new_applicants',
      },
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      search: searchDebounced.value || '',
    });
    return response.data;
  },
  staleTime: 1000 * 60 * 3, // 3 minutes - applicants data stays fresh
  gcTime: 1000 * 60 * 15, // 15 minutes in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // ✅ Don't refetch on mount - only when page/search changes
  refetchOnReconnect: false,
  keepPreviousData: true, // Keep previous data while loading new page
});

const items = computed(() => applicantsData.value?.items || []);
const totalItems = computed(() => applicantsData.value?.totalItems || 0);

// Options object for v-data-table compatibility
const options = computed({
  get: () => ({
    page: page.value,
    itemsPerPage: itemsPerPage.value,
  }),
  set: (val) => {
    if (val.page !== undefined) page.value = val.page;
    if (val.itemsPerPage !== undefined) itemsPerPage.value = val.itemsPerPage;
  },
});

// Methods
const refreshData = () => {
  refetch();
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const showMailingAddressDialog = (mailingAddress) => {
  try {
    if (typeof mailingAddress === 'string') {
      selectedMailingAddress.value = JSON.parse(mailingAddress);
    } else {
      selectedMailingAddress.value = mailingAddress;
    }
    mailingAddressDialog.value = true;
  } catch (e) {
    console.error('Error parsing mailing address:', e);
    selectedMailingAddress.value = { error: 'Invalid mailing address format' };
    mailingAddressDialog.value = true;
  }
};

const viewDetails = async (item) => {
  selectedApplicant.value = item;
  detailsDialog.value = true;
  documentUrls.value = null;

  // Fetch document URLs if document_parent_id and document_type exist
  if (item.document_parent_id && item.document_type) {
    await fetchDocumentUrls(item.document_parent_id, item.document_type);
  }
};

const fetchDocumentUrls = async (documentParentId, documentType) => {
  loadingDocuments.value = true;
  try {
    const response = await api.post('/local-dash', {
      instructions: {
        action: 'get_document',
      },
      document_parent_id: String(documentParentId),
      document_type: documentType,
    });

    documentUrls.value = response.data;
  } catch (error) {
    console.error('Error fetching document URLs:', error);
    documentUrls.value = {
      document_url: null,
      image_url: null,
    };
  } finally {
    loadingDocuments.value = false;
  }
};
</script>

<style scoped>
/* Modern Data Table Styling */
:deep(.v-data-table) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.v-data-table .v-data-table__wrapper) {
  overflow-x: auto !important;
  max-height: 500px !important;
  overflow-y: auto !important;
}

/* Custom Scrollbar */
:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #f3f4f6;
  border-radius: 4px;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #1f2937;
}

:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #d1d5db;
  border-radius: 4px;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #4b5563;
}

:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #9ca3af;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #6b7280;
}

/* Table Headers */
:deep(.v-data-table thead tr th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748b !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  padding: 12px 16px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.3 !important;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.v-theme--dark .v-data-table thead tr th) {
  color: #94a3b8 !important;
  background: #0f172a !important;
  border-bottom-color: #334155 !important;
}

/* Table Cells */
:deep(.v-data-table tbody tr td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-size: 0.875rem !important;
  padding: 12px 16px !important;
  vertical-align: top !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  line-height: 1.5 !important;
}

:deep(.v-theme--dark .v-data-table tbody tr td) {
  color: #f9fafb !important;
  border-bottom-color: #334155 !important;
}

/* Table Row Hover */
:deep(.v-data-table tbody tr) {
  transition: all 0.2s ease;
}

:deep(.v-data-table tbody tr:hover) {
  background: rgba(59, 130, 246, 0.03) !important;
}

:deep(.v-theme--dark .v-data-table tbody tr:hover) {
  background: rgba(59, 130, 246, 0.08) !important;
}

/* Chips */
:deep(.v-chip) {
  font-weight: 500 !important;
}

.details-preview {
  background-color: #0f172a;
  color: #e0e7ff;
  padding: 20px;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 13px;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}

.v-theme--dark .details-preview {
  background-color: #0c1220;
  color: #c7d2fe;
}

.question-text {
  max-width: 500px;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

/* Action Icon Buttons */
.action-icon-btn {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.action-icon-btn:hover {
  background: rgba(59, 130, 246, 0.08) !important;
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

/* Address Details */
.address-details {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .address-details {
  background: #1e293b;
  border-color: #334155;
}

.address-row {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s ease;
}

.address-row:last-child {
  border-bottom: none;
}

.address-row:hover {
  background: #f9fafb;
}

.v-theme--dark .address-row {
  border-bottom-color: #334155;
}

.v-theme--dark .address-row:hover {
  background: #0f172a;
}

.address-label {
  min-width: 140px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  text-transform: capitalize;
}

.v-theme--dark .address-label {
  color: #94a3b8;
}

.address-value {
  flex: 1;
  font-size: 0.875rem;
  color: #1e293b;
  word-wrap: break-word;
}

.v-theme--dark .address-value {
  color: #f9fafb;
}

/* Details Dialog */
.details-dialog {
  max-height: 90vh;
}

.details-dialog-content {
  padding: 28px !important;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.v-theme--dark .loading-text {
  color: #9ca3af;
}

/* Documents Section */
.documents-section {
  margin-bottom: 24px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .section-title {
  color: #f9fafb;
}

/* Edovo Table Container */
.edovo-table-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .edovo-table-container {
  background: #1e293b;
  border-color: #334155;
}

.table-header-section {
  padding: 20px 24px;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-theme--dark .table-header-section {
  background: linear-gradient(to bottom, #1a2332, #151e2e);
  border-bottom-color: #334155;
}

.table-header-section .header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.v-theme--dark .table-section-title {
  color: #f9fafb;
}

/* Edovo Questions Table */
.edovo-questions-table {
  background: transparent !important;
}

:deep(.edovo-questions-table thead tr th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748b !important;
  background: #f9fafb !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.v-theme--dark .edovo-questions-table thead tr th) {
  color: #94a3b8 !important;
  background: #0f172a !important;
  border-bottom-color: #334155 !important;
}

:deep(.edovo-questions-table tbody tr td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-size: 0.875rem !important;
  padding: 12px 16px !important;
  line-height: 1.5 !important;
}

:deep(.v-theme--dark .edovo-questions-table tbody tr td) {
  color: #f9fafb !important;
  border-bottom-color: #334155 !important;
}

:deep(.edovo-questions-table tbody tr:hover) {
  background: rgba(59, 130, 246, 0.03) !important;
}

:deep(.v-theme--dark .edovo-questions-table tbody tr:hover) {
  background: rgba(59, 130, 246, 0.08) !important;
}

.question-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  border-radius: 6px !important;
}

.lesson-text {
  font-size: 0.8125rem;
  color: #6b7280;
}

.v-theme--dark .lesson-text {
  color: #9ca3af;
}

.answer-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  border-radius: 6px !important;
}

.no-answer-text {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-style: italic;
}

.v-theme--dark .no-answer-text {
  color: #6b7280;
}

/* Document Previews */
.document-previews {
  margin-top: 12px;
}

.section-divider {
  margin: 32px 0 !important;
  border-color: #e2e8f0 !important;
}

.v-theme--dark .section-divider {
  border-color: #334155 !important;
}

/* Applicant Data Section */
.applicant-data-section {
  margin-top: 24px;
}

.json-preview-wrapper {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .json-preview-wrapper {
  background: #1e293b;
  border-color: #334155;
}

.details-preview {
  background: #0f172a;
  color: #e0e7ff;
  padding: 24px;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.v-theme--dark .details-preview {
  background: #0c1220;
  color: #c7d2fe;
}

.details-preview::-webkit-scrollbar {
  width: 8px;
}

.details-preview::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

.details-preview::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.details-preview::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.no-data-alert {
  border-radius: 12px !important;
  margin-top: 12px;
}

/* Preview Section (for non-Edovo documents) */
.preview-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .preview-section {
  background: #1e293b;
  border-color: #334155;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .section-header {
  background: #0f172a;
  border-bottom-color: #334155;
}

.section-header .section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.v-theme--dark .section-header .section-title {
  color: #f9fafb;
}

.iframe-wrapper {
  width: 100%;
  height: 500px;
  background: #f3f4f6;
}

.v-theme--dark .iframe-wrapper {
  background: #0f172a;
}

.iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.section-actions {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fafbfc;
}

.v-theme--dark .section-actions {
  border-top-color: #334155;
  background: #151e2e;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
}
</style>
