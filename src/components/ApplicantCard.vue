<template>
  <v-card class="applicant-dialog">
    <!-- Dialog Header -->
    <div class="dialog-header">
      <div class="header-content">
        <v-icon class="header-icon" size="28"> mdi-account-details </v-icon>
        <div>
          <h2 class="dialog-title">Applicant Details</h2>
          <p class="dialog-subtitle">View and edit applicant information</p>
        </div>
      </div>
      <v-btn icon variant="text" class="close-btn" @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <!-- Dialog Content -->
    <v-card-text class="dialog-content">
      <v-row>
        <!-- Left Column: Applicant Details Form -->
        <v-col cols="12" md="4">
          <div class="form-section">
            <h3 class="section-title">
              <v-icon size="20" color="primary"> mdi-account-edit </v-icon>
              Personal Information
            </h3>

            <div class="form-fields">
              <v-text-field
                v-model="selectedApplicant.first_name"
                label="First Name"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-3"
              />

              <v-text-field
                v-model="selectedApplicant.last_name"
                label="Last Name"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-3"
              />

              <v-text-field
                v-model="selectedApplicant.middle_name"
                label="Middle Name"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-3"
              />

              <v-text-field
                v-model="selectedApplicant.inmate_number"
                label="Inmate Number"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-3"
              />

              <v-autocomplete
                v-model="selectedApplicant.facility_id"
                label="Facility Name"
                :items="facilityOptions"
                item-value="facility_id"
                item-title="facility_name"
                variant="outlined"
                density="compact"
                clearable
                hide-details="auto"
                class="mb-3"
                @update:model-value="updateMailingAddress"
              >
                <template #selection="{ item }">
                  <span v-if="item">
                    {{ item.raw.facility_name }}
                  </span>
                </template>

                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.raw.facility_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.facility_address }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <v-text-field
                v-model="selectedApplicant.mailing_address"
                label="Mailing Address"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-4"
              />

              <v-btn
                color="primary"
                variant="flat"
                block
                size="large"
                prepend-icon="mdi-content-save"
                class="save-btn"
                @click="saveChanges"
              >
                Save Changes
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Right Column: Documents List -->
        <v-col cols="12" md="8">
          <div class="documents-section">
            <h3 class="section-title">
              <v-icon size="20" color="primary"> mdi-file-document-multiple </v-icon>
              Documents
            </h3>

            <div v-if="items.length" class="documents-list">
              <div v-for="(item, index) in items" :key="index" class="document-card">
                <div class="document-header">
                  <div class="document-info">
                    <div class="document-name">
                      <v-icon size="18" color="primary"> mdi-file-document </v-icon>
                      {{ item.document.document_name }}
                    </div>
                    <div class="document-meta">
                      <span class="meta-item">
                        <v-icon size="14">mdi-calendar</v-icon>
                        {{ item.document.date_created }}
                      </span>
                      <v-chip
                        :color="item.document.status === 'Completed' ? 'success' : 'info'"
                        size="small"
                        variant="flat"
                      >
                        {{ item.document.status }}
                      </v-chip>
                    </div>
                  </div>
                  <div class="document-actions">
                    <v-btn icon size="small" variant="text" color="primary" @click="toggleIframe(index)">
                      <v-icon>{{ expandedIndex === index ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="text" color="error" @click="deleteDocuentDialog(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>

                <v-expand-transition>
                  <div v-if="expandedIndex === index" class="document-preview">
                    <v-tabs v-model="tab" color="primary" density="compact">
                      <v-tab value="pdf">
                        <v-icon start size="18"> mdi-file-pdf-box </v-icon>
                        Document
                      </v-tab>
                      <v-tab value="image">
                        <v-icon start size="18"> mdi-image </v-icon>
                        Bubble Sheet
                      </v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="tab" class="preview-window">
                      <v-tabs-window-item value="pdf">
                        <iframe
                          :src="`https://drive.google.com/file/d/${item.document.document_id}/preview`"
                          width="100%"
                          height="600"
                          frameborder="0"
                          allowfullscreen
                          class="document-iframe"
                        />
                      </v-tabs-window-item>

                      <v-tabs-window-item value="image">
                        <div v-if="item.image && item.image.image_id">
                          <iframe
                            :src="`https://drive.google.com/file/d/${item.image.image_id}/preview`"
                            width="100%"
                            height="600"
                            frameborder="0"
                            allowfullscreen
                            class="document-iframe"
                          />
                        </div>
                        <div v-else class="no-image">
                          <v-icon size="48" color="grey"> mdi-image-off </v-icon>
                          <p>No bubble sheet available</p>
                        </div>
                      </v-tabs-window-item>
                    </v-tabs-window>
                  </div>
                </v-expand-transition>
              </div>
            </div>

            <div v-else class="no-documents">
              <v-icon size="64" color="grey-lighten-1"> mdi-file-document-off </v-icon>
              <p class="no-documents-text">No documents available</p>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="500">
    <v-card class="modern-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <v-icon class="header-icon" size="24" color="error"> mdi-delete-alert </v-icon>
          <div>
            <h2 class="dialog-title">Delete Document</h2>
            <p class="dialog-subtitle">This action cannot be undone</p>
          </div>
        </div>
      </div>

      <v-divider />

      <v-card-text class="dialog-content"> Are you sure you want to delete this document? </v-card-text>

      <v-divider />

      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" class="cancel-btn" @click="deleteDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="flat" class="confirm-btn" @click="deleteDocumentFunction"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/plugins/axios';

export default {
  name: 'ApplicantCard',
  props: {
    selectedApplicant: {
      type: Object,
    },
  },
  data() {
    return {
      items: [],
      expandedIndex: null,
      tab: 'pdf',
      selectedDocument: null,
      deleteDialog: false,
      facilityOptions: [],
    };
  },
  mounted() {
    this.getApplicants();
    this.getFacilities();
  },
  methods: {
    updateMailingAddress() {
      const selectedFacility = this.facilityOptions.find(
        (facility) => facility.facility_id === this.selectedApplicant.facility_id
      );
      if (selectedFacility) {
        this.selectedApplicant.mailing_address = selectedFacility.facility_address;
      } else {
        this.selectedApplicant.mailing_address = '';
      }
    },
    async getFacilities() {
      try {
        const res = await api.get('/get-facilities');
        this.facilityOptions = res.data.map((facility) => ({
          facility_id: facility.facility_id,
          facility_name: facility.facility_name,
          facility_address: facility.location.line1,
        }));
        this.updateMailingAddress();
      } catch (err) {
        console.error('Error fetching facilities:', err);
      }
    },
    closeDialog() {
      this.$emit('closeDialog');
    },
    deleteDocuentDialog(item) {
      this.selectedDocument = item;
      this.deleteDialog = true;
    },
    async deleteDocumentFunction() {
      try {
        const res = await api.post('/delete-document', {
          document_id: this.selectedDocument.document.document_id,
          image_id: this.selectedDocument.image.image_id,
        });
        if (res.status === 200) {
          this.deleteDialog = false;
          this.getApplicants();
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getApplicants() {
      try {
        const res = await api.get('/get-applicant-details', {
          params: {
            first_name: this.selectedApplicant.first_name,
            last_name: this.selectedApplicant.last_name,
            inmate_number: this.selectedApplicant.inmate_number,
          },
        });
        this.items = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async saveChanges() {
      try {
        const res = await api.post('/update-applicant', this.selectedApplicant);
        if (res.status === 200) {
          this.getApplicants();
        }
      } catch (err) {
        console.error(err);
      }
    },
    toggleIframe(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
  },
};
</script>

<style scoped>
/* Dialog Container */
.applicant-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

/* Dialog Header */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: white !important;
  opacity: 0.95;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.close-btn {
  color: white !important;
}

/* Dialog Content */
.dialog-content {
  padding: 28px !important;
  background: #f8fafc;
}

.v-theme--dark .dialog-content {
  background: #0f172a;
}

/* Form Section */
.form-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.v-theme--dark .form-section {
  background: #1e293b;
  border-color: #334155;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.v-theme--dark .section-title {
  color: #f9fafb;
  border-bottom-color: #334155;
}

.form-fields {
  display: flex;
  flex-direction: column;
}

.save-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  height: auto !important;
  min-height: 44px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
}

/* Documents Section */
.documents-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.v-theme--dark .documents-section {
  background: #1e293b;
  border-color: #334155;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Document Card */
.document-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s ease;
}

.document-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.v-theme--dark .document-card {
  background: #0f172a;
  border-color: #334155;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.document-info {
  flex: 1;
}

.document-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.v-theme--dark .document-name {
  color: #f9fafb;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
}

.v-theme--dark .meta-item {
  color: #9ca3af;
}

.document-actions {
  display: flex;
  gap: 4px;
}

/* Document Preview */
.document-preview {
  margin-top: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.v-theme--dark .document-preview {
  border-top-color: #334155;
}

.preview-window {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.v-theme--dark .preview-window {
  background: #0f172a;
  border-color: #334155;
}

.document-iframe {
  display: block;
  border-radius: 8px;
}

/* No Documents */
.no-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.no-documents-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #9ca3af;
  margin: 0;
}

.v-theme--dark .no-documents-text {
  color: #6b7280;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #9ca3af;
}

/* Modern Delete Dialog */
.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-actions {
  padding: 20px 24px !important;
  background: #fafbfc;
}

.v-theme--dark .dialog-actions {
  background: #151e2e;
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
@media (max-width: 960px) {
  .dialog-header {
    padding: 20px;
  }

  .dialog-content {
    padding: 20px !important;
  }

  .form-section,
  .documents-section {
    padding: 16px;
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
