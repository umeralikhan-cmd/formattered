<template>
  <div class="details-container">
    <!-- Action Buttons Header -->
    <div class="actions-header">
      <h2 class="details-title">Document Details</h2>
      <div class="actions-group">
        <v-btn
          class="action-btn action-search"
          @click="lookUpUsersDialog = true"
          prepend-icon="mdi-magnify"
          size="default"
        >
          Search Mav
        </v-btn>
        <v-btn
          class="action-btn action-regrade"
          @click="refreshDialog = true"
          prepend-icon="mdi-refresh-auto"
          size="default"
        >
          Regrade Mav
        </v-btn>
        <v-btn
          class="action-btn action-delete"
          @click="deleteDialog = true"
          prepend-icon="mdi-delete"
          size="default"
        >
          Delete
        </v-btn>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Section: Bubbles/Missions/Thank You -->
      <div class="left-section">
        <div class="section-card">
          <v-tabs
            v-model="tab2"
            class="custom-tabs"
            bg-color="transparent"
          >
            <v-tab value="bubble" class="custom-tab">
              <v-icon start>mdi-checkbox-multiple-marked-circle</v-icon>
              Bubbles
            </v-tab>
            <v-tab v-if="showMissionsTab" value="missions" class="custom-tab">
              <v-icon start>mdi-target</v-icon>
              Missions
            </v-tab>
            <v-tab v-if="showThankYouTab" value="thankyou" class="custom-tab">
              <v-icon start>mdi-heart</v-icon>
              Thank You
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab2" class="tabs-content">
            <!-- Bubbles Tab -->
            <v-tabs-window-item value="bubble">
              <div class="table-container">
                <v-table class="bubbles-table" density="comfortable">
                <thead>
                  <tr>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Correct</th>
                      <th>Status</th>
                      <th>Variant</th>
                  </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in items" :key="index" :class="{ 'correct-row': scoreStatus(item) === 'Correct' }">
                      <td class="fw-bold">{{ item.question }}</td>
                    <td>
                      <v-select
                        v-model="item.answer"
                        :items="answerOptions"
                        density="compact"
                        hide-details
                          variant="outlined"
                        @update:modelValue="() => saveNewAnswer(item)"
                          style="min-width: 60px; max-width: 80px;"
                      />
                    </td>
                      <td>{{ item.correct }}</td>
                      <td>
                        <v-chip
                          :color="scoreStatus(item) === 'Correct' ? 'success' : 'error'"
                          size="small"
                          variant="flat"
                        >
                          {{ scoreStatus(item) }}
                        </v-chip>
                    </td>
                    <td>{{ item.variant }}</td>
                  </tr>
                </tbody>
              </v-table>
              </div>
            </v-tabs-window-item>

            <!-- Missions Tab -->
            <v-tabs-window-item v-if="showMissionsTab" value="missions">
              <div class="missions-content">
                <v-row>
                  <v-col cols="6">
                    <div v-for="m in missions.slice(0, 5)" :key="m.key" class="mission-row">
                      <div class="mission-label" @click="toggleMission(m.key)">
                        <span class="mission-text">{{ m.label }}</span>
                          <span class="show-text">Show</span>
                      </div>
                          <v-btn-toggle
                            v-model="m.value"
                            divided
                            mandatory
                            density="comfortable"
                            @update:modelValue="val => onMissionChange(m, val)"
                          >
                            <v-btn
                              :value="true"
                              :color="m.value === true ? 'success' : undefined"
                              variant="outlined"
                              size="small"
                            >
                              Pass
                            </v-btn>
                            <v-btn
                              :value="false"
                              :color="m.value === false ? 'error' : undefined"
                              variant="outlined"
                              size="small"
                            >
                              Fail
                            </v-btn>
                          </v-btn-toggle>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div v-for="m in missions.slice(5, 10)" :key="m.key" class="mission-row">
                      <div class="mission-label" @click="toggleMission(m.key)">
                        <span class="mission-text">{{ m.label }}</span>
                          <span class="show-text">Show</span>
                      </div>
                          <v-btn-toggle
                            v-model="m.value"
                            divided
                            mandatory
                            density="comfortable"
                            @update:modelValue="val => onMissionChange(m, val)"
                          >
                            <v-btn
                              :value="true"
                              :color="m.value === true ? 'success' : undefined"
                              variant="outlined"
                              size="small"
                            >
                              Pass
                            </v-btn>
                            <v-btn
                              :value="false"
                              :color="m.value === false ? 'error' : undefined"
                              variant="outlined"
                              size="small"
                            >
                              Fail
                            </v-btn>
                          </v-btn-toggle>
                    </div>
                        </v-col>
                    </v-row>

                <!-- Selected Mission Answers -->
                <div class="selected-mission-card" v-if="selectedMissionKey">
                  <h3 class="mission-card-title">
                    Answers for {{ selectedMissionLabel || selectedMissionKey.toUpperCase() }}
                  </h3>
                  <div v-if="selectedMissionAnswers" class="mission-answers">
                    <div
                          v-for="(val, akey) in selectedMissionAnswers"
                          :key="akey"
                      class="answer-item"
                        >
                            <strong>{{ akey }}:</strong>
                      <span>{{ val }}</span>
                    </div>
                    </div>
                    <v-alert v-else type="info" variant="tonal">
                      No answers available for this mission.
                    </v-alert>
                </div>
                <v-alert v-else type="info" variant="tonal" class="mt-4">
                  Select a mission to view its answers.
                </v-alert>
              </div>
            </v-tabs-window-item>

            <!-- Thank You Tab -->
            <v-tabs-window-item v-if="showThankYouTab" value="thankyou"> 
              <ThankYouNotes :user="user" />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </div>

      <!-- Right Section: Score Summary & Document Preview -->
      <div class="right-section">
        <!-- Score Summary Card -->
        <div class="score-card">
          <div class="score-header">
            <v-icon class="score-icon">mdi-chart-box</v-icon>
            <h3 class="score-title">Score Summary</h3>
          </div>
          <div class="score-content">
            <v-table density="compact" class="score-table">
                <thead>
                  <tr>
                  <th>Variant</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(mark, index) in marks" :key="index">
                  <td class="fw-medium">{{ mark.variant }}</td>
                  <td>
                    <v-chip
                      :color="mark.score >= 80 ? 'success' : mark.score >= 60 ? 'warning' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      {{ mark.score }}%
                    </v-chip>
                  </td>
                    <td>{{ mark.correct }}</td>
                    <td>{{ mark.total }}</td>
                  </tr>
                    <tr v-if="showMissionsTab">
                  <td class="fw-medium">Missions</td>
                  <td>
                    <v-chip
                      :color="missionsPoints >= 720 ? 'success' : missionsPoints >= 540 ? 'warning' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      {{ missionsPoints }}
                    </v-chip>
                  </td>
                    <td>{{ missionsPassCount }}</td>
                    <td>900</td>
                    </tr>
                </tbody>
              </v-table>
          </div>
        </div>

        <!-- Document Preview Card -->
        <div class="preview-card">
          <v-tabs
            v-model="tab"
            class="custom-tabs"
            bg-color="transparent"
          >
            <v-tab value="pdf" class="custom-tab">
              <v-icon start>mdi-file-document</v-icon>
              Document
            </v-tab>
            <v-tab value="image" class="custom-tab">
              <v-icon start>mdi-image</v-icon>
              Bubble Sheet
            </v-tab>
            <v-tab v-if="showCertificateTab" value="certificate" class="custom-tab">
              <v-icon start>mdi-certificate</v-icon>
              Certificate
            </v-tab>
            <v-tab v-if="showReportTab" value="report" class="custom-tab">
              <v-icon start>mdi-file-chart</v-icon>
              Report
            </v-tab>
            </v-tabs>

          <!-- Content -->
          <div class="preview-content">
            <!-- Sign in prompt when not authenticated -->
            <div v-if="!isGoogleSignedIn" class="signin-prompt">
              <v-icon size="64" color="primary" class="mb-4">mdi-google-drive</v-icon>
              <p class="signin-text">Sign in with Google to view document previews.</p>
              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                @click="handleGoogleSignIn"
                prepend-icon="mdi-google"
              >
                Sign in with Google
              </v-btn>
            </div>

            <!-- Document tabs when signed in -->
            <v-tabs-window v-else v-model="tab">
              <!-- PDF Document Tab -->
                <v-tabs-window-item value="pdf">
                <div class="document-viewer">
                      <v-progress-circular
                        v-if="loading[0]"
                        indeterminate
                        color="primary"
                        size="50"
                    class="loading-spinner"
                      ></v-progress-circular>

                  <div v-if="!documentId && !loading[0]" class="no-content">
                        <v-alert type="info" variant="tonal">
                          Document ID not available
                        </v-alert>
                      </div>

                  <div v-else-if="documentId" class="document-content">
                        <v-btn
                          color="primary"
                          variant="outlined"
                      @click="openInNewTab(`https://drive.google.com/file/d/${documentId}/view`)"
                      class="open-btn"
                      prepend-icon="mdi-open-in-new"
                    >
                          Open PDF in New Tab
                        </v-btn>

                    <div v-if="pdfBlobUrl" class="iframe-container">
                        <iframe
                          :src="pdfBlobUrl"
                          width="100%"
                          height="800"
                          frameborder="0"
                          allow="fullscreen"
                          @error="onIframeError"
                        ></iframe>
                      </div>
                      <iframe
                        v-else
                        :src="`https://drive.google.com/file/d/${documentId}/preview?usp=sharing`"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allowfullscreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                        @error="onIframeError"
                      ></iframe>
                  </div>
                </div>
                </v-tabs-window-item>

              <!-- Bubble Sheet Image Tab -->
                <v-tabs-window-item value="image">
                <div class="document-viewer">
                  <div v-if="!imageID" class="no-content">
                        <v-alert type="info" variant="tonal">
                          Image ID not available
                        </v-alert>
                      </div>

                  <div v-else class="document-content">
                        <v-btn
                          color="primary"
                          variant="outlined"
                      @click="openInNewTab(`https://drive.google.com/file/d/${imageID}/view`)"
                      class="open-btn"
                      prepend-icon="mdi-open-in-new"
                    >
                          Open Bubble Sheet in New Tab
                        </v-btn>

                    <div v-if="imageBlobUrl" class="image-container">
                        <img
                          :src="imageBlobUrl"
                          alt="Bubble Sheet"
                        class="bubble-sheet-image"
                        />
                      </div>
                      <iframe
                        v-else
                        :src="`https://drive.google.com/file/d/${imageID}/preview?usp=sharing`"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allowfullscreen
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                        @error="onIframeError"
                    ></iframe>
                  </div>
                </div>
                </v-tabs-window-item>

              <!-- Certificate Tab -->
                <v-tabs-window-item v-if="showCertificateTab" value="certificate">
                <div class="document-viewer">
                  <div class="document-actions">
                      <template v-if="user.certificate_id">
                        <v-btn
                          color="primary"
                          variant="outlined"
                          :loading="certificateLoading"
                          :disabled="certificateLoading"
                        @click="downloadFromUrl(user.certificate_id, `Certificate_${user.maverick_name_first}_${user.maverick_name_last}.pdf`)"
                        prepend-icon="mdi-download"
                      >
                          Download Certificate
                        </v-btn>
                        <v-btn
                          color="warning"
                          variant="outlined"
                          :loading="certificateLoading"
                          :disabled="certificateLoading"
                          @click="generateCertificate()"
                        prepend-icon="mdi-refresh"
                        >
                        Re-generate
                        </v-btn>
                      </template>
                      <template v-else>
                        <div v-if="user.parent_id">
                          <v-btn
                            color="primary"
                            variant="elevated"
                            :loading="certificateLoading"
                            :disabled="certificateLoading"
                            @click="generateCertificate()"
                          prepend-icon="mdi-certificate"
                          >
                            Generate Certificate
                          </v-btn>
                        </div>
                      <v-alert v-else type="warning" variant="tonal">
                            Match Maverick to Results
                          </v-alert>
                      </template>
                  </div>

                  <div v-if="!user.certificate_id" class="no-content">
                        <v-alert type="info" variant="tonal">
                          Certificate not available
                        </v-alert>
                      </div>
                      <iframe
                        v-else
                        :src="user.certificate_id"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allow="fullscreen"
                        @error="onIframeError"
                      ></iframe>
                </div>
                </v-tabs-window-item>

              <!-- Report Tab -->
                <v-tabs-window-item v-if="showReportTab" value="report">
                <div class="document-viewer">
                  <div class="document-actions">
                      <template v-if="user.report_id">
                        <v-btn
                          color="primary"
                          variant="outlined"
                          :loading="reportLoading"
                          :disabled="reportLoading"
                        @click="downloadFromUrl(user.report_id, `Report_${user.maverick_name_first}_${user.maverick_name_last}.pdf`)"
                        prepend-icon="mdi-download"
                      >
                          Download Report
                        </v-btn>
                        <v-btn
                          color="warning"
                          variant="outlined"
                          :loading="reportLoading"
                          :disabled="reportLoading"
                          @click="generateReport()"
                        prepend-icon="mdi-refresh"
                        >
                        Re-generate
                        </v-btn>
                      </template>
                      <template v-else>
                        <div v-if="user.parent_id">
                          <v-btn
                            color="primary"
                            variant="elevated"
                            :loading="reportLoading"
                            :disabled="reportLoading"
                            @click="generateReport()"
                          prepend-icon="mdi-file-document"
                          >
                            Generate Report
                          </v-btn>
                        </div>
                      <v-alert v-else type="warning" variant="tonal">
                            Match Maverick to Results
                          </v-alert>
                      </template>
                  </div>

                  <div v-if="!user.report_id" class="no-content">
                        <v-alert type="info" variant="tonal">
                          Report not available
                        </v-alert>
                      </div>
                      <iframe
                        v-else
                        :src="user.report_id"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allow="fullscreen"
                        @error="onIframeError"
                      ></iframe>
                </div>
                </v-tabs-window-item>
              </v-tabs-window>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card class="dialog-card">
      <v-card-title class="dialog-title">Delete Document</v-card-title>
      <v-card-text class="dialog-text">
        Are you sure you want to delete this document?
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-btn
          color="grey"
          variant="text"
          @click="deleteDialog = false"
          :disabled="deleteLoading"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="elevated"
          @click="deleteDocumentFunction"
          :loading="deleteLoading"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="refreshDialog" max-width="600px" persistent>
    <v-card class="dialog-card">
      <v-card-title class="dialog-title">Re-grade Document</v-card-title>
      <v-card-text class="dialog-text">
        Current document will be deleted and re-graded. Are you sure you want to proceed?
        <div v-if="displayMore" class="progress-messages">
          <div
                v-for="(msg, index) in progressMessages"
                :key="index"
            class="progress-message"
                :class="getMessageClass(msg)"
              >
            <v-icon :color="getIconColor(msg)" size="small">
                  {{ getIcon(msg) }}
                </v-icon>
            <span>{{ msg }}</span>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-btn
          color="grey"
          variant="text"
          @click="refreshDialog = false"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!displayMore"
          color="error"
          variant="elevated"
          @click="refreshDocumentFunction"
        >
          Re-grade
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="lookUpUsersDialog" persistent max-width="800px">
    <LookupUsers
      :user="user"
      @closeDialog="closeLookupDialog"
      :facilities="facilities"
    />
  </v-dialog>
</template>

<script>
import api from "@/plugins/axios";
import LookupUsers from "./LookupUsers.vue";
import ThankYouNotes from "./ThankYouNotes.vue";
import { useToast } from 'vue-toastification';

const toast = useToast();

export default {
  components: {
    LookupUsers,
    ThankYouNotes,
  },
  props: {
    user: {
      type: Object,
    },
    facilities: {
      type: Array,
    },
  },
  emits: ["documentDeleted", "documentRegraded", "scoreUpdated"],
  computed: {
    showMissionsTab() {
      const t = this.user?.document_type;
      return ["Book One", "Book One New", "Book Two", "Book Two New", "Test Extracted"].includes(t);
    },
    showThankYouTab() {
      const t = this.user?.document_type;
      return ["Book One", "Book One New", "Book Two", "Book Two New", "Test Extracted", "Preseason v2"].includes(t);
    },
    showCertificateTab() {
      const t = this.user?.document_type;
      const allowed = [
        "Book One",
        "Book One New",
        "Book Two",
        "Book Two New",
        "Test Extracted",
        "Preseason v2",
        "Spanish Transform Your Hustle",
        "English Transform Your Hustle",
        "English Transform Your Hustle 1",
      ];
      return allowed.includes(t);
    },
    showReportTab() {
      return this.showCertificateTab;
    },
    missionsPassCount() {
      return (this.missions || []).filter(m => m.value === true).length;
    },
    missionsPoints() {
      return this.missionsPassCount * 90;
    },
    selectedMission() {
      if (!this.selectedMissionKey) return null;
      return (this.missions || []).find(m => m.key === this.selectedMissionKey) || null;
    },
    selectedMissionLabel() {
      return this.selectedMission ? this.selectedMission.label : null;
    },
    selectedMissionAnswers() {
      if (!this.selectedMissionKey || !this.missionsContent) return null;
      return this.missionsContent[this.selectedMissionKey] || null;
    },
  },
  data() {
    return {
      documentId: null,
      marks: {},
      pdfBlobUrl: null,
      imageBlobUrl: null,
      currentView: "pdf",
      items: [],
      loading: [true],
      tab: "pdf",
      tab2: "bubble",
      imageID: null,
      answerOptions: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      selectedDocument: null,
      deleteDialog: false,
      refreshDialog: false,
      progressMessages: [],
      displayMore: false,
      deleteLoading: false,
      lookUpUsersDialog: false,
      eventSource: null,
      maverickProfile: null,
      bubbleSheetData: null,
      answerKeyData: null,
      isGoogleSignedIn: false,
      googleToken: null,
      googleClient: null,
      certificateBlobUrl: null,
      googleTokenExpiryAt: 0,
      googleRefreshTimer: null,
      certificateLoading: false,
  reportLoading: false,
      missions: [],
  missionsLoaded: false,
  missionsContent: null,
  selectedMissionKey: null,
    };
  },
  mounted() {
    this.processUserData();
    this.loadDocumentFiles();
    this.initGoogle();
    this.ensureValidTab2();
    this.initMissionsFromUser();
  },

  beforeUnmount() {
    if (this.eventSource) {
      console.log("Closing EventSource on component unmount");
      this.eventSource.close();
      this.eventSource = null;
    }
    try {
      if (this.pdfBlobUrl) URL.revokeObjectURL(this.pdfBlobUrl);
      if (this.imageBlobUrl) URL.revokeObjectURL(this.imageBlobUrl);
      if (this.certificateBlobUrl) URL.revokeObjectURL(this.certificateBlobUrl);
    } catch {}
    if (this.googleRefreshTimer) {
      clearTimeout(this.googleRefreshTimer);
      this.googleRefreshTimer = null;
    }
  },
  methods: {
    closeLookupDialog() {
      this.lookUpUsersDialog = false;
    },
    toggleMission(key) {
      this.selectedMissionKey = this.selectedMissionKey === key ? null : key;
    },
    async initGoogle() {
      try {
        await this.loadGoogleScript();
        this.initGoogleOAuth();
        this.tryRestoreGoogleSession();
      } catch (e) {
        console.warn("Failed to initialize Google Sign-In:", e);
      }
    },
    loadGoogleScript() {
      return new Promise((resolve, reject) => {
        if (
          window.google &&
          window.google.accounts &&
          window.google.accounts.oauth2
        ) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });
    },
    initGoogleOAuth() {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn(
          "VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work."
        );
        return;
      }
      this.googleClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            this.onGoogleTokenReceived(tokenResponse);
          }
        },
      });
    },
    onGoogleTokenReceived(tokenResponse) {
      this.googleToken = tokenResponse.access_token;
      this.isGoogleSignedIn = true;
      const expiresInSec = Number(tokenResponse.expires_in || 3600);
      this.googleTokenExpiryAt = Date.now() + expiresInSec * 1000;
      localStorage.setItem("drive_access_token", this.googleToken);
      localStorage.setItem(
        "drive_token_expiry",
        String(this.googleTokenExpiryAt)
      );
      this.prepareDrivePreviews();
      this.scheduleTokenRefresh(this.googleTokenExpiryAt - 60 * 1000);
    },
    scheduleTokenRefresh(whenMs) {
      if (this.googleRefreshTimer) clearTimeout(this.googleRefreshTimer);
      const delay = Math.max(5000, whenMs - Date.now());
      this.googleRefreshTimer = setTimeout(() => {
        this.silentRefreshToken();
      }, delay);
    },
    tryRestoreGoogleSession() {
      try {
        const storedToken = localStorage.getItem("drive_access_token");
        const storedExpiry = Number(
          localStorage.getItem("drive_token_expiry") || 0
        );
        if (storedToken && storedExpiry && Date.now() < storedExpiry) {
          this.googleToken = storedToken;
          this.googleTokenExpiryAt = storedExpiry;
          this.isGoogleSignedIn = true;
          this.prepareDrivePreviews();
          this.scheduleTokenRefresh(storedExpiry - 60 * 1000);
        } else if (this.googleClient) {
          this.silentRefreshToken();
        }
      } catch (e) {
        console.warn("Failed to restore Google session:", e);
      }
    },
    silentRefreshToken() {
      if (!this.googleClient) return;
      try {
        this.googleClient.requestAccessToken({ prompt: "" });
      } catch (e) {
        console.warn("Silent token refresh failed:", e);
      }
    },
    handleGoogleSignIn() {
      if (!this.googleClient) {
        this.initGoogle();
        if (!this.googleClient) return;
      }
      try {
        this.googleClient.requestAccessToken({ prompt: "consent" });
      } catch (e) {
        console.error("Google Sign-In failed:", e);
      }
    },
    async fetchDriveFileBlobUrl(fileId) {
      if (!this.googleToken || !fileId) return null;
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: { Authorization: `Bearer ${this.googleToken}` },
          }
        );
        if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch (e) {
        console.warn("Failed to fetch Drive file via API:", e);
        return null;
      }
    },
    async prepareDrivePreviews() {
      if (this.documentId) {
        const url = await this.fetchDriveFileBlobUrl(this.documentId);
        if (url) this.pdfBlobUrl = url;
      }
      if (this.imageID) {
        const url = await this.fetchDriveFileBlobUrl(this.imageID);
        if (url) this.imageBlobUrl = url;
      }
    },
    downloadFromUrl(url, filename) {
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "download.pdf";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        this.openInNewTab(url);
      }
    },
    async deleteDocumentFunction() {
      this.deleteLoading = true;
      try {
        const res = await api.post("/delete-results-document", {
          document_type: this.user.document_type,
          bubble_id: this.user.bubble_id,
        });
        if (res.status === 200) {
          this.deleteDialog = false;
          this.$emit("documentDeleted", this.documentId);
          this.deleteLoading = false;
          toast.success("Document deleted successfully! 🗑️");
        }
      } catch (err) {
        console.error(err);
        this.deleteLoading = false;
        toast.error("Failed to delete document");
      }
    },
    async refreshDocumentFunction() {
      try {
        this.displayMore = true;
        this.progressMessages = [];

        if (this.eventSource) {
          this.eventSource.close();
        }

        const backendUrl = import.meta.env.VITE_API_URL || "/api";

        this.eventSource = new EventSource(
          `${backendUrl}/stream-regrade-ocr?document_id=${
            this.documentId
          }&_=${Date.now()}`
        );

        console.log("EventSource created, connecting to server...");

        this.eventSource.onopen = () => {
          console.log("SSE connection opened");
          this.progressMessages.push("Connection established with server...");
        };

        this.eventSource.onmessage = (event) => {
          console.log("Received SSE message:", event.data);

          const msg = event.data.trim();
          this.progressMessages.push(msg);

          this.$nextTick(() => {
            const container = document.querySelector(".progress-messages");
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });

          if (
            msg === "DONE" ||
            msg.includes("Regrading completed successfully")
          ) {
            console.log("Processing complete, closing EventSource");
            this.eventSource.close();
            this.refreshDialog = false;
            this.loadDocumentFiles();
            this.processUserData();
            this.$emit("documentRegraded", this.documentId);
          }
        };

        this.eventSource.onerror = (err) => {
          console.error("SSE connection error", err);
          this.progressMessages.push(
            `Error: Connection to server failed or was interrupted.`
          );
          this.eventSource.close();
        };
      } catch (err) {
        console.error("Error setting up SSE connection:", err);
        this.progressMessages.push(`Error: ${err.message}`);
      }
    },

    scoreStatus(item) {
      if (item.answer === item.correct) {
        return "Correct";
      } else if (item.correct === "Any") {
        return "Correct";
      } else if (item.answer.split(",").includes(item.correct)) {
        return "Correct";
      }
      return "Incorrect";
    },
    async saveNewAnswer(item) {
      try {
        this.calculateMarks();
        const mandatoryScore = this.getMandatoryScore();

        const res = await api.post("/save-new-answer", {
          bubble_id: this.user.bubble_id,
          question_number: item.question_number,
          answer: item.answer,
          type: item.type,
          score: mandatoryScore,
        });
        console.log("Answer saved:", res.data);
        
        // Emit scoreUpdated only when actually saving
        this.$emit("scoreUpdated", {
          documentId: this.documentId,
          bubble_id: this.user.bubble_id,
          marks: this.marks,
        });
      } catch (err) {
        console.error("Error saving answer:", err);
      }
      console.log("Answer updated:", item.question, "→", item.answer);
    },
    getMandatoryScore() {
      const mandatoryMark = this.marks.find(
        (mark) => mark.variant && mark.variant.toLowerCase() === "mandatory"
      );
      return mandatoryMark ? mandatoryMark.score : null;
    },
    updateMarks(new_item) {
      const mark = this.marks.find((m) => m.variant === new_item.variant);
      if (mark) {
        mark.score = new_item.score;
        mark.correct = new_item.correct;
      } else {
        console.warn("Variant not found in marks:", new_item.variant);
      }
    },
    async loadDocumentFiles() {
      this.loading[0] = true;
      try {
        const res = await api.post("/get-document-image", {
          document_id: this.documentId,
        });
        this.imageID = res.data.image_document_id;
        if (this.isGoogleSignedIn) this.prepareDrivePreviews();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading[0] = false;
      }
    },

    base64ToBlob(base64, mimeType) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    },
    nextPage() {
      this.currentView = this.currentView === "pdf" ? "image" : "pdf";
    },
    prevPage() {
      this.currentView = this.currentView === "pdf" ? "image" : "pdf";
    },
    async getDocumentDetails() {
      console.warn(
        "getDocumentDetails called but data should come from user prop"
      );
      this.processUserData();
    },
    processUserData() {
      console.log("Processing user data:", this.user);

      if (
        this.user.bubble_sheet_data &&
        this.user.bubble_sheet_data["Document ID"]
      ) {
        this.documentId = this.user.bubble_sheet_data["Document ID"];
      } else if (this.user.document_id) {
        this.documentId = this.user.document_id;
      }

      this.bubbleSheetData = this.user.bubble_sheet_data;

      this.maverickProfile = {
        Name_first: this.user.maverick_name_first,
        Name_middle: this.user.maverick_name_middle,
        Name_last: this.user.maverick_name_last,
        "DOC ID Number": this.user.maverick_doc_id,
        "Date of Birth": this.user.maverick_date_of_birth,
        "Last Known Facility ID": this.user.maverick_facility_id,
      };

      this.getAnswerKey();

      if (this.isGoogleSignedIn) this.prepareDrivePreviews();
    },
    async getAnswerKey() {
      try {
        const res = await api.post("/get-answer-key", {
          document_type: this.user.document_type,
        });

        if (res.data) {
          this.answerKeyData = res.data;

          if (this.answerKeyData && this.bubbleSheetData) {
            this.items = this.processAnswerData(
              this.answerKeyData,
              this.bubbleSheetData
            );
            this.calculateMarks();
          }
        }
      } catch (err) {
        console.error("Error fetching answer key:", err);
        if (this.bubbleSheetData) {
          this.items = this.processAnswerDataWithoutKey(this.bubbleSheetData);
          this.calculateMarks();
        }
      }
    },
    processAnswerDataWithoutKey(bubbleSheet) {
      const items = [];

      Object.keys(bubbleSheet).forEach((key) => {
        const questionNumber = parseInt(key);
        if (!isNaN(questionNumber) && questionNumber > 0) {
          const userAnswer = bubbleSheet[key];

          items.push({
            question: `Question ${questionNumber}`,
            answer: userAnswer || "",
            correct: "Unknown",
            variant: "Unknown",
            type: this.user.document_type,
            question_number: questionNumber,
          });
        }
      });

      items.sort((a, b) => a.question_number - b.question_number);
      return items;
    },
    calculateMarks() {
      if (!this.items || this.items.length === 0) {
        this.marks = [];
        return;
      }

      const variantGroups = {};
      this.items.forEach((item) => {
        const variant = item.variant || "Unknown";
        if (!variantGroups[variant]) {
          variantGroups[variant] = [];
        }
        variantGroups[variant].push(item);
      });

      this.marks = [];
      Object.keys(variantGroups).forEach((variant) => {
        const variantItems = variantGroups[variant];
        const totalQuestions = variantItems.length;
        let correctAnswers = 0;

        variantItems.forEach((item) => {
          if (this.scoreStatus(item) === "Correct") {
            correctAnswers++;
          }
        });

        const scorePercentage =
          totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        this.marks.push({
          variant: variant,
          score: scorePercentage,
          correct: correctAnswers,
          total: totalQuestions,
        });
      });

      this.marks.sort((a, b) => a.variant.localeCompare(b.variant));
    },
    getIcon(msg) {
      if (msg.includes("✅")) return "mdi-check-circle";
      if (msg.toLowerCase().includes("error")) return "mdi-alert-circle";
      if (msg.toLowerCase().includes("starting")) return "mdi-play-circle";
      if (msg.toLowerCase().includes("uploaded")) return "mdi-cloud-upload";
      if (msg.toLowerCase().includes("extracted")) return "mdi-file-document";
      return "mdi-information";
    },
    getIconColor(msg) {
      if (msg.includes("✅")) return "green";
      if (msg.toLowerCase().includes("error")) return "red";
      if (msg.toLowerCase().includes("starting")) return "blue";
      if (msg.toLowerCase().includes("uploaded")) return "orange";
      return "grey";
    },
    getMessageClass(msg) {
      if (msg.includes("✅")) return "text-success";
      if (msg.toLowerCase().includes("error")) return "text-error";
      if (msg.toLowerCase().includes("starting")) return "text-primary";
      return "text-body-2";
    },
    processAnswerData(answerKey, bubbleSheet) {
      if (!answerKey || !bubbleSheet) {
        console.warn("Missing answer key or bubble sheet data");
        return [];
      }
      const items = [];

      const answerMap = {};
      const variantMap = {};
      answerKey.forEach((key) => {
        if (key.question) {
          answerMap[key.question] = key.answer;
          variantMap[key.question] = key.variant || "Unknown";
        }
      });

      Object.keys(bubbleSheet).forEach((key) => {
        const questionNumber = parseInt(key);
        if (!isNaN(questionNumber) && questionNumber > 0) {
          const userAnswer = bubbleSheet[key];
          const correctAnswer = answerMap[questionNumber] || "Unknown";
          const variant = variantMap[questionNumber] || "Unknown";

          items.push({
            question: `Question ${questionNumber}`,
            answer: userAnswer || "",
            correct: correctAnswer,
            variant: variant,
            type: this.user.document_type,
            question_number: questionNumber,
          });
        }
      });

      items.sort((a, b) => a.question_number - b.question_number);

      return items;
    },
    openInNewTab(url) {
      window.open(url, "_blank");
    },
    downloadFile(fileId, filename) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onIframeError(event) {
      console.error("Iframe failed to load:", event);
    },
    updateUserData(updatedUser) {
      this.user = updatedUser;
    },
    async generateCertificate() {
      if (this.certificateLoading) return;
      this.certificateLoading = true;
      try {
        const payload = {
          maverick_id: this.user.parent_id,
          document_type: this.user.document_type,
          id: this.user.id,
        };
        const res = await api.post("/generate-certificate", payload);
        const url = res?.data?.file_url || res?.data?.storage_path || null;
        if (url) {
          this.user.certificate_id = url;
        }
      } catch (e) {
        console.error("Failed to generate certificate:", e);
      } finally {
        this.certificateLoading = false;
      }
    },
    async generateReport() {
      if (this.reportLoading) return;
      this.reportLoading = true;
      try {
        const payload = {
          maverick_id: this.user.parent_id,
          document_type: this.user.document_type,
          id: this.user.id,
        };
        const res = await api.post("/generate-report", payload);
        const url = res?.data?.file_url || res?.data?.storage_path || null;
        if (url) {
          this.user.report_id = url;
        }
      } catch (e) {
        console.error("Failed to generate report:", e);
      } finally {
        this.reportLoading = false;
      }
    },
    ensureValidTab2() {
      if (this.tab2 === "missions" && !this.showMissionsTab) this.tab2 = "bubble";
      if (this.tab2 === "thankyou" && !this.showThankYouTab) this.tab2 = "bubble";
    },
    ensureValidMainTab() {
      if (this.tab === 'certificate' && !this.showCertificateTab) this.tab = 'pdf';
      if (this.tab === 'report' && !this.showReportTab) this.tab = 'pdf';
    },
    initMissionsFromUser() {
      const defaults = [];
      for (let i = 1; i <= 10; i++) {
        const key = `m${i}`;
        const val = this.user && typeof this.user[key] !== 'undefined' ? this.user[key] : null;
        defaults.push({ key, label: `Mission ${i}`, value: val });
      }
      this.missions = defaults;
    },
    async loadMissionsContentOnce() {
      if (this.missionsLoaded || !this.user || !this.user.id) return;
      try {
        const res = await api.post('/get-missions-content', {
          extracted_id: this.user.id,
          document_type: this.user.document_type,
        });
        this.missionsContent = res?.data?.missions || null;
        this.missionsLoaded = true;
        console.log('Missions content loaded', this.missionsContent);
      } catch (e) {
        console.warn('Failed to load missions content', e);
      }
    },
    onMissionChange: async function (mission, val) {
      const previous = mission.value;
      mission.value = val;
      if (this.user) {
        this.user[mission.key] = val;
      }
      try {
        if (!this.user || !this.user.id) {
          throw new Error('Missing user id');
        }
        await api.post('/change-mission-mark', {
          id: this.user.id,
          mission: mission.key,
          state: Boolean(val),
          document_type: this.user.document_type,
        });
      } catch (e) {
        console.warn('Failed to update mission status', mission, e);
        mission.value = previous;
        if (this.user) {
          this.user[mission.key] = previous;
        }
      }
    },
  },
  watch: {
    refreshDialog(newValue) {
      if (!newValue) {
        this.displayMore = false;
      }
    },
    googleToken(newVal) {
      if (newVal) this.prepareDrivePreviews();
    },
    documentId(newVal) {
      if (newVal && this.isGoogleSignedIn) this.prepareDrivePreviews();
    },
    imageID(newVal) {
      if (newVal && this.isGoogleSignedIn) this.prepareDrivePreviews();
    },
    "user.certificate_id"(newVal) {
      if (newVal && this.isGoogleSignedIn) this.prepareDrivePreviews();
    },
    "user.document_type"() {
      this.ensureValidTab2();
      this.ensureValidMainTab && this.ensureValidMainTab();
    },
    tab2(newVal, oldVal) {
      if (newVal === 'missions') {
        this.loadMissionsContentOnce();
      }
    },
    user: {
      handler() {
        this.initMissionsFromUser();
        this.ensureValidTab2 && this.ensureValidTab2();
        this.ensureValidMainTab && this.ensureValidMainTab();
        this.missionsLoaded = false;
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.details-container {
  padding: 24px;
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.v-theme--dark .details-container {
  background: #1E293B;
}

/* Actions Header */
.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E5E7EB;
}

.v-theme--dark .actions-header {
  border-bottom-color: #334155;
}

.details-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.v-theme--dark .details-title {
  color: #F9FAFB;
}

.actions-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
}

.action-search {
  background: #3B82F6 !important;
  color: white !important;
}

.action-search:hover {
  background: #2563EB !important;
}

.action-regrade {
  background: #8B5CF6 !important;
  color: white !important;
}

.action-regrade:hover {
  background: #7C3AED !important;
}

.action-delete {
  background: #EF4444 !important;
  color: white !important;
}

.action-delete:hover {
  background: #DC2626 !important;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Section Cards */
.section-card,
.score-card,
.preview-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.v-theme--dark .section-card,
.v-theme--dark .score-card,
.v-theme--dark .preview-card {
  background: #1E293B;
  border-color: #334155;
}

/* Custom Tabs */
.custom-tabs {
  border-bottom: 2px solid #E5E7EB;
}

.v-theme--dark .custom-tabs {
  border-bottom-color: #334155;
}

.custom-tab {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  transition: all 0.2s ease;
}

:deep(.v-tab--selected) {
  color: #3B82F6 !important;
  background: linear-gradient(to bottom, rgba(59, 130, 246, 0.05), transparent);
}

.tabs-content {
  padding: 20px;
}

/* Bubbles Table */
.table-container {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.v-theme--dark .table-container {
  border-color: #334155;
}

.bubbles-table :deep(thead th) {
  background: linear-gradient(to bottom, #F9FAFB, #F3F4F6) !important;
  color: #64748B !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 2;
}

.v-theme--dark .bubbles-table :deep(thead th) {
  background: linear-gradient(to bottom, #0F172A, #1E293B) !important;
  color: #94A3B8 !important;
}

.bubbles-table :deep(tbody tr) {
  transition: background-color 0.2s ease;
}

.bubbles-table :deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.05);
}

.bubbles-table :deep(tbody tr.correct-row) {
  background: rgba(34, 197, 94, 0.05);
}

.v-theme--dark .bubbles-table :deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.1);
}

/* Missions */
.missions-content {
  padding: 4px;
}

.mission-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  transition: all 0.2s ease;
}

.v-theme--dark .mission-row {
  border-color: #334155;
}

.mission-row:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3B82F6;
}

.mission-label {
  cursor: pointer;
  position: relative;
  flex: 1;
  margin-right: 12px;
}

.mission-text {
  color: #3B82F6;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-style: dotted;
  transition: all 0.2s ease;
}

.mission-label:hover .mission-text {
  text-decoration-style: solid;
}

.show-text {
  opacity: 0;
  position: absolute;
  right: 0;
  color: #3B82F6;
  font-weight: 700;
  font-size: 0.875rem;
  transition: opacity 0.2s ease;
}

.mission-label:hover .show-text {
  opacity: 1;
}

.selected-mission-card {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(to bottom, #F9FAFB, #FFFFFF);
  border: 2px solid #E5E7EB;
  border-radius: 12px;
}

.v-theme--dark .selected-mission-card {
  background: linear-gradient(to bottom, #0F172A, #1E293B);
  border-color: #334155;
}

.mission-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3B82F6;
  margin-bottom: 16px;
}

.mission-answers {
  display: grid;
  gap: 8px;
}

.answer-item {
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
}

.v-theme--dark .answer-item {
  background: #1E293B;
  border-color: #334155;
}

.answer-item strong {
  color: #3B82F6;
  margin-right: 8px;
}

/* Score Card */
.score-card {
  margin-bottom: 24px;
}

.score-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(to right, #3B82F6 0%, #6366F1 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.score-icon {
  font-size: 2rem;
}

.score-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.score-content {
  padding: 20px;
}

.score-table :deep(thead th) {
  background: #F9FAFB !important;
  color: #64748B !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.v-theme--dark .score-table :deep(thead th) {
  background: #0F172A !important;
  color: #94A3B8 !important;
}

.score-table :deep(tbody td) {
  padding: 12px 16px;
}

.fw-medium {
  font-weight: 600;
}

.fw-bold {
  font-weight: 700;
}

/* Preview Card */
.preview-content {
  padding: 20px;
}

.signin-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px;
}

.signin-text {
  font-size: 1.125rem;
  color: #64748B;
  margin-bottom: 24px;
}

.v-theme--dark .signin-text {
  color: #94A3B8;
}

.document-viewer {
  padding: 16px 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.no-content {
  padding: 40px;
}

.document-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.open-btn {
  margin-bottom: 16px;
}

.iframe-container,
.image-container {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .iframe-container,
.v-theme--dark .image-container {
  border-color: #334155;
}

.bubble-sheet-image {
  max-width: 100%;
  max-height: 800px;
  display: block;
  margin: 0 auto;
}

/* Dialogs */
.dialog-card {
  border-radius: 16px !important;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 24px 24px 16px;
  color: #3B82F6;
}

.v-theme--dark .dialog-title {
  color: #60A5FA;
}

.dialog-text {
  padding: 16px 24px;
  font-size: 1rem;
  color: #475569;
}

.v-theme--dark .dialog-text {
  color: #CBD5E1;
}

.dialog-actions {
  padding: 16px 24px 24px;
}

.progress-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.v-theme--dark .progress-messages {
  background: #0F172A;
  border-color: #334155;
}

.progress-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  font-size: 0.875rem;
}

.v-theme--dark .progress-message {
  background: #1E293B;
  border-color: #334155;
}

/* Responsive Design */
@media (max-width: 768px) {
  .details-container {
    padding: 16px;
  }

  .actions-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .actions-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
