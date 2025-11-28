<template>
  <v-card class="export-card">
    <!-- Header -->
    <div class="export-header">
      <div class="header-content">
        <v-icon class="header-icon"> mdi-download </v-icon>
        <h2 class="export-title">Export</h2>
      </div>
      <v-btn icon="mdi-close" variant="text" size="small" class="close-btn" @click="$emit('close')" />
    </div>

    <!-- Info Bar -->
    <div class="info-bar">
      <div class="info-item">
        <v-icon size="20" class="info-icon"> mdi-file-document </v-icon>
        <span class="info-label">Document Type:</span>
        <span class="info-value">{{ questionType }}</span>
      </div>
      <div class="info-item">
        <v-icon size="20" class="info-icon"> mdi-account-multiple </v-icon>
        <span class="info-label">Selected:</span>
        <span class="info-value">{{ applicants.length }} Applicants</span>
      </div>
    </div>

    <v-divider />

    <v-card-text class="export-content">
      <!-- Export Type Selection -->
      <div class="selection-section">
        <h3 class="section-title">Select Export Type</h3>
        <v-autocomplete
          v-model="selectedType"
          :items="availableExportTypes"
          label="Select Export Type"
          return-object
          item-title="name"
          item-value="id"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-file-export"
          @update:model-value="onTypeSelect"
        />
      </div>

      <!-- Export Fields Card -->
      <div class="fields-card">
        <div class="fields-header">
          <v-icon class="fields-icon"> mdi-checkbox-multiple-marked </v-icon>
          <h3 class="fields-title">Export Fields</h3>
          <v-chip size="small" color="primary" variant="flat" class="selected-count">
            {{ selectedFields.length }} selected
          </v-chip>
        </div>

        <div class="fields-content">
          <v-row>
            <v-col v-for="(chunk, chunkIndex) in allFieldChunks" :key="chunkIndex" cols="12" md="4">
              <v-checkbox
                v-for="field in chunk"
                :key="field.id"
                v-model="selectedFields"
                :disabled="questionType == 'All' && field.id === 'answers'"
                :value="field.id"
                :label="field.name"
                hide-details
                color="primary"
                density="comfortable"
                class="field-checkbox"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Actions -->
        <div class="fields-actions">
          <v-btn variant="outlined" color="error" prepend-icon="mdi-delete" @click="deleteItemsDialog = true">
            Delete Selected
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            size="large"
            :disabled="!selectedFields.length"
            :loading="loading"
            prepend-icon="mdi-download"
            @click="exportData"
          >
            Export Data
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteItemsDialog" max-width="500px" persistent>
    <v-card class="delete-dialog">
      <div class="delete-dialog-header">
        <v-icon color="#EF4444" size="48" class="mb-3"> mdi-alert-circle </v-icon>
        <h3 class="delete-dialog-title">Delete Selected Documents</h3>
      </div>

      <v-card-text class="delete-dialog-text">
        Are you sure you want to delete the selected <strong>{{ applicants.length }}</strong> documents?
        <p class="text-body-2 text-warning mt-4 py-2">
          <v-icon size="small" class="mr-1"> mdi-alert </v-icon>
          This action cannot be undone!
        </p>
      </v-card-text>

      <v-card-actions class="delete-dialog-actions">
        <v-btn variant="outlined" :disabled="deleteLoading" @click="deleteItemsDialog = false"> Cancel </v-btn>
        <v-spacer />
        <v-btn
          :disabled="deleteLoading || countdown > 0"
          color="error"
          variant="elevated"
          :loading="deleteLoading"
          @click="deleteItems"
        >
          Delete {{ countdown > 0 ? `(${countdown})` : '' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/plugins/axios';

export default {
  name: 'Exports',
  props: {
    applicants: {
      type: Array,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'documentDeleted'],
  data() {
    return {
      deleteItemsDialog: false,
      deleteLoading: false,
      selectedType: null,
      selectedFields: [],
      loading: false,
      countdown: 0,
      countdownTimer: null,
      allFields: [
        { id: 'first_name', name: 'First Name' },
        { id: 'last_name', name: 'Last Name' },
        { id: 'middle_name', name: 'Middle Name' },
        { id: 'type', name: 'Type' },
        { id: 'document_name', name: 'Document Name' },
        { id: 'mark', name: 'Mark' },
        { id: 'date_created', name: 'Date Created' },
        { id: 'inmate_number', name: 'Inmate Number' },
        { id: 'date_of_birth', name: 'Date of Birth' },
        { id: 'facility_name', name: 'Facility Name' },
        { id: 'facility_id', name: 'Facility ID' },
        { id: 'mailing_address', name: 'Mailing Address' },
        { id: 'answers', name: 'Answers' },
        { id: 'date_created', name: 'Date Created' },
        { id: 'Mandatory', name: 'Marks Mandatory' },
        { id: 'Survey', name: 'Marks Survey' },
        { id: 'Application', name: 'Marks Application' },
      ],
      exportTypes: [
        {
          id: 'basic',
          name: 'Basic Information',
          fieldIds: ['first_name', 'last_name', 'middle_name', 'inmate_number', 'date_of_birth', 'facility_name'],
        },
        {
          id: 'assessment',
          name: 'Assessment Results',
          fieldIds: [
            'first_name',
            'last_name',
            'inmate_number',
            'date_created',
            'Mandatory',
            'Survey',
            'Application',
            'type',
          ],
        },
        {
          id: 'custom',
          name: 'Custom',
          fieldIds: [
            'first_name',
            'last_name',
            'middle_name',
            'inmate_number',
            'date_of_birth',
            'facility_name',
            'facility_id',
            'mailing_address',
            'Mandatory',
            'date_created',
          ],
        },
        {
          id: 'statistics',
          name: 'Statistics',
          fieldIds: [
            'first_name',
            'last_name',
            'middle_name',
            'inmate_number',
            'facility_name',
            'answers',
            'Mandatory',
            'Survey',
            'Application',
          ],
        },
      ],
    };
  },
  computed: {
    availableExportTypes() {
      if (this.questionType.toLowerCase() === 'all') {
        return this.exportTypes.filter((type) => type.id !== 'statistics');
      }
      return this.exportTypes;
    },
    allFieldChunks() {
      const chunkSize = Math.ceil(this.allFields.length / 3);
      const chunks = [];
      for (let i = 0; i < this.allFields.length; i += chunkSize) {
        chunks.push(this.allFields.slice(i, i + chunkSize));
      }
      return chunks;
    },
  },
  watch: {
    deleteItemsDialog(newVal) {
      if (newVal) {
        this.startCountdown();
      } else {
        this.clearCountdown();
      }
    },
  },
  methods: {
    startCountdown() {
      this.clearCountdown();
      this.countdown = 5;
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.clearCountdown();
        }
      }, 1000);
    },

    clearCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      this.countdown = 0;
    },

    async deleteItems() {
      const documentIDS = this.applicants.map((app) => app.document_id);
      this.deleteLoading = true;
      try {
        const res = await api.post('/delete-selected-documents', {
          document_id: documentIDS,
        });
        if (res.status === 200) {
          this.deleteItemsDialog = false;
          this.deleteLoading = false;
          this.$emit('documentDeleted', documentIDS);
        }
      } catch (err) {
        console.error(err);
        this.deleteLoading = false;
      }
    },

    onTypeSelect() {
      if (this.selectedType) {
        this.selectedFields = [...this.selectedType.fieldIds];
      } else {
        this.selectedFields = [];
      }
    },

    async exportData() {
      if (!this.selectedFields.length) {
        return;
      }

      this.loading = true;

      try {
        let exportData;

        if (this.selectedType && this.selectedType.id === 'statistics') {
          const response = await api.post('/get-statistics', {
            questionType: this.questionType,
            documentIds: this.applicants.map((app) => app.document_id),
          });

          exportData = this.transformStatisticsData(response.data);
        } else {
          exportData = this.applicants.map((applicant) => {
            const data = {};
            this.selectedFields.forEach((field) => {
              if (field === 'Mandatory' || field === 'Survey' || field === 'Application') {
                const mark = applicant.marks?.find((m) => m.variant === field);
                data[field] = mark ? mark.score : '0.00';
              } else {
                data[field] = applicant[field] || '';
              }
            });
            return data;
          });
        }

        const csvContent = this.convertToCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const fileName = this.selectedType
          ? `${this.selectedType.name}-${this.questionType}-export.csv`
          : `${this.questionType}-export.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting data:', error);
      } finally {
        this.loading = false;
      }
    },

    transformStatisticsData(statisticsResponse) {
      const { documents } = statisticsResponse;
      const maxQuestions = Math.max(...documents.map((doc) => doc.answers.length));

      return documents.map((doc) => {
        const applicant = this.applicants.find((app) => app.document_id === doc.document_id);
        const data = {};

        this.selectedFields.forEach((field) => {
          if (field === 'first_name') {
            data[field] = applicant?.first_name || '';
          } else if (field === 'last_name') {
            data[field] = applicant?.last_name || '';
          } else if (field === 'middle_name') {
            data[field] = applicant?.middle_name || '';
          } else if (field === 'inmate_number') {
            data[field] = applicant?.inmate_number || '';
          } else if (field === 'facility_name') {
            data[field] = applicant?.facility_name || '';
          } else if (field === 'date_created') {
            data[field] = applicant?.date_created || '';
          } else if (field === 'type') {
            data[field] = applicant?.type || '';
          } else if (field === 'document_name') {
            data[field] = applicant?.document_name || '';
          } else if (field === 'Mandatory' || field === 'Survey' || field === 'Application') {
            const mark = applicant?.marks?.find((m) => m.variant === field);
            data[field] = mark ? mark.score : '0.00';
          }
        });

        if (this.selectedFields.includes('answers')) {
          doc.answers.forEach((answerObj) => {
            const questionNum = Object.keys(answerObj)[0];
            const answer = Object.values(answerObj)[0];
            data[`Question ${questionNum}`] = answer;
          });

          for (let i = 1; i <= maxQuestions; i++) {
            if (!data[`Question ${i}`]) {
              data[`Question ${i}`] = '';
            }
          }
        }

        return data;
      });
    },

    convertToCSV(data) {
      if (data.length === 0) {
        return '';
      }

      const allHeaders = new Set();
      data.forEach((row) => {
        Object.keys(row).forEach((key) => allHeaders.add(key));
      });

      const headers = Array.from(allHeaders).sort((a, b) => {
        if (a.startsWith('Question') && b.startsWith('Question')) {
          const aNum = parseInt(a.replace('Question ', ''));
          const bNum = parseInt(b.replace('Question ', ''));
          return aNum - bNum;
        }
        if (a.startsWith('Question')) return 1;
        if (b.startsWith('Question')) return -1;
        return a.localeCompare(b);
      });

      const headerRow = headers.join(',');

      const rows = data.map((row) => {
        return headers
          .map((header) => {
            let value = row[header] || '';
            if (typeof value === 'string' && value.includes(',')) {
              value = `"${value}"`;
            }
            return value;
          })
          .join(',');
      });

      return [headerRow, ...rows].join('\n');
    },
  },
};
</script>

<style scoped>
.export-card {
  border-radius: 16px !important;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
}

.v-theme--dark .export-header {
  background: linear-gradient(to bottom, #0f172a, #1e293b);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #3b82f6;
  font-size: 28px;
}

.export-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.v-theme--dark .export-title {
  color: #f9fafb;
}

.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

/* Info Bar */
.info-bar {
  display: flex;
  gap: 32px;
  padding: 16px 24px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .info-bar {
  background: rgba(59, 130, 246, 0.1);
  border-bottom-color: #334155;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #3b82f6;
}

.info-label {
  font-weight: 500;
  color: #64748b;
  font-size: 0.875rem;
}

.v-theme--dark .info-label {
  color: #94a3b8;
}

.info-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.875rem;
}

.v-theme--dark .info-value {
  color: #f9fafb;
}

/* Content */
.export-content {
  padding: 24px !important;
}

/* Selection Section */
.selection-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.v-theme--dark .section-title {
  color: #f9fafb;
}

/* Fields Card */
.fields-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.v-theme--dark .fields-card {
  background: #1e293b;
  border-color: #334155;
}

.fields-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.fields-icon {
  font-size: 24px;
}

.fields-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  flex-grow: 1;
}

.selected-count {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  font-weight: 600;
}

.fields-content {
  padding: 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .fields-content {
  background: #0f172a;
  border-bottom-color: #334155;
}

.field-checkbox {
  margin-bottom: 8px !important;
}

:deep(.field-checkbox .v-label) {
  font-size: 0.875rem;
  color: #475569;
}

:deep(.v-theme--dark .field-checkbox .v-label) {
  color: #cbd5e1;
}

.fields-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
}

.v-theme--dark .fields-actions {
  background: #1e293b;
}

/* Delete Dialog */
.delete-dialog {
  border-radius: 16px !important;
  text-align: center;
}

.delete-dialog-header {
  padding: 32px 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ef4444;
  margin: 0;
}

.v-theme--dark .delete-dialog-title {
  color: #fca5a5;
}

.delete-dialog-text {
  padding: 16px 32px !important;
  font-size: 1rem;
  color: #475569;
}

.v-theme--dark .delete-dialog-text {
  color: #cbd5e1;
}

.delete-dialog-text strong {
  color: #1e293b;
  font-weight: 700;
}

.v-theme--dark .delete-dialog-text strong {
  color: #f9fafb;
}

.delete-dialog-actions {
  padding: 16px 32px 32px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .export-header {
    padding: 16px;
  }

  .info-bar {
    flex-direction: column;
    gap: 12px;
  }

  .export-content {
    padding: 16px !important;
  }

  .fields-content {
    padding: 16px;
  }

  .fields-actions {
    flex-direction: column;
  }

  .fields-actions .v-btn,
  .fields-actions v-btn {
    width: 100%;
  }
}
</style>
