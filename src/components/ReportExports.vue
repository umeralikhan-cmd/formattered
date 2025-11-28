<template>
  <v-dialog v-model="dialog" max-width="900" persistent>
    <v-card class="modern-dialog">
      <v-card-title class="modern-dialog-header">
        <div class="dialog-header-content">
          <v-icon class="dialog-header-icon"> mdi-file-export </v-icon>
          <span class="dialog-header-title">{{ dialogTitle }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" class="dialog-close-btn" @click="closeDialog" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="startDate" label="Start Date" type="date" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="endDate" label="End Date" type="date" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="selectedDocumentType"
              :items="document_types"
              label="Document Type"
              variant="outlined"
              density="comfortable"
              @update:model-value="onDocumentTypeChange"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="selectedReportType"
              :items="report_types"
              label="Report Type"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>
        <v-row v-if="selectedDocumentType && documentFields">
          <v-col cols="12">
            <div class="text-subtitle-1 mb-3">Select Fields to Export</div>
            <div v-if="documentFields.items" class="mb-4">
              <div class="text-subtitle-1 mb-2">Items</div>
              <v-row dense>
                <v-col v-for="(value, key) in documentFields.items" :key="'item-' + key" cols="12" sm="6" md="4">
                  <v-checkbox v-model="selectedFields.items[key]" :label="key" density="compact" hide-details />
                </v-col>
              </v-row>
            </div>
            <div v-if="documentFields.quiz" class="mb-4">
              <div class="text-subtitle-1 mb-2">Quiz</div>
              <v-checkbox
                v-model="selectedFields.quiz.score"
                label="Score"
                density="compact"
                hide-details
                class="mb-2"
              />
              <v-text-field
                v-model="quizQuestionsText"
                label="Questions (comma-separated numbers)"
                variant="outlined"
                density="comfortable"
                hint="e.g., 1,2,3,4,5,6,7,8,9,10"
                persistent-hint
              />
            </div>
            <div v-if="documentFields.survey" class="mb-4">
              <div class="text-subtitle-1 mb-2">Survey</div>
              <v-checkbox
                v-model="selectedFields.survey.score"
                label="Score"
                density="compact"
                hide-details
                class="mb-2"
              />
              <v-text-field
                v-model="surveyQuestionsText"
                label="Questions (comma-separated numbers)"
                variant="outlined"
                density="comfortable"
                hint="e.g., 11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32"
                persistent-hint
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog"> Cancel </v-btn>
        <v-btn color="primary" :disabled="!canExport" @click="exportData"> Export </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ReportExports',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    facility: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      startDate: '',
      endDate: '',
      selectedDocumentType: null,
      selectedReportType: 'quarterly',
      document_types: ['Transform Your Hustle'],
      report_types: ['quarterly'],
      documentFields: null,
      selectedFields: {
        items: {},
        quiz: {
          score: false,
          questions: [],
        },
        survey: {
          score: false,
          questions: [],
        },
      },
      quizQuestionsText: '',
      surveyQuestionsText: '',
    };
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    dialogTitle() {
      if (this.facility && this.facility['Facility Name']) {
        return `${this.facility['Facility Name']} - Reports`;
      }
      return 'Reports';
    },
    canExport() {
      return this.startDate && this.endDate && this.selectedDocumentType && this.selectedReportType;
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.resetForm();
      }
    },
  },
  methods: {
    closeDialog() {
      this.$emit('update:modelValue', false);
      this.$emit('close');
    },
    onDocumentTypeChange(documentType) {
      if (documentType === 'Transform Your Hustle') {
        // Mock data from database
        this.documentFields = {
          items: {
            'First Name': true,
            'Last Name': true,
            'Middle Name': true,
            'DOC ID Number': true,
          },
          quiz: {
            score: true,
            questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
          survey: {
            score: true,
            questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
          },
        };

        this.selectedFields = {
          items: { ...this.documentFields.items },
          quiz: {
            score: true,
            questions: [...this.documentFields.quiz.questions],
          },
          survey: {
            score: true,
            questions: [...this.documentFields.survey.questions],
          },
        };

        this.quizQuestionsText = this.documentFields.quiz.questions.join(',');
        this.surveyQuestionsText = this.documentFields.survey.questions.join(',');
      }
    },
    parseQuestions(text) {
      if (!text || !text.trim()) return [];
      return text
        .split(',')
        .map((q) => q.trim())
        .filter((q) => q && !isNaN(q))
        .map((q) => parseInt(q));
    },
    exportData() {
      // Parse questions from text fields
      const quizQuestions = this.parseQuestions(this.quizQuestionsText);
      const surveyQuestions = this.parseQuestions(this.surveyQuestionsText);

      const payload = {
        facility_id: this.facility?.id || null,
        facility_name: this.facility?.['Facility Name'] || null,
        document_type: this.selectedDocumentType,
        report_type: this.selectedReportType,
        date_range: {
          start_date: this.startDate,
          end_date: this.endDate,
        },
        fields: {
          items: this.selectedFields.items,
          quiz: {
            score: this.selectedFields.quiz.score,
            questions: quizQuestions,
          },
          survey: {
            score: this.selectedFields.survey.score,
            questions: surveyQuestions,
          },
        },
      };

      console.log('Export Payload:', payload);

      // Show success message (in real implementation, this would call API)
      this.$emit('export-success', payload);
      this.closeDialog();
    },
    resetForm() {
      this.startDate = '';
      this.endDate = '';
      this.selectedDocumentType = null;
      this.selectedReportType = 'quarterly';
      this.documentFields = null;
      this.selectedFields = {
        items: {},
        quiz: {
          score: false,
          questions: [],
        },
        survey: {
          score: false,
          questions: [],
        },
      };
      this.quizQuestionsText = '';
      this.surveyQuestionsText = '';
    },
  },
};
</script>

<style scoped>
.text-subtitle-1 {
  font-weight: 500;
}

.text-subtitle-2 {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
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
  padding: 20px 24px !important;
  background: linear-gradient(to right, #3b82f6 0%, #6366f1 100%) !important;
  color: white !important;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header-icon {
  font-size: 1.75rem !important;
  color: white !important;
}

.dialog-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.dialog-close-btn {
  color: white !important;
}

:deep(.v-card-text) {
  padding: 24px !important;
}

:deep(.v-card-actions) {
  padding: 16px 24px !important;
  border-top: 1px solid #e2e8f0;
}

:deep(.v-theme--dark .v-card-actions) {
  border-top-color: #334155;
}

/* Responsive */
@media (max-width: 768px) {
  .dialog-header-title {
    font-size: 1.125rem;
  }

  :deep(.v-card-text) {
    padding: 16px !important;
  }
}
</style>
