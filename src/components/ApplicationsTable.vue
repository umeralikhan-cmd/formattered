<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      :server-items-length="totalItems"
      :options.sync="options"
      class="elevation-1"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100]
      }"
    >
      <!-- Full Name -->
      <template v-slot:item.full_name="{ item }">
        <span class="font-weight-medium">{{ item.full_name || 'N/A' }}</span>
      </template>

      <!-- First Name -->
      <template v-slot:item.first_name="{ item }">
        {{ item.first_name || 'N/A' }}
      </template>

      <!-- Last Name -->
      <template v-slot:item.last_name="{ item }">
        {{ item.last_name || 'N/A' }}
      </template>

      <!-- DOC Number -->
      <template v-slot:item.doc_number="{ item }">
        <v-chip v-if="item.doc_number" x-small outlined color="primary">
          {{ item.doc_number }}
        </v-chip>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Facility Name -->
      <template v-slot:item.facility_name="{ item }">
        <div class="text-truncate" style="max-width: 200px;">
          {{ item.facility_name || 'N/A' }}
        </div>
      </template>

      <!-- Document Type -->
      <template v-slot:item.document_type="{ item }">
        <v-chip x-small>
          {{ item.document_type || 'N/A' }}
        </v-chip>
      </template>

      <!-- Maverick Profile ID -->
      <template v-slot:item.maverick_profile_id="{ item }">
        <v-chip
          v-if="item.maverick_profile_id"
          x-small
          outlined
          color="success"
        >
          {{ item.maverick_profile_id }}
        </v-chip>
        <v-chip v-else x-small outlined color="grey">
          None
        </v-chip>
      </template>

      <!-- Facility ID -->
      <template v-slot:item.facility_id="{ item }">
        <v-chip
          v-if="item.facility_id"
          x-small
          outlined
          color="info"
        >
          {{ item.facility_id }}
        </v-chip>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Mailing Address -->
      <template v-slot:item.mailing_address="{ item }">
        <v-btn
          v-if="item.mailing_address"
          icon
          size="small"
          variant="text"
          @click="showMailingAddressDialog(item.mailing_address)"
          class="action-icon-btn"
        >
          <v-icon color="primary">mdi-map-marker-outline</v-icon>
        </v-btn>
        <span v-else class="grey--text">N/A</span>
      </template>

      <!-- Created At -->
      <template v-slot:item.created_at="{ item }">
        <span class="text-caption">{{ formatDate(item.created_at) }}</span>
      </template>

      <!-- Actions -->
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="viewDetails(item)"
          class="action-icon-btn"
        >
          <v-icon color="primary">mdi-eye-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Mailing Address Dialog -->
    <v-dialog v-model="mailingAddressDialog" max-width="600px">
      <v-card class="modern-dialog">
        <div class="dialog-header">
          <div class="header-content">
            <v-icon class="header-icon" size="24">mdi-map-marker-radius</v-icon>
            <div>
              <h2 class="dialog-title">Mailing Address</h2>
              <p class="dialog-subtitle">View complete mailing address details</p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="mailingAddressDialog = false"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider></v-divider>

        <v-card-text class="dialog-content" v-if="selectedMailingAddress">
          <div class="address-details">
            <div
              v-for="(value, key) in selectedMailingAddress"
              :key="key"
              class="address-row"
            >
              <div class="address-label">{{ key }}:</div>
              <div class="address-value">{{ value || 'N/A' }}</div>
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
            <v-icon class="header-icon" size="24">mdi-account-details</v-icon>
            <div>
              <h2 class="dialog-title">Applicant Details</h2>
              <p class="dialog-subtitle">View complete applicant information and documents</p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="detailsDialog = false"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider></v-divider>

        <v-card-text class="details-dialog-content">
          <!-- Loading State -->
          <div v-if="loadingDocuments" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="loading-text">Loading documents...</p>
          </div>

          <!-- Document URLs Section -->
          <div v-if="!loadingDocuments && documentUrls" class="documents-section">
            <div class="section-title-group">
              <v-icon size="20" color="primary">mdi-file-document-multiple-outline</v-icon>
              <h3 class="section-title">Documents</h3>
            </div>

            <!-- Edovo Documents - Show Questions/Answers Table -->
            <div v-if="documentUrls.is_edovo">
              <div v-if="documentUrls.questions && documentUrls.questions.length > 0" class="edovo-table-container">
                <div class="table-header-section">
                  <div class="header-content">
                    <v-icon size="20" color="primary">mdi-comment-question-outline</v-icon>
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
                    'items-per-page-options': [10, 25, 50, -1]
                  }"
                >
                  <template v-slot:item.question_number="{ item }">
                    <v-chip size="small" color="primary" variant="flat" class="question-chip">
                      Q{{ item.question_number }}
                    </v-chip>
                  </template>

                  <template v-slot:item.lesson="{ item }">
                    <span class="lesson-text">{{ item.lesson || 'N/A' }}</span>
                  </template>

                  <template v-slot:item.question="{ item }">
                    <div class="question-text">{{ item.question }}</div>
                  </template>

                  <template v-slot:item.answer="{ item }">
                    <v-chip
                      v-if="item.answer"
                      size="small"
                      variant="flat"
                      color="success"
                      class="answer-chip"
                    >
                      {{ item.answer }}
                    </v-chip>
                    <span v-else class="no-answer-text">No answer</span>
                  </template>
                </v-data-table>
              </div>

              <v-alert v-else type="info" variant="tonal" class="no-data-alert">
                <template #prepend>
                  <v-icon>mdi-information-outline</v-icon>
                </template>
                No questions found for this Edovo document.
              </v-alert>
            </div>

            <!-- Non-Edovo Documents - Show Document/Image Previews -->
            <div v-else class="document-previews">
              <v-row>
                <v-col cols="12" md="6" v-if="documentUrls.document_url">
                  <div class="preview-section">
                    <div class="section-header">
                      <v-icon size="20" color="primary">mdi-file-pdf-box</v-icon>
                      <h3 class="section-title">Document</h3>
                    </div>
                    <div class="iframe-wrapper">
                      <iframe :src="documentUrls.document_url" frameborder="0"></iframe>
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

                <v-col cols="12" md="6" v-if="documentUrls.image_url">
                  <div class="preview-section">
                    <div class="section-header">
                      <v-icon size="20" color="primary">mdi-image-outline</v-icon>
                      <h3 class="section-title">Image</h3>
                    </div>
                    <div class="iframe-wrapper">
                      <iframe :src="documentUrls.image_url" frameborder="0"></iframe>
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

                <v-col cols="12" v-if="!documentUrls.document_url && !documentUrls.image_url">
                  <v-alert type="info" variant="tonal" class="no-data-alert">
                    <template #prepend>
                      <v-icon>mdi-information-outline</v-icon>
                    </template>
                    No documents available for this applicant.
                  </v-alert>
                </v-col>
              </v-row>
            </div>
          </div>

          <v-divider class="section-divider"></v-divider>

          <!-- Applicant Data -->
          <div class="applicant-data-section">
            <div class="section-title-group">
              <v-icon size="20" color="primary">mdi-code-json</v-icon>
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

<script>
import api from '@/plugins/axios';

export default {
  name: 'ApplicationsTable',
  props: {
    searchProp: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchTimeout: null,
      loading: false,
      items: [],
      totalItems: 0,
      options: {
        page: 1,
        itemsPerPage: 500
      },
      headers: [
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
        { title: 'Actions', key: 'actions', sortable: false, width: 100 }
      ],
      mailingAddressDialog: false,
      selectedMailingAddress: null,
      detailsDialog: false,
      selectedApplicant: null,
      loadingDocuments: false,
      documentUrls: null,
      questionHeaders: [
        { title: '#', key: 'question_number', width: 80 },
        { title: 'Lesson', key: 'lesson', width: 150 },
        { title: 'Question', key: 'question', width: 400 },
        { title: 'Answer', key: 'answer', width: 150 }
      ]
    };
  },
  watch: {
    options: {
      handler() {
        this.fetchApplicants();
      },
      deep: true
    },
    searchProp: {
      handler() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.options.page = 1;
          this.fetchApplicants();
        }, 500);
      }
    }
  },
  mounted() {
    this.fetchApplicants();
  },
  methods: {
    async fetchApplicants() {
      this.loading = true;
      try {
        const response = await api.post('/local-dash', {
          instructions: {
            action: 'get_new_applicants'
          },
          page: this.options.page,
          itemsPerPage: this.options.itemsPerPage,
          search: this.searchProp || ''
        });

        this.items = response.data.items || [];
        this.totalItems = response.data.totalItems || 0;
      } catch (error) {
        console.error('Error fetching applicants:', error);
        this.$emit('error', `Failed to fetch applicants: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },
    refreshData() {
      this.fetchApplicants();
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    showMailingAddressDialog(mailingAddress) {
      try {
        if (typeof mailingAddress === 'string') {
          this.selectedMailingAddress = JSON.parse(mailingAddress);
        } else {
          this.selectedMailingAddress = mailingAddress;
        }
        this.mailingAddressDialog = true;
      } catch (e) {
        console.error('Error parsing mailing address:', e);
        this.selectedMailingAddress = { error: 'Invalid mailing address format' };
        this.mailingAddressDialog = true;
      }
    },
    async viewDetails(item) {
      this.selectedApplicant = item;
      this.detailsDialog = true;
      this.documentUrls = null;

      // Fetch document URLs if document_parent_id and document_type exist
      if (item.document_parent_id && item.document_type) {
        await this.fetchDocumentUrls(item.document_parent_id, item.document_type);
      }
    },
    async fetchDocumentUrls(documentParentId, documentType) {
      this.loadingDocuments = true;
      try {
        const response = await api.post('/local-dash', {
          instructions: {
            action: 'get_document'
          },
          document_parent_id: String(documentParentId),
          document_type: documentType
        });

        this.documentUrls = response.data;
      } catch (error) {
        console.error('Error fetching document URLs:', error);
        this.documentUrls = {
          document_url: null,
          image_url: null
        };
      } finally {
        this.loadingDocuments = false;
      }
    }
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
  background: #F3F4F6;
  border-radius: 4px;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #1F2937;
}

:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #D1D5DB;
  border-radius: 4px;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #4B5563;
}

:deep(.v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #9CA3AF;
}

:deep(.v-theme--dark .v-data-table .v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #6B7280;
}

/* Table Headers */
:deep(.v-data-table thead tr th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748B !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  padding: 12px 16px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.3 !important;
  border-bottom: 1px solid #E5E7EB !important;
}

:deep(.v-theme--dark .v-data-table thead tr th) {
  color: #94A3B8 !important;
  background: #0F172A !important;
  border-bottom-color: #334155 !important;
}

/* Table Cells */
:deep(.v-data-table tbody tr td) {
  color: #1E293B !important;
  border-bottom: 1px solid #E5E7EB !important;
  font-size: 0.875rem !important;
  padding: 12px 16px !important;
  vertical-align: top !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  line-height: 1.5 !important;
}

:deep(.v-theme--dark .v-data-table tbody tr td) {
  color: #F9FAFB !important;
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
  background-color: #0F172A;
  color: #E0E7FF;
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
  background-color: #0C1220;
  color: #C7D2FE;
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

/* Address Details */
.address-details {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .address-details {
  background: #1E293B;
  border-color: #334155;
}

.address-row {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #E2E8F0;
  transition: background 0.2s ease;
}

.address-row:last-child {
  border-bottom: none;
}

.address-row:hover {
  background: #F9FAFB;
}

.v-theme--dark .address-row {
  border-bottom-color: #334155;
}

.v-theme--dark .address-row:hover {
  background: #0F172A;
}

.address-label {
  min-width: 140px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748B;
  text-transform: capitalize;
}

.v-theme--dark .address-label {
  color: #94A3B8;
}

.address-value {
  flex: 1;
  font-size: 0.875rem;
  color: #1E293B;
  word-wrap: break-word;
}

.v-theme--dark .address-value {
  color: #F9FAFB;
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
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

.v-theme--dark .loading-text {
  color: #9CA3AF;
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
  color: #F9FAFB;
}

/* Edovo Table Container */
.edovo-table-container {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .edovo-table-container {
  background: #1E293B;
  border-color: #334155;
}

.table-header-section {
  padding: 20px 24px;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.v-theme--dark .table-header-section {
  background: linear-gradient(to bottom, #1A2332, #151E2E);
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
  color: #F9FAFB;
}

/* Edovo Questions Table */
.edovo-questions-table {
  background: transparent !important;
}

:deep(.edovo-questions-table thead tr th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748B !important;
  background: #F9FAFB !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #E5E7EB !important;
}

:deep(.v-theme--dark .edovo-questions-table thead tr th) {
  color: #94A3B8 !important;
  background: #0F172A !important;
  border-bottom-color: #334155 !important;
}

:deep(.edovo-questions-table tbody tr td) {
  color: #1E293B !important;
  border-bottom: 1px solid #E5E7EB !important;
  font-size: 0.875rem !important;
  padding: 12px 16px !important;
  line-height: 1.5 !important;
}

:deep(.v-theme--dark .edovo-questions-table tbody tr td) {
  color: #F9FAFB !important;
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
  color: #6B7280;
}

.v-theme--dark .lesson-text {
  color: #9CA3AF;
}

.answer-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  border-radius: 6px !important;
}

.no-answer-text {
  font-size: 0.8125rem;
  color: #9CA3AF;
  font-style: italic;
}

.v-theme--dark .no-answer-text {
  color: #6B7280;
}

/* Document Previews */
.document-previews {
  margin-top: 12px;
}

.section-divider {
  margin: 32px 0 !important;
  border-color: #E2E8F0 !important;
}

.v-theme--dark .section-divider {
  border-color: #334155 !important;
}

/* Applicant Data Section */
.applicant-data-section {
  margin-top: 24px;
}

.json-preview-wrapper {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .json-preview-wrapper {
  background: #1E293B;
  border-color: #334155;
}

.details-preview {
  background: #0F172A;
  color: #E0E7FF;
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
  background: #0C1220;
  color: #C7D2FE;
}

.details-preview::-webkit-scrollbar {
  width: 8px;
}

.details-preview::-webkit-scrollbar-track {
  background: #1E293B;
  border-radius: 4px;
}

.details-preview::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.details-preview::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}

.no-data-alert {
  border-radius: 12px !important;
  margin-top: 12px;
}

/* Preview Section (for non-Edovo documents) */
.preview-section {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .preview-section {
  background: #1E293B;
  border-color: #334155;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #F9FAFB;
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .section-header {
  background: #0F172A;
  border-bottom-color: #334155;
}

.section-header .section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.v-theme--dark .section-header .section-title {
  color: #F9FAFB;
}

.iframe-wrapper {
  width: 100%;
  height: 500px;
  background: #F3F4F6;
}

.v-theme--dark .iframe-wrapper {
  background: #0F172A;
}

.iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.section-actions {
  padding: 16px 20px;
  border-top: 1px solid #E2E8F0;
  background: #FAFBFC;
}

.v-theme--dark .section-actions {
  border-top-color: #334155;
  background: #151E2E;
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
