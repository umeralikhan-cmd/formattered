<template>
  <div class="dev-board-page">
    <!-- Password Protection Screen -->
    <div v-if="!isAuthenticated" class="password-screen">
      <div class="password-card">
        <div class="password-header">
          <v-icon size="48" color="primary">mdi-shield-lock</v-icon>
          <h2 class="password-title">Developer Tools Access</h2>
          <p class="password-subtitle">Authentication required for advanced tools</p>
        </div>
        
        <div class="password-content">
        <v-text-field
          v-model="passwordInput"
            label="Enter Password"
          type="password"
          variant="outlined"
            density="comfortable"
          @keyup.enter="checkPassword"
          :error-messages="passwordError"
            prepend-inner-icon="mdi-lock"
            hide-details="auto"
        ></v-text-field>
          
        <v-btn
          color="primary"
          block
          size="large"
          @click="checkPassword"
            class="access-btn"
            prepend-icon="mdi-login"
        >
          Enable Access
        </v-btn>
        </div>
      </div>
    </div>

    <!-- Main Content (shown after authentication) -->
    <div v-else class="dev-board-content">
      <div class="content-wrapper">
        
        <!-- Info Message -->
        <div class="dev-info-message">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          <div>
            <div class="alert-title">Developer Testing Board</div>
            <div class="alert-text">
              This interface provides various utilities for document processing and data management.
              For development/testing purposes only.
            </div>
          </div>
        </div>
        <!-- Basic Utilities Section -->
        <div class="tools-section">
          <div class="section-header">
            <v-icon class="section-icon" color="primary">mdi-toolbox</v-icon>
            <h3 class="section-title">Basic Utilities</h3>
          </div>
          <div class="tools-grid">
            <v-btn
              color="primary"
              :loading="loading"
              @click="testSignEndpoint"
              class="tool-btn"
              prepend-icon="mdi-account-details"
            >
             MAV INFO
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              @click="testFacilityInfoFlow(facility_id)"
              class="tool-btn"
              prepend-icon="mdi-domain"
            >
              Facility Info
            </v-btn>
          </div>
        </div>

        <!-- File Upload Tools Section -->
        <div class="tools-section">
          <div class="section-header">
            <v-icon class="section-icon" color="success">mdi-file-upload</v-icon>
            <h3 class="section-title">File Upload Tools</h3>
          </div>
          <div class="tools-grid">
            <v-btn
              color="primary"
              :loading="csvLoading"
              @click="triggerFileUpload"
              class="tool-btn"
              prepend-icon="mdi-file-delimited"
            >
              Upload CSV
            </v-btn>
            <v-btn
              color="primary"
              :loading="edovoLoading"
              @click="triggerEdovoFileUpload"
              class="tool-btn"
              prepend-icon="mdi-file-document-outline"
            >
              Extract Edovo Info
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              style="display: none"
              @change="handleFileUpload"
            >
            <input
              ref="edovoFileInput"
              type="file"
              accept=".csv"
              style="display: none"
              @change="handleEdovoFileUpload"
            >
          </div>
        </div>

        <!-- Data Processing Section -->
        <div class="tools-section">
          <div class="section-header">
            <v-icon class="section-icon" color="warning">mdi-cog-refresh</v-icon>
            <h3 class="section-title">Data Processing</h3>
          </div>
          <div class="tools-grid">
            <v-btn
              color="warning"
              :loading="matchLoading"
              @click="findMatchMavericks"
              class="tool-btn"
              prepend-icon="mdi-account-search"
            >
              Find Match Mavericks
            </v-btn>
            <v-btn
              color="success"
              :loading="updateLoading"
              @click="updateParentIds"
              class="tool-btn"
              prepend-icon="mdi-update"
            >
              Update Parent IDs
            </v-btn>
          </div>
        </div>

        <!-- Logs Management Section -->
        <div class="tools-section">
          <div class="section-header">
            <v-icon class="section-icon" color="error">mdi-clipboard-text-multiple</v-icon>
            <h3 class="section-title">Logs Management</h3>
          </div>
          <div class="tools-grid">
            <v-btn
              color="error"
              :loading="logsLoading"
              @click="makeMissingLogs"
              class="tool-btn"
              prepend-icon="mdi-clipboard-text"
            >
              Make Logs
            </v-btn>
            <v-btn
              color="purple"
              :loading="sendLogsLoading"
              @click="makeSendLogs"
              class="tool-btn"
              prepend-icon="mdi-send"
            >
              Make Send Logs
            </v-btn>
            <v-btn
              color="indigo"
              :loading="queueLogsLoading"
              @click="makeQueueLogs"
              class="tool-btn"
              prepend-icon="mdi-playlist-check"
            >
              Make Queue
            </v-btn>
            <v-btn
              color="cyan"
              :loading="edovoProcessLogsLoading"
              @click="processEdovoLogs"
              class="tool-btn"
              prepend-icon="mdi-file-document-edit"
            >
              Edovo Process Logs
            </v-btn>
            <v-btn
              color="orange"
              :loading="cleanProcessLogsLoading"
              @click="cleanProcessLogsData"
              class="tool-btn"
              prepend-icon="mdi-database-refresh"
            >
              Clean Process Logs
            </v-btn>
          </div>
        </div>

        <!-- Matching & Cleanup Section -->
        <div class="tools-section">
          <div class="section-header">
            <v-icon class="section-icon" color="info">mdi-account-group</v-icon>
            <h3 class="section-title">Matching & Cleanup</h3>
          </div>
          <div class="tools-grid">
            <v-btn
              color="info"
              :loading="matchLogsLoading"
              @click="matchLogsToMavs"
              class="tool-btn"
              prepend-icon="mdi-account-arrow-right"
            >
              Match Logs to Mavs
            </v-btn>
            <v-btn
              color="teal"
              :loading="matchApplicantsLoading"
              @click="matchApplicantsNoMaverick"
              class="tool-btn"
              prepend-icon="mdi-account-multiple-check"
            >
              Match Applicants
            </v-btn>
            <v-btn
              color="purple"
              :loading="fillEdovoLoading"
              @click="fillAllEdovo"
              class="tool-btn"
              prepend-icon="mdi-table-edit"
            >
              Fill Edovo
            </v-btn>
          </div>
        </div>

        <!-- Document Processing Section -->
        <div class="tools-section document-section">
          <div class="section-header">
            <v-icon class="section-icon" color="primary">mdi-file-document-multiple</v-icon>
            <h3 class="section-title">Document Processing</h3>
          </div>
          <div class="document-content">
            <v-select
              v-model="selectedDocumentType"
              :items="documentTypes"
              item-title="name"
              item-value="value"
              label="Select Document Type"
              variant="outlined"
              :disabled="loading"
              clearable
              density="comfortable"
              prepend-inner-icon="mdi-file-document"
              hide-details="auto"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    item.raw.description
                  }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <v-btn
              @click="startProcess"
              :disabled="!selectedDocumentType || loading"
              :loading="loading"
              color="primary"
              size="x-large"
              class="start-btn"
              prepend-icon="mdi-play-circle"
            >
              START PROCESS
            </v-btn>
          </div>
        </div>

        <!-- Progress/Status Section -->
        <div v-if="statusMessage || loading" class="status-section">
            <div
              v-if="statusMessage"
              class="status-message text-body-2 py-2"
              :class="`text-${alertType}`"
            >
              {{ statusMessage }}
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                @click="clearStatus"
                class="ml-2"
              />
            </div>

            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
            height="8"
            class="status-progress"
            ></v-progress-linear>
        </div>

        <!-- CSV Match Results Section -->
        <div v-if="csvMatchResults" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="results-header-content">
                <v-icon class="results-icon">mdi-account-check</v-icon>
                <span class="results-title">Applicant Match Results ({{ csvMatchResults.length }} found)</span>
              </div>
            </div>
            <div class="results-body">
                <v-data-table
                  :headers="csvResultHeaders"
                  :items="csvMatchResults"
                  :items-per-page="10"
                class="results-table"
                density="comfortable"
                >
                  <template v-slot:item.match_status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.match_status)"
                    size="small"
                    class="font-weight-bold"
                    >
                      {{ item.match_status }}
                    </v-chip>
                  </template>
                </v-data-table>
            </div>
          </div>
        </div>

        <!-- Update Results Section -->
        <div v-if="updateResults" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="results-header-content">
                <v-icon class="results-icon">mdi-update</v-icon>
                <span class="results-title">Parent ID Update Results ({{ updateResults.length }} applications processed)</span>
              </div>
            </div>
            <div class="results-body">
                <v-data-table
                  :headers="updateResultHeaders"
                  :items="updateResults"
                  :items-per-page="10"
                class="results-table"
                density="comfortable"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getUpdateStatusColor(item.status)"
                    size="small"
                    class="font-weight-bold"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.applications_updated="{ item }">
                    <v-icon :color="item.applications_updated ? 'success' : 'error'">
                      {{ item.applications_updated ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                  </template>
                  <template v-slot:item.edovo_updated="{ item }">
                    <v-icon :color="item.edovo_updated ? 'success' : 'grey'">
                      {{ item.edovo_updated ? 'mdi-check' : 'mdi-minus' }}
                    </v-icon>
                  </template>
                  <template v-slot:item.extracted_updated="{ item }">
                    <v-icon :color="item.extracted_updated ? 'success' : 'grey'">
                      {{ item.extracted_updated ? 'mdi-check' : 'mdi-minus' }}
                    </v-icon>
                  </template>
                  <template v-slot:item.bubble_sheet_updated="{ item }">
                    <v-icon :color="item.bubble_sheet_updated ? 'success' : 'grey'">
                      {{ item.bubble_sheet_updated ? 'mdi-check' : 'mdi-minus' }}
                    </v-icon>
                  </template>
                </v-data-table>
            </div>
          </div>
        </div>

        <!-- Match Results Section -->
        <div v-if="matchResults" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="results-header-content">
                <v-icon class="results-icon">mdi-account-search</v-icon>
                <span class="results-title">Maverick Match Results ({{ matchResults.length }} applications processed)</span>
              </div>
            </div>
            <div class="results-body">
                <v-data-table
                  :headers="matchResultHeaders"
                  :items="matchResults"
                  :items-per-page="10"
                class="results-table"
                density="comfortable"
                >
                  <template v-slot:item.match_status="{ item }">
                    <v-chip
                      :color="getMatchStatusColor(item.match_status)"
                    size="small"
                    class="font-weight-bold"
                    >
                      {{ item.match_status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.match_score="{ item }">
                    <span v-if="item.match_score">{{ Math.round(item.match_score) }}%</span>
                  <span v-else class="text-grey">-</span>
                  </template>
                </v-data-table>
            </div>
          </div>
        </div>

        <!-- Edovo Results Section -->
        <div v-if="edovoResults" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="results-header-content">
                <v-icon class="results-icon">mdi-file-document-outline</v-icon>
                <span class="results-title">Edovo Questions Extracted ({{ edovoResults.length }} unique questions)</span>
                </div>
                <v-btn
                  color="success"
                  :loading="downloadLoading"
                  @click="downloadEdovoCSV"
                  size="small"
                prepend-icon="mdi-download"
                class="download-btn"
                >
                  Download CSV
                </v-btn>
            </div>
            <div class="results-body">
                <v-data-table
                  :headers="edovoResultHeaders"
                  :items="edovoResults"
                  :items-per-page="10"
                class="results-table"
                density="comfortable"
                >
                </v-data-table>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="results" class="results-section">
          <div class="results-card">
            <div class="results-header">
              <div class="results-header-content">
                <v-icon class="results-icon">mdi-clipboard-text</v-icon>
                <span class="results-title">Results</span>
              </div>
            </div>
            <div class="results-body">
              <div class="json-result">{{ JSON.stringify(results, null, 2) }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Process Logs Section (Always Visible) -->
    <process-logs />
  </div>
</template>

<script>
import api from "@/plugins/axios";
import ProcessLogs from "./ProcessLogs.vue";

export default {
  name: "DevBoard",
  components: {
    ProcessLogs
  },
  data() {
    return {
      isAuthenticated: false,
      passwordInput: "",
      passwordError: "",
      maverick_id: 20586,
      selectedDocumentType: null,
      loading: false,
      csvLoading: false,
      edovoLoading: false,
      downloadLoading: false,
      matchLoading: false,
      updateLoading: false,
      logsLoading: false,
      sendLogsLoading: false,
      matchLogsLoading: false,
      matchApplicantsLoading: false,
      fillEdovoLoading: false,
      queueLogsLoading: false,
      edovoProcessLogsLoading: false,
      cleanProcessLogsLoading: false,
      lastUploadedEdovoFile: null,
      matchResults: null,
      updateResults: null,
      statusMessage: "",
      alertType: "info",
      facility_id: "CA_CDCR_ASP",
      results: null,
      csvMatchResults: null,
      edovoResults: null,
      edovoResultHeaders: [
        { title: 'Question Number', key: 'question_number', align: 'center' },
        { title: 'Question', key: 'question', align: 'start' },
        { title: 'Lesson', key: 'lesson', align: 'start' },
        { title: 'Question Type', key: 'question_type', align: 'start' }
      ],
      matchResultHeaders: [
        { title: 'Application ID', key: 'application_id', align: 'center' },
        { title: 'Applicant Name', key: 'applicant_name', align: 'start' },
        { title: 'DOC Number', key: 'doc_number', align: 'start' },
        { title: 'Facility', key: 'facility_name', align: 'start' },
        { title: 'Match Status', key: 'match_status', align: 'center' },
        { title: 'Maverick ID', key: 'maverick_id', align: 'center' },
        { title: 'Maverick Name', key: 'maverick_name', align: 'start' },
        { title: 'Match Score', key: 'match_score', align: 'center' },
        { title: 'Match Facility', key: 'maverick_facility', align: 'center' },
        { title: 'Match DOC', key: 'maverick_doc', align: 'start' },
        { title: 'Match Reason', key: 'match_type', align: 'start' }
      ],
      updateResultHeaders: [
        { title: 'Application ID', key: 'application_id', align: 'center' },
        { title: 'Document Type', key: 'document_type', align: 'start' },
        { title: 'Maverick ID', key: 'maverick_id', align: 'center' },
        { title: 'Applications Updated', key: 'applications_updated', align: 'center' },
        { title: 'Edovo Table Updated', key: 'edovo_updated', align: 'center' },
        { title: 'Extracted Table Updated', key: 'extracted_updated', align: 'center' },
        { title: 'Bubble Sheet Updated', key: 'bubble_sheet_updated', align: 'center' },
        { title: 'Status', key: 'status', align: 'center' }
      ],
      csvResultHeaders: [
        { title: 'Name', key: 'name', align: 'start' },
        { title: 'DOC ID Number', key: 'doc_id_number', align: 'start' },
        { title: 'Maverick ID', key: 'maverick_id', align: 'center' },
        { title: 'Match Status', key: 'match_status', align: 'center' },
        { title: 'Facility Name', key: 'facility_name', align: 'start' }
      ],
      url: "http://127.0.0.1:8000/dash",
      url2: "https://app.hustle20.com/dash",
      url3: "https://app.hustle20.com/sign",
      url4: "http://127.0.0.1:8000/sign",
      documentTypes: [
        {
          name: "English Transform Your Hustle",
          value: "English Transform Your Hustle",
          description: "New format of English Transform Your Hustle documents",
        },
        {
          name: "Preseason v2",
          value: "Preseason v2",
          description: "Preseason version 2 documents",
        },
        {
          name: "Preseason v1",
          value: "Preseason v1",
          description: "Preseason version 1 documents",
        },
        {
          name: "Program Application",
          value: "Program Application",
          description: "Program application documents",
        },
        {
          name: "Book Two",
          value: "Book Two",
          description: "Book Two documents",
        },
        {
          name: "Book One Enrollment",
          value: "Book One Enrollment",
          description: "Book One enrollment documents",
        },
        {
          name: "Book One",
          value: "Book One",
          description: "Book One documents",
        },
        {
          name: "Book Two Enrollment",
          value: "Book Two Enrollment",
          description: "Book Two enrollment documents",
        },
      ],
    };
  },
  methods: {
    checkPassword() {
      const correctPassword = "root";
      const dummyPassword = "123"; // TODO: Remove this dummy password later
      if (this.passwordInput === correctPassword || this.passwordInput === dummyPassword) {
        this.isAuthenticated = true;
        this.passwordError = "";
        this.passwordInput = "";
      } else {
        this.passwordError = "Incorrect password";
      }
    },

    async startProcess() {
      if (!this.selectedDocumentType) {
        this.showStatus("Please select a document type first.", "error");
        return;
      }

      this.loading = true;
      this.results = null;
      this.showStatus("Starting process...", "info");

      try {
        // Call the backend API - adjust the endpoint as needed
        const response = await api.post("/dev-start-process", {
          document_type: this.selectedDocumentType,
        });

        if (response.status === 200) {
          this.results = response.data;
          console.log("Process completed successfully:", this.results);
          this.showStatus("Process completed successfully!", "success");
        } else {
          this.showStatus("Process completed with warnings.", "warning");
          this.results = response.data;
        }
      } catch (error) {
        console.error("Error starting process:", error);

        let errorMessage = "An error occurred while starting the process.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.loading = false;
      }
    },

    async testSignEndpoint() {
      this.loading = true;
      this.results = null;
      this.showStatus("Fetching maverick info...", "info");

      try {
        const INTERNAL_KEY = import.meta.env.VITE_DASH_SIGN_KEY;
        console.log("Using INTERNAL_KEY:", INTERNAL_KEY ? "***" + INTERNAL_KEY.slice(-4) : "UNDEFINED");

        // Create the payload that will be base64 encoded
        const payloadData = {
          maverick_info: this.maverick_id.toString(),
          instructions: {
            action: "maverick_info"
          }
        };

        // Base64 encode the JSON payload
        const jsonString = JSON.stringify(payloadData);
        const b64Payload = btoa(jsonString);
        console.log("Payload data:", payloadData);
        console.log("Base64 payload:", b64Payload);

        const response = await fetch(this.url2, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": INTERNAL_KEY,
          },
          body: JSON.stringify({
            b64: b64Payload
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Maverick info response:", data);

        // Display the results
        this.results = data;
        this.showStatus("Maverick info retrieved successfully!", "success");

        return data;
      } catch (error) {
        console.error("Error:", error);

        let errorMessage = "An error occurred while fetching maverick info.";
        if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.loading = false;
      }
    },
    async testFacilityInfoFlow() {
      try {
        console.log("=== Testing Complete Facility Info Flow ===");
        const INTERNAL_KEY = import.meta.env.VITE_INTERNAL_SIGN_KEY;
        const payloadData = {
          facility_id: this.facility_id,
          instructions: {
            action: "facility_info"
          }
        };

        // Base64 encode the JSON payload
        const jsonString = JSON.stringify(payloadData);
        const b64Payload = btoa(jsonString);
        // Step 1: Get signed token from /sign endpoint
        console.log("Step 1: Getting signed token...");
        const response = await fetch(this.url3, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": INTERNAL_KEY,
          },
          body: JSON.stringify({
            b64: b64Payload
          }),
        });
        const data = await response.json();
        console.log("Facility info response:", data);


      } catch (error) {
        console.error("❌ Error in facility info flow:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    },

    triggerFileUpload() {
      this.$refs.fileInput.click();
    },

    triggerEdovoFileUpload() {
      this.$refs.edovoFileInput.click();
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.showStatus("Please select a CSV file.", "error");
        return;
      }

      this.csvLoading = true;
      this.csvMatchResults = null;
      this.showStatus("Processing CSV file...", "info");

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/match-new-applicant', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          this.csvMatchResults = response.data.matches;
          const totalApplicants = this.csvMatchResults.length;
          const matchedCount = response.data.matched_count || 0;
          const createdCount = response.data.created_count || 0;
          const failedCount = response.data.failed_count || 0;

          this.showStatus(
            `CSV processed successfully! ${matchedCount} matches, ${createdCount} new records created, ${failedCount} failures.`,
            "success"
          );
        } else {
          this.showStatus("CSV processed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error uploading CSV:", error);

        let errorMessage = "An error occurred while processing the CSV file.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.csvLoading = false;
        // Reset file input
        event.target.value = '';
      }
    },

    async handleEdovoFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.showStatus("Please select a CSV file.", "error");
        return;
      }

      this.edovoLoading = true;
      this.edovoResults = null;
      this.lastUploadedEdovoFile = file; // Store file for download
      this.showStatus("Extracting Edovo information...", "info");

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/extract-edovo-information', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          this.edovoResults = response.data.questions;
          const totalQuestions = this.edovoResults.length;

          this.showStatus(
            `Edovo information extracted successfully! Found ${totalQuestions} unique questions.`,
            "success"
          );
        } else {
          this.showStatus("Edovo extraction completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error extracting Edovo information:", error);

        let errorMessage = "An error occurred while extracting Edovo information.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.edovoLoading = false;
        // Reset file input
        event.target.value = '';
      }
    },

    async downloadEdovoCSV() {
      if (!this.lastUploadedEdovoFile) {
        this.showStatus("No file available for download. Please upload a file first.", "error");
        return;
      }

      this.downloadLoading = true;
      this.showStatus("Generating CSV download...", "info");

      try {
        const formData = new FormData();
        formData.append('file', this.lastUploadedEdovoFile);

        const response = await api.post('/download-edovo-csv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob'
        });

        if (response.status === 200) {
          // Create download link
          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'edovo_questions.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.showStatus("CSV downloaded successfully!", "success");
        }
      } catch (error) {
        console.error("Error downloading CSV:", error);

        let errorMessage = "An error occurred while downloading the CSV file.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.downloadLoading = false;
      }
    },

    async findMatchMavericks() {
      this.matchLoading = true;
      this.matchResults = null;
      this.showStatus("Finding maverick matches...", "info");

      try {
        const response = await api.get('/find-match-mavericks');

        if (response.status === 200) {
          this.matchResults = response.data.matches;
          const totalApplications = response.data.total_applications || 0;
          const matchedCount = response.data.matched_count || 0;
          const noMatchCount = response.data.no_match_count || 0;

          this.showStatus(
            `Matching completed! Processed ${totalApplications} applications. ${matchedCount} matches found, ${noMatchCount} no matches.`,
            "success"
          );
        } else {
          this.showStatus("Matching completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error finding maverick matches:", error);

        let errorMessage = "An error occurred while finding maverick matches.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.matchLoading = false;
      }
    },

    async updateParentIds() {
      this.updateLoading = true;
      this.updateResults = null;
      this.showStatus("Updating parent IDs...", "info");

      try {
        const response = await api.post('/update-parent-ids');

        if (response.status === 200) {
          this.updateResults = response.data.updates;
          const totalUpdated = response.data.total_updated || 0;
          const totalSkipped = response.data.total_skipped || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Parent ID update completed! ${totalUpdated} updated, ${totalSkipped} skipped, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Parent ID update completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error updating parent IDs:", error);

        let errorMessage = "An error occurred while updating parent IDs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.updateLoading = false;
      }
    },

    async makeMissingLogs() {
      this.logsLoading = true;
      this.results = null;
      this.showStatus("Creating missing logs...", "info");

      try {
        const response = await api.post('/make-missing-logs');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalSuccess = response.data.total_success || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Missing logs creation completed! ${totalProcessed} records processed, ${totalSuccess} succeeded, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Log creation completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error creating missing logs:", error);

        let errorMessage = "An error occurred while creating missing logs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.logsLoading = false;
      }
    },

    async makeSendLogs() {
      this.sendLogsLoading = true;
      this.results = null;
      this.showStatus("Creating send logs...", "info");

      try {
        const response = await api.post('/make-send-logs');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalCreated = response.data.total_created || 0;
          const totalSkipped = response.data.total_skipped || 0;

          this.showStatus(
            `Send logs creation completed! ${totalProcessed} records processed, ${totalCreated} send logs created, ${totalSkipped} skipped (already exist).`,
            "success"
          );
        } else {
          this.showStatus("Send logs creation completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error creating send logs:", error);

        let errorMessage = "An error occurred while creating send logs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.sendLogsLoading = false;
      }
    },

    async matchLogsToMavs() {
      this.matchLogsLoading = true;
      this.results = null;
      this.showStatus("Matching logs to maverick IDs...", "info");

      try {
        const response = await api.post('/match-logs-to-mavs');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalMatched = response.data.total_matched || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Logs matching completed! ${totalProcessed} logs processed, ${totalMatched} matched with maverick IDs, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Logs matching completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error matching logs to maverick IDs:", error);

        let errorMessage = "An error occurred while matching logs to maverick IDs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.matchLogsLoading = false;
      }
    },

    async matchApplicantsNoMaverick() {
      this.matchApplicantsLoading = true;
      this.results = null;
      this.showStatus("Matching applicants without maverick IDs...", "info");

      try {
        const response = await api.post('/match-applicants-no-maverick');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalInserted = response.data.total_inserted || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Applicant matching completed! ${totalProcessed} records processed, ${totalInserted} inserted into Applications table, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Applicant matching completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error matching applicants:", error);

        let errorMessage = "An error occurred while matching applicants.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.matchApplicantsLoading = false;
      }
    },

    async fillAllEdovo() {
      this.fillEdovoLoading = true;
      this.results = null;
      this.showStatus("Filling Edovo table columns...", "info");

      try {
        const response = await api.post('/fill-all-edovo');

        if (response.status === 200) {
          this.results = response.data;
          const totalUpdated = response.data.total_updated || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Edovo fill completed! ${totalUpdated} records updated, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Edovo fill completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error filling Edovo tables:", error);

        let errorMessage = "An error occurred while filling Edovo tables.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.fillEdovoLoading = false;
      }
    },

    async makeQueueLogs() {
      this.queueLogsLoading = true;
      this.results = null;
      this.showStatus("Creating queue logs from exam logs...", "info");

      try {
        const response = await api.post('/make-queue-logs');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalSuccess = response.data.total_success || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Queue logs creation completed! ${totalProcessed} exam records processed, ${totalSuccess} succeeded, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Queue log creation completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error creating queue logs:", error);

        let errorMessage = "An error occurred while creating queue logs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.queueLogsLoading = false;
      }
    },

    async processEdovoLogs() {
      this.edovoProcessLogsLoading = true;
      this.results = null;
      this.showStatus("Processing Edovo Transform Your Hustle logs...", "info");

      try {
        const response = await api.post('/edovo-process-logs');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalSuccess = response.data.total_success || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Edovo logs processing completed! ${totalProcessed} records processed, ${totalSuccess} succeeded, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Edovo log processing completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error processing Edovo logs:", error);

        let errorMessage = "An error occurred while processing Edovo logs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.edovoProcessLogsLoading = false;
      }
    },

    async cleanProcessLogsData() {
      this.cleanProcessLogsLoading = true;
      this.results = null;
      this.showStatus("Cleaning and repopulating process logs data...", "info");

      try {
        const response = await api.post('/clean-process-logs-data');

        if (response.status === 200) {
          this.results = response.data;
          const totalProcessed = response.data.total_processed || 0;
          const totalSuccess = response.data.total_success || 0;
          const totalFailed = response.data.total_failed || 0;

          this.showStatus(
            `Process logs cleaning completed! ${totalProcessed} exam logs processed, ${totalSuccess} succeeded, ${totalFailed} failed.`,
            "success"
          );
        } else {
          this.showStatus("Process logs cleaning completed with warnings.", "warning");
        }
      } catch (error) {
        console.error("Error cleaning process logs:", error);

        let errorMessage = "An error occurred while cleaning process logs.";
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showStatus(errorMessage, "error");
      } finally {
        this.cleanProcessLogsLoading = false;
      }
    },

    getUpdateStatusColor(status) {
      switch (status) {
        case 'Success':
          return 'success';
        case 'No Match':
          return 'warning';
        case 'Failed':
          return 'error';
        case 'Skipped':
          return 'grey';
        default:
          return 'grey';
      }
    },

    getMatchStatusColor(status) {
      switch (status) {
        case 'Match Found':
          return 'success';
        case 'No Match':
          return 'error';
        case 'Multiple Matches':
          return 'warning';
        default:
          return 'grey';
      }
    },

    getStatusColor(status) {
      switch (status) {
        case 'Matched':
          return 'success';
        case 'Created New':
          return 'primary';
        case 'Creation Failed':
          return 'error';
        case 'Not Found':
          return 'warning';
        default:
          return 'grey';
      }
    },

    showStatus(message, type = "info") {
      this.statusMessage = message;
      this.alertType = type;
    },

    clearStatus() {
      this.statusMessage = "";
    },

    resetForm() {
      this.selectedDocumentType = null;
      this.results = null;
      this.clearStatus();
    },
  },
};
</script>

<style scoped>
/* Page Container */
.dev-board-page {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dev-board-page :deep(*) {
  scrollbar-width: none;
}

.dev-board-page :deep(*::-webkit-scrollbar) {
  display: none;
}

/* Password Screen */
.password-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 70vh;
}

.password-card {
  background: #FFFFFF;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
}

.v-theme--dark .password-card {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.password-header {
  padding: 48px 40px 32px 40px;
  text-align: center;
  background: linear-gradient(to bottom, #FAFBFC, #FFFFFF);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .password-header {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom-color: #334155;
}

.password-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 16px 0 8px 0;
  letter-spacing: -0.02em;
}

.v-theme--dark .password-title {
  color: #F9FAFB;
}

.password-subtitle {
  font-size: 0.9375rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .password-subtitle {
  color: #9CA3AF;
}

.password-content {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.access-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 14px 24px !important;
  height: auto !important;
  min-height: 48px !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
}

/* Dev Board Content */
.dev-board-content {
  width: 100%;
  padding-bottom: 40px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Alert */
.dev-info-alert {
  border-radius: 12px !important;
  border: 1px solid #DBEAFE !important;
}

.v-theme--dark .dev-info-alert {
  border-color: #1E40AF !important;
}

.alert-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 4px;
}

.alert-text {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Tools Section */
.tools-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
}

.tools-section:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
}

.v-theme--dark .tools-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .tools-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #475569;
}

.section-header {
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .section-header {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom-color: #334155;
}

.section-icon {
  opacity: 0.8;
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

.tools-grid {
  padding: 28px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.tool-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 12px 20px !important;
  height: auto !important;
  min-height: 48px !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
  justify-content: flex-start !important;
}

/* Document Section */
.document-section .document-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.start-btn {
  text-transform: none !important;
  font-weight: 700 !important;
  padding: 16px 32px !important;
  height: auto !important;
  min-height: 56px !important;
  border-radius: 12px !important;
  font-size: 1.125rem !important;
  letter-spacing: 0.02em !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.start-btn:hover {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-2px);
}

/* Status Section */
.status-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-alert {
  border-radius: 12px !important;
  font-weight: 500 !important;
}

.status-progress {
  border-radius: 8px !important;
}

/* Results Section */
.results-section {
  width: 100%;
}

.results-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
}

.results-card:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
}

.v-theme--dark .results-card {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .results-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #475569;
}

.results-header {
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
  border-bottom: 1px solid #E2E8F0;
  flex-wrap: wrap;
  gap: 12px;
}

.v-theme--dark .results-header {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom-color: #334155;
}

.results-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-icon {
  color: #6366F1 !important;
  opacity: 0.8;
}

.v-theme--dark .results-icon {
  color: #818CF8 !important;
}

.results-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.v-theme--dark .results-title {
  color: #F9FAFB;
}

.download-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 8px 20px !important;
  height: auto !important;
  min-height: 36px !important;
  border-radius: 8px !important;
}

.results-body {
  padding: 28px;
  background: #FAFBFC;
}

.v-theme--dark .results-body {
  background: #151E2E;
}

/* Results Table */
.results-table {
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

.v-theme--dark .results-table {
  background: #1E293B !important;
  border-color: #334155 !important;
}

:deep(.results-table .v-data-table__th) {
  background: #F9FAFB !important;
  color: #64748B !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid #E2E8F0 !important;
}

:deep(.v-theme--dark .results-table .v-data-table__th) {
  background: #0F172A !important;
  color: #94A3B8 !important;
  border-bottom-color: #334155 !important;
}

:deep(.results-table .v-data-table__td) {
  border-bottom: 1px solid #F3F4F6 !important;
  font-size: 0.875rem !important;
  color: #374151 !important;
}

:deep(.v-theme--dark .results-table .v-data-table__td) {
  border-bottom-color: #1E293B !important;
  color: #D1D5DB !important;
}

:deep(.results-table tbody tr:hover) {
  background: #F8FAFC !important;
}

:deep(.v-theme--dark .results-table tbody tr:hover) {
  background: #1F2937 !important;
}

/* JSON Result */
.json-result {
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
  scrollbar-width: thin;
  scrollbar-color: #475569 #1E293B;
}

.v-theme--dark .json-result {
  background: #0C1220;
  color: #C7D2FE;
}

.json-result::-webkit-scrollbar {
  width: 8px;
}

.json-result::-webkit-scrollbar-track {
  background: #1E293B;
  border-radius: 4px;
}

.json-result::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 12px;
  }

  .section-header,
  .results-header {
    padding: 16px 20px;
  }

  .results-body {
    padding: 20px;
  }

  .password-content {
    padding: 32px 24px;
  }

  .password-header {
    padding: 32px 24px 24px 24px;
  }

  .password-title {
    font-size: 1.5rem;
  }

  .tool-btn {
    min-height: 44px !important;
  }

  .download-btn {
    width: 100%;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
