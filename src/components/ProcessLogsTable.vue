<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="logs"
      class="elevation-1"
      :items-per-page="10"
      :footer-props="{ 'items-per-page-options': [10, 25, 50, 100] }"
    >
      <template #item.parent_id="{ item }">
        {{ item.parent_id || 'N/A' }}
      </template>
      <!-- First Name -->
      <template #item.first_name="{ item }">
        {{ item.maverick_info?.Name_first || 'N/A' }}
      </template>

      <!-- Last Name -->
      <template #item.last_name="{ item }">
        {{ item.maverick_info?.Name_last || 'N/A' }}
      </template>

      <!-- Facility Name -->
      <template #item.facility_name="{ item }">
        <div>
          {{ item.maverick_info?.['Last Known Facility Name'] || 'N/A' }}
          <span v-if="item.maverick_info?.facility_name_source" style="font-size: 0.75em; margin-left: 6px">
            <sub>{{ item.maverick_info.facility_name_source }}</sub>
          </span>
        </div>
      </template>
      <!-- Payer -->
      <template #item.payer="{ item }">
        {{ item.maverick_info?.payer || 'N/A' }}
      </template>

      <!-- Logs -->
      <template #item.logs="{ item }">
        <div class="logs-chips-wrapper">
          <template v-for="(entries, key) in item.logs" :key="key">
            <v-menu location="bottom" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  size="small"
                  :color="getStatusColor(entries[0]?.status)"
                  class="log-chip"
                  @click="showData(entries)"
                >
                  <v-progress-circular
                    v-if="
                      regenerateLoading[`${item.parent_id}_${key}`] ||
                      (key === 'exam' &&
                        (regenerateLoading[`${item.parent_id}_certificate`] ||
                          regenerateLoading[`${item.parent_id}_report`]))
                    "
                    indeterminate
                    size="14"
                    width="2"
                    class="mr-1"
                  />
                  <span class="chip-text">{{ key }}</span>
                </v-chip>
              </template>

              <v-card class="log-detail-card" max-width="500">
                <div class="log-detail-header">
                  <div class="header-content">
                    <v-icon size="20" :color="getStatusColor(entries[0]?.status)"> mdi-clipboard-text-outline </v-icon>
                    <h3 class="log-detail-title">{{ key }} Details</h3>
                  </div>
                </div>

                <v-divider />

                <v-card-text class="log-detail-content">
                  <div v-if="entries.length === 0" class="no-logs-message">
                    <v-icon size="32" color="grey"> mdi-information-outline </v-icon>
                    <p>No logs found</p>
                  </div>
                  <div v-else class="logs-list">
                    <div v-for="(log, i) in entries" :key="i" class="log-entry">
                      <div class="log-timestamp">
                        <v-icon size="14"> mdi-clock-outline </v-icon>
                        {{ formatDate(log.date_created) }}
                      </div>
                      <div class="log-details">
                        <div class="log-row">
                          <span class="log-label">Status:</span>
                          <v-chip size="x-small" :color="getStatusColor(log.status)" class="status-chip">
                            {{ log.status }}
                          </v-chip>
                        </div>
                        <div class="log-row">
                          <span class="log-label">Action:</span>
                          <span class="log-value">{{ log.action }}</span>
                        </div>
                        <div class="log-row full-width">
                          <span class="log-label">Message:</span>
                          <span class="log-message">{{ log.data || 'N/A' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Regenerate button for certificate and report -->
                  <div v-if="key === 'certificate' || key === 'report'" class="action-buttons">
                    <v-btn
                      variant="flat"
                      color="primary"
                      :loading="regenerateLoading[`${item.parent_id}_${key}`]"
                      :disabled="regenerateLoading[`${item.parent_id}_${key}`]"
                      block
                      prepend-icon="mdi-refresh"
                      class="regenerate-btn"
                      @click="regenerateDocument(item, key)"
                    >
                      Regenerate {{ key }}
                    </v-btn>
                  </div>

                  <!-- Generate buttons for exam when certificate/report missing -->
                  <div v-if="key === 'exam'" class="action-buttons">
                    <v-btn
                      v-if="!item.logs.certificate"
                      variant="flat"
                      color="success"
                      :loading="regenerateLoading[`${item.parent_id}_certificate`]"
                      :disabled="regenerateLoading[`${item.parent_id}_certificate`]"
                      block
                      prepend-icon="mdi-certificate"
                      class="generate-btn mb-2"
                      @click="regenerateDocument(item, 'certificate')"
                    >
                      Generate Certificate
                    </v-btn>
                    <v-btn
                      v-if="!item.logs.report"
                      variant="flat"
                      color="info"
                      :loading="regenerateLoading[`${item.parent_id}_report`]"
                      :disabled="regenerateLoading[`${item.parent_id}_report`]"
                      block
                      prepend-icon="mdi-file-document"
                      class="generate-btn mb-2"
                      @click="regenerateDocument(item, 'report')"
                    >
                      Generate Report
                    </v-btn>
                    <v-btn
                      variant="flat"
                      color="warning"
                      :loading="regenerateLoading[`${item.parent_id}_queue_logs`]"
                      :disabled="regenerateLoading[`${item.parent_id}_queue_logs`]"
                      block
                      prepend-icon="mdi-clipboard-text"
                      class="generate-btn"
                      @click="regenerateDocument(item, 'queue_logs')"
                    >
                      Generate Queue Log
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </div>
      </template>

      <!-- View Button -->
      <template #item.view="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          :loading="viewLoading[item.parent_id]"
          class="view-btn"
          @click="viewDocument(item)"
        >
          <v-icon color="primary"> mdi-eye-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- View Document Dialog -->
    <v-dialog v-model="viewDialog" max-width="1400" :persistent="false">
      <v-card class="modern-dialog">
        <div class="dialog-header">
          <div class="header-content">
            <v-icon class="header-icon" size="24"> mdi-file-document-outline </v-icon>
            <div>
              <h2 class="dialog-title">View Document</h2>
              <p class="dialog-subtitle">Preview document and image files</p>
            </div>
          </div>
          <v-btn icon variant="text" class="close-btn" @click="viewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text v-if="documentData" class="dialog-content">
          <v-row>
            <!-- Document URL -->
            <v-col v-if="documentData.document_url" cols="12" md="6">
              <div class="preview-section">
                <div class="section-header">
                  <v-icon size="20" color="primary"> mdi-file-pdf-box </v-icon>
                  <h3 class="section-title">Document</h3>
                </div>
                <div class="iframe-wrapper">
                  <iframe :src="documentData.document_url" frameborder="0" />
                </div>
                <div class="section-actions">
                  <v-btn
                    variant="outlined"
                    :href="documentData.document_url"
                    target="_blank"
                    prepend-icon="mdi-open-in-new"
                    class="action-btn"
                  >
                    Open in New Tab
                  </v-btn>
                </div>
              </div>
            </v-col>

            <!-- Image URL -->
            <v-col v-if="documentData.image_url" cols="12" md="6">
              <div class="preview-section">
                <div class="section-header">
                  <v-icon size="20" color="primary"> mdi-image-outline </v-icon>
                  <h3 class="section-title">Image</h3>
                </div>
                <div class="iframe-wrapper">
                  <iframe :src="documentData.image_url" frameborder="0" />
                </div>
                <div class="section-actions">
                  <v-btn
                    variant="outlined"
                    :href="documentData.image_url"
                    target="_blank"
                    prepend-icon="mdi-open-in-new"
                    class="action-btn"
                  >
                    Open in New Tab
                  </v-btn>
                </div>
              </div>
            </v-col>

            <!-- Message if no URLs -->
            <v-col v-if="!documentData.document_url && !documentData.image_url" cols="12">
              <p class="text-body-2 text-grey text-center py-4">
                <v-icon size="small" class="mr-1"> mdi-information-outline </v-icon>
                No document or image URLs available
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/plugins/axios';
export default {
  name: 'ProcessLogsTable',
  props: {
    tabName: {
      type: String,
      required: true,
    },
    logs: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      headers: [
        { title: 'Parent ID', key: 'parent_id', width: 150 },
        { title: 'First Name', key: 'first_name', width: 150 },
        { title: 'Last Name', key: 'last_name', width: 150 },
        { title: 'Facility Name', key: 'facility_name', width: 250 },
        { title: 'Payer', key: 'payer', width: 200 },
        { title: 'Logs', key: 'logs', width: 400 },
        { title: 'View', key: 'view', width: 100, sortable: false },
      ],
      viewLoading: {},
      viewDialog: false,
      documentData: null,
      regenerateLoading: {},
    };
  },
  methods: {
    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case 'complete':
          return 'success';
        case 'pending':
          return 'warning';
        case 'error':
        case 'failed':
          return 'error';
        default:
          return 'grey';
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    showData(entries) {
      console.log('Log Entries:', entries);
      // Placeholder for any additional logic when a chip is clicked
    },
    async viewDocument(item) {
      const parentId = item.parent_id;
      const documentType = item.document_type;

      if (!parentId || !documentType) {
        console.error('Missing parent_id or document_type');
        return;
      }

      this.viewLoading[parentId] = true;

      try {
        const result = await api.post('/local-dash', {
          document_parent_id: parentId.toString(),
          document_type: documentType,
          instructions: {
            action: 'get_document',
          },
        });

        this.documentData = {
          is_edovo: result.data.is_edovo,
          document_url: result.data.document_url,
          image_url: result.data.image_url,
        };
        console.log('View document response:', this.documentData);
        this.viewDialog = true;
      } catch (error) {
        console.error('Error viewing document:', error);
        alert('Failed to view document. Please check console for details.');
      } finally {
        this.viewLoading[parentId] = false;
      }
    },
    async regenerateDocument(item, action) {
      const loadingKey = `${item.parent_id}_${action}`;
      const parentId = item.parent_id;
      const documentType = item.document_type;
      const maverickId = item.maverick_info?.id;

      if (!parentId || !documentType) {
        console.error('Missing parent_id or document_type');
        return;
      }

      if (!maverickId) {
        return;
      }

      this.regenerateLoading[loadingKey] = true;

      try {
        const response = await api.post('/local-dash', {
          action_type: action,
          parent_id: parentId.toString(),
          document_type: documentType,
          maverick_id: item.maverick_info?.id,
          instructions: {
            action: 'generate_report_document',
          },
        });
        console.log('Regenerate document raw response:', response);

        if (response.data.success) {
          // Emit refresh to reload the logs
          this.$emit('refresh');
        }
      } catch (error) {
        console.error('Error regenerating document:', error);
      } finally {
        this.regenerateLoading[loadingKey] = false;
      }
    },
  },
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
  background: #f9fafb !important;
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
  border-radius: 8px !important;
}

/* View Button */
.view-btn {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.08) !important;
}

/* View Dialog */
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

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.v-theme--dark .section-title {
  color: #f9fafb;
}

.iframe-wrapper {
  width: 100%;
  height: 600px;
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
}

.no-data-alert {
  border-radius: 12px !important;
}

/* Log Chips */
.logs-chips-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.log-chip {
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
}

.log-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.chip-text {
  text-transform: capitalize;
  font-size: 0.8125rem;
}

/* Log Detail Card */
.log-detail-card {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.log-detail-header {
  padding: 16px 20px;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .log-detail-header {
  background: linear-gradient(to bottom, #1a2332, #151e2e);
  border-bottom-color: #334155;
}

.log-detail-header .header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-detail-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  text-transform: capitalize;
}

.v-theme--dark .log-detail-title {
  color: #f9fafb;
}

.log-detail-content {
  padding: 20px !important;
  max-height: 500px;
  overflow-y: auto;
}

.no-logs-message {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.no-logs-message p {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-entry {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
}

.v-theme--dark .log-entry {
  background: #1e293b;
  border-color: #334155;
}

.log-timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 10px;
  font-weight: 500;
}

.v-theme--dark .log-timestamp {
  color: #9ca3af;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-row.full-width {
  flex-direction: column;
  align-items: flex-start;
}

.log-label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: #374151;
  min-width: 60px;
}

.v-theme--dark .log-label {
  color: #d1d5db;
}

.log-value {
  font-size: 0.8125rem;
  color: #1e293b;
}

.v-theme--dark .log-value {
  color: #f9fafb;
}

.log-message {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.5;
  margin-top: 4px;
  word-wrap: break-word;
}

.v-theme--dark .log-message {
  color: #9ca3af;
}

.status-chip {
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
}

.action-buttons {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v-theme--dark .action-buttons {
  border-top-color: #334155;
}

.regenerate-btn,
.generate-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 10px 20px !important;
  height: auto !important;
  min-height: 40px !important;
}

.gap-2 {
  gap: 8px;
}
</style>
