<template>
  <v-card class="merge-dialog">
    <!-- Header -->
    <div class="dialog-header">
      <div class="header-content">
        <v-icon class="header-icon" size="28">mdi-merge</v-icon>
        <div>
          <h2 class="dialog-title">Merge Applicants</h2>
          <p class="dialog-subtitle">Combine {{ selectedApplicants.length }} applicant records into one</p>
        </div>
      </div>
      <v-btn
        icon
        variant="text"
        @click="closeDialog"
        class="close-btn"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider></v-divider>

    <v-card-text class="dialog-content">
      <!-- Merged Applicant Details -->
      <div class="merged-section">
        <div class="section-header">
          <v-icon color="primary" size="20">mdi-account-edit</v-icon>
          <h3 class="section-title">Merged Applicant Details</h3>
        </div>

        <div class="form-grid">
          <v-text-field
            v-model="mergedApplicant.first_name"
            label="First Name"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
          ></v-text-field>

          <v-text-field
            v-model="mergedApplicant.last_name"
            label="Last Name"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
          ></v-text-field>

          <v-text-field
            v-model="mergedApplicant.middle_name"
            label="Middle Name"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
          ></v-text-field>

          <v-text-field
            v-model="mergedApplicant.inmate_number"
            label="Inmate Number"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-numeric"
          ></v-text-field>

          <v-autocomplete
            label="Facility Name"
            v-model="mergedApplicant.facility_id"
            :items="facilityOptions"
            item-value="facility_id"
            item-title="facility_name"
            variant="outlined"
            density="comfortable"
            clearable
            prepend-inner-icon="mdi-domain"
            @update:model-value="updateMailingAddress"
          >
            <template v-slot:selection="{ item }">
              <span v-if="item">
                {{ item.raw.facility_name }}
              </span>
            </template>

            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.facility_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.facility_address }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            v-model="mergedApplicant.mailing_address"
            label="Mailing Address"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-map-marker"
          ></v-text-field>
        </div>
      </div>

      <v-divider class="my-6"></v-divider>

      <!-- Source Applicants -->
      <div class="source-section">
        <div class="section-header">
          <v-icon color="primary" size="20">mdi-account-multiple</v-icon>
          <h3 class="section-title">Source Applicants (Click to Select Values)</h3>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <p class="loading-text">Loading applicant data...</p>
        </div>

        <!-- Applicants List -->
        <div v-else-if="applicantsWithDocuments.length > 0" class="applicants-list">
          <v-card
            v-for="(applicant, index) in applicantsWithDocuments"
            :key="index"
            class="applicant-card"
          >
            <div class="applicant-header">
              <v-chip color="primary" variant="tonal" size="small">
                Applicant {{ index + 1 }}
              </v-chip>
            </div>

            <div class="applicant-content">
              <!-- Applicant Details -->
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">First Name:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('first_name', applicant.first_name)"
                    :title="'Click to use: ' + applicant.first_name"
                  >
                    {{ applicant.first_name }}
                  </span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Last Name:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('last_name', applicant.last_name)"
                    :title="'Click to use: ' + applicant.last_name"
                  >
                    {{ applicant.last_name }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">Middle Name:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('middle_name', applicant.middle_name)"
                    :title="'Click to use: ' + applicant.middle_name"
                  >
                    {{ applicant.middle_name || 'N/A' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">Inmate Number:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('inmate_number', applicant.inmate_number)"
                    :title="'Click to use: ' + applicant.inmate_number"
                  >
                    {{ applicant.inmate_number }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">Facility:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('facility_name', applicant.facility_name)"
                    :title="'Click to use: ' + applicant.facility_name"
                  >
                    {{ applicant.facility_name }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">Mailing Address:</span>
                  <span 
                    class="info-value selectable" 
                    @click="populateField('mailing_address', applicant.mailing_address)"
                    :title="'Click to use: ' + applicant.mailing_address"
                  >
                    {{ applicant.mailing_address }}
                  </span>
                </div>
              </div>

              <!-- Documents Section -->
              <div class="documents-section">
                <div class="documents-header">
                  <v-icon size="18" color="primary">mdi-file-document-multiple</v-icon>
                  <span class="documents-title">Documents ({{ applicant.documents?.length || 0 }})</span>
                </div>

                <div v-if="applicant.documents && applicant.documents.length" class="documents-list">
                  <div 
                    v-for="(doc, docIndex) in applicant.documents" 
                    :key="docIndex" 
                    class="document-item"
                  >
                    <div class="document-info">
                      <div class="document-details">
                        <div class="document-name">
                          <v-icon size="16" color="primary">mdi-file-document</v-icon>
                          {{ doc.document_name }}
                        </div>
                        <div class="document-meta">
                          <span class="meta-item">
                            <v-icon size="14">mdi-calendar</v-icon>
                            {{ doc.date_created }}
                          </span>
                          <v-chip 
                            :color="doc.status === 'processed' ? 'success' : 'warning'" 
                            size="x-small"
                            variant="flat"
                          >
                            {{ doc.status }}
                          </v-chip>
                        </div>
                      </div>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click="toggleIframe(index, docIndex)"
                        :color="expandedDocument === `${index}-${docIndex}` ? 'primary' : ''"
                      >
                        <v-icon>{{ expandedDocument === `${index}-${docIndex}` ? 'mdi-eye-off' : 'mdi-eye-outline' }}</v-icon>
                      </v-btn>
                    </div>

                    <v-expand-transition>
                      <div v-if="expandedDocument === `${index}-${docIndex}`" class="iframe-container">
                        <iframe
                          :src="`https://drive.google.com/file/d/${doc.document_id}/preview`"
                          width="100%"
                          height="600"
                          frameborder="0"
                          allowfullscreen
                        ></iframe>
                      </div>
                    </v-expand-transition>
                  </div>
                </div>

                <div v-else class="no-documents">
                  <v-icon size="24" color="grey">mdi-file-document-remove-outline</v-icon>
                  <p>No documents available</p>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <v-icon size="64" color="grey">mdi-account-alert-outline</v-icon>
          <p class="empty-text">No applicants selected for merging</p>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="dialog-actions">
      <v-spacer></v-spacer>
      <v-btn
        variant="outlined"
        @click="closeDialog"
        class="cancel-btn"
        prepend-icon="mdi-close"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        @click="mergeApplicants"
        prepend-icon="mdi-merge"
        class="merge-btn"
      >
        Merge Applicants
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "MergeApplicants",
  props: {
    selectedApplicants: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      applicantsWithDocuments: [], // Stores applicants with their document details
      mergedApplicant: {
        first_name: "",
        last_name: "",
        middle_name: "",
        inmate_number: "",
        facility_name: "",
        mailing_address: "",
      },
      facilityOptions: [], // Stores facility names for the autocomplete
      expandedDocument: null, // Tracks the currently expanded document (applicantIndex + docIndex)
    };
  },
  methods: {
    async getFacilities() {
      try {
        const res = await api.get("/get-facilities");
        this.facilityOptions = res.data; // Store the full facility objects
      } catch (err) {
        console.error("Error fetching facilities:", err);
        this.facilityOptions = [];
      }
    },
    closeDialog() {
      this.$emit("closeDialog");
    },
    async fetchApplicantDetails(applicant) {
      try {
        const res = await api.get("/get-applicant-details", {
          params: {
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            inmate_number: applicant.inmate_number,
          },
        });
        if (res.data.length > 0) {
          // Add document details to the applicant
          return {
            ...applicant,
            documents: res.data.map((item) => item.document),
          };
        } else {
          return { ...applicant, documents: [] };
        }
      } catch (err) {
        console.error(
          `Error fetching details for ${applicant.first_name} ${applicant.last_name}:`,
          err
        );
        return { ...applicant, documents: [] };
      }
    },
    async loadApplicantsWithDocuments() {
      try {
        this.loading = true;
        console.log("Loading applicants... Selected:", this.selectedApplicants);
        const promises = this.selectedApplicants.map((applicant) =>
          this.fetchApplicantDetails(applicant)
        );
        this.applicantsWithDocuments = await Promise.all(promises);
        console.log("Loaded applicants with documents:", this.applicantsWithDocuments);
        await this.getFacilities();
      } catch (error) {
        console.error("Error loading applicants:", error);
      } finally {
        this.loading = false;
      }
    },
    populateField(field, value) {
      this.mergedApplicant[field] = this.formatName(value);
    },
    formatName(name) {
      if (!name) return "";
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    },
    toggleIframe(applicantIndex, docIndex) {
      const expandedKey = `${applicantIndex}-${docIndex}`;
      this.expandedDocument = this.expandedDocument === expandedKey ? null : expandedKey;
    },
    mergeApplicants() {
      api.post("/merge-applicants", {
        mergedApplicant: this.mergedApplicant,
        applicants: this.applicantsWithDocuments,
      });
    },
  },
  watch: {
    "mergedApplicant.first_name"(newValue) {
      this.mergedApplicant.first_name = this.formatName(newValue);
    },
    "mergedApplicant.last_name"(newValue) {
      this.mergedApplicant.last_name = this.formatName(newValue);
    },
    "mergedApplicant.middle_name"(newValue) {
      this.mergedApplicant.middle_name = this.formatName(newValue);
    },
  },
  async mounted() {
    await this.loadApplicantsWithDocuments();
  
    // Auto-populate mergedApplicant with the first applicant's details
    if (this.selectedApplicants.length > 0) {
      console.log("Selected Applicants:", this.applicantsWithDocuments[0]);
      const firstApplicant = this.applicantsWithDocuments[0];
      this.mergedApplicant = {
        first_name: this.formatName(firstApplicant.first_name),
        last_name: this.formatName(firstApplicant.last_name),
        middle_name: this.formatName(firstApplicant.middle_name),
        inmate_number: firstApplicant.inmate_number || "",
        facility_name: firstApplicant.facility_name || "",
        mailing_address: firstApplicant.mailing_address || "",
      };
    }
  },
};
</script>

<style scoped>
/* Dialog Container */
.merge-dialog {
  border-radius: 16px !important;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header */
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .dialog-title {
  color: #F9FAFB;
}

.dialog-subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .dialog-subtitle {
  color: #9CA3AF;
}

.close-btn {
  border-radius: 8px !important;
}

/* Dialog Content */
.dialog-content {
  padding: 28px !important;
  overflow-y: auto;
  flex: 1;
}

.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.v-theme--dark .dialog-content::-webkit-scrollbar-track {
  background: #1F2937;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.v-theme--dark .dialog-content::-webkit-scrollbar-thumb {
  background: #4B5563;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Merged Section */
.merged-section {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.v-theme--dark .merged-section {
  background: #1E293B;
  border-color: #334155;
}

.section-header {
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
}

.v-theme--dark .section-title {
  color: #F9FAFB;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* Source Section */
.source-section {
  margin-top: 24px;
}

.applicants-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

.applicants-list::-webkit-scrollbar {
  width: 8px;
}

.applicants-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.v-theme--dark .applicants-list::-webkit-scrollbar-track {
  background: #1F2937;
}

.applicants-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.v-theme--dark .applicants-list::-webkit-scrollbar-thumb {
  background: #4B5563;
}

.applicants-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Applicant Card */
.applicant-card {
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.2s ease;
}

.applicant-card:hover {
  border-color: #C7D2FE !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1) !important;
}

.v-theme--dark .applicant-card {
  border-color: #334155 !important;
}

.v-theme--dark .applicant-card:hover {
  border-color: #475569 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.applicant-header {
  padding: 16px 20px;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .applicant-header {
  background: linear-gradient(to bottom, #1A2332, #151E2E);
  border-bottom-color: #334155;
}

.applicant-content {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-theme--dark .info-label {
  color: #9CA3AF;
}

.info-value {
  font-size: 0.9375rem;
  color: #1F2937;
  word-wrap: break-word;
}

.v-theme--dark .info-value {
  color: #F3F4F6;
}

.selectable {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.selectable:hover {
  background: #EFF6FF;
  color: #3B82F6;
  border-color: #BFDBFE;
  transform: translateX(4px);
}

.v-theme--dark .selectable:hover {
  background: #1E293B;
  color: #93C5FD;
  border-color: #475569;
}

/* Documents Section */
.documents-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.documents-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .documents-header {
  border-bottom-color: #334155;
}

.documents-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.v-theme--dark .documents-title {
  color: #D1D5DB;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.document-item:hover {
  border-color: #C7D2FE;
  background: #FEFEFF;
}

.v-theme--dark .document-item {
  background: #0F172A;
  border-color: #1E293B;
}

.v-theme--dark .document-item:hover {
  border-color: #334155;
  background: #1A2332;
}

.document-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.document-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  display: flex;
  align-items: center;
  gap: 6px;
}

.v-theme--dark .document-name {
  color: #F3F4F6;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.8125rem;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.v-theme--dark .meta-item {
  color: #9CA3AF;
}

.no-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #9CA3AF;
  text-align: center;
}

.no-documents p {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
}

/* Iframe Container */
.iframe-container {
  margin-top: 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
  background: #F9FAFB;
}

.v-theme--dark .iframe-container {
  border-color: #334155;
  background: #0F172A;
}

/* Dialog Actions */
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
.merge-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  border-radius: 8px !important;
  font-size: 0.9375rem !important;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.loading-text {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .loading-text {
  color: #9CA3AF;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.empty-text {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .empty-text {
  color: #9CA3AF;
}

/* Responsive */
@media (max-width: 960px) {
  .applicant-content {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
