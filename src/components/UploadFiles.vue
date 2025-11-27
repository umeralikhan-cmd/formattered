<template>
  <div class="upload-container">
    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Upload Section -->
      <div class="upload-section">
        <div class="section-header">
          <div class="section-title-group">
            <v-icon size="20" class="section-icon">mdi-file-upload-outline</v-icon>
            <h2 class="section-title">Upload Documents</h2>
          </div>
        </div>
        
        <div class="upload-area">
          <v-file-upload 
            v-model="selectedFiles" 
            scrim="primary" 
            clearable 
            multiple
            class="file-upload"
          />
          
          <v-btn
            color="primary"
            size="large"
            @click="uploadFiles"
            :disabled="uploading || !selectedFiles || (Array.isArray(selectedFiles) && selectedFiles.length === 0)"
            :loading="uploading"
            class="upload-btn"
          >
            <v-icon start>mdi-cloud-upload</v-icon>
            {{ uploading ? 'Uploading...' : 'Upload Files' }}
          </v-btn>
        </div>
      </div>

      <!-- Google Drive Section -->
      <div class="drive-section">
        <div class="section-header">
          <div class="section-title-group">
            <v-icon size="20" class="section-icon">mdi-google-drive</v-icon>
            <h2 class="section-title">Google Drive</h2>
          </div>
          <div class="section-actions">
            <v-btn
              variant="text"
              size="small"
              @click="ScanGoogleDrive"
              :disabled="reloading"
              class="scan-btn"
            >
              <v-icon start size="18">mdi-refresh</v-icon>
              Scan Drive
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              @click="ProcessDocs"
              :disabled="filesInDrive.length === 0 || reloading"
              :loading="reloading"
              class="process-btn"
            >
              <v-icon start>mdi-play-circle-outline</v-icon>
              {{ reloading ? 'Processing...' : 'Start Grading' }}
            </v-btn>
          </div>
        </div>

        <!-- Status Card -->
        <div class="status-card">
          <div class="status-header">
            <div class="status-info">
              <h3 class="status-title">{{ titleMessage || 'Ready to scan' }}</h3>
              <p class="status-subtitle">{{ firstActionMessage }}</p>
            </div>
            <div v-if="scanLength > 0" class="status-badge">
              <v-icon size="16">mdi-file-document-multiple-outline</v-icon>
              {{ scanLength }} {{ scanLength === 1 ? 'file' : 'files' }}
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="scanLength > 0" class="progress-section">
            <div class="progress-info">
              <span class="progress-label">Processing Progress</span>
              <span class="progress-value">{{ firstActionValue }}</span>
            </div>
            <v-progress-linear
              :model-value="ocrValue"
              :max="scanLength"
              height="8"
              rounded
              color="primary"
              bg-color="grey-lighten-3"
              class="progress-bar"
            />
          </div>

          <!-- Progress Messages -->
          <div v-if="progressMessages.length > 0" class="messages-section">
            <div class="messages-header">
              <v-icon size="16">mdi-format-list-bulleted</v-icon>
              <span>Processing Log</span>
            </div>
            <div class="messages-list">
              <div
                v-for="(msg, index) in progressMessages"
                :key="index"
                class="message-item"
              >
                <v-icon 
                  :color="getIconColor(msg)" 
                  size="16"
                  class="message-icon"
                >
                  {{ getIcon(msg) }}
                </v-icon>
                <span class="message-text">{{ msg }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useQuery } from '@tanstack/vue-query';
import { useToast } from 'vue-toastification';
import api from "@/plugins/axios";
import { VFileUpload } from "vuetify/labs/VFileUpload";

const toast = useToast();

// Props
const props = defineProps({
  refreshScan: {
    type: Boolean,
    default: false,
  },
});

// Reactive state
const uploading = ref(false);
const reloading = ref(false);
const mainFolder = ref("Triage Inbox (WIP)");
const titleMessage = ref("");
const scanLength = ref(0);
const firstActionMessage = ref("");
const ocrValue = ref(0);
const progressMessages = ref([]);
const filesInDrive = ref([]);
const selectedFiles = ref(null);
const manualScan = ref(false); // Track if user manually clicked scan
const hasAutoProcessed = ref(false); // Track if auto-processing already happened

// TanStack Query - Fetch Google Drive files
const { data: driveFilesData, refetch: refetchDrive, isError, error } = useQuery({
  queryKey: ['googleDriveFiles'],
  queryFn: async () => {
    const res = await api.post("/scan-google-drive");
    if (res.data?.status === "success") {
      return res.data.files || [];
    }
    return [];
  },
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 60 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Use cached data if available
  refetchOnReconnect: false,
});

// Watch for data changes from query
watch(driveFilesData, async (files) => {
  if (files) {
    if (files.length > 0) {
      scanLength.value = files.length;
      titleMessage.value = "Files found: " + files.length;
      filesInDrive.value = files;
      console.log("Files found:", files);
      
      // Only show toast if user manually clicked scan
      if (manualScan.value) {
        toast.success(`Found ${files.length} ${files.length === 1 ? 'file' : 'files'} in Google Drive!`);
      }
      
      // Auto-process files on initial load (only once)
      if (!hasAutoProcessed.value && !manualScan.value) {
        hasAutoProcessed.value = true;
        console.log("Auto-processing files on page load...");
        await ProcessDocs();
      }
    } else {
      ocrValue.value = 0;
      scanLength.value = 0;
      filesInDrive.value = [];
      titleMessage.value = "No files found";
      // Only show toast if user manually clicked scan
      if (manualScan.value) {
        toast.warning('No files found in Google Drive');
      }
    }
    manualScan.value = false; // Reset flag after processing
  }
}, { immediate: true }); // Process data immediately when available

// Watch for errors
watch(isError, (hasError) => {
  if (hasError) {
    console.error("Error scanning Google Drive", error.value);
    titleMessage.value = "Error scanning drive";
    // Only show error toast if user manually clicked scan
    if (manualScan.value) {
      toast.error('Failed to scan Google Drive');
    }
    manualScan.value = false;
  }
});


// Computed
const firstActionValue = computed(() => {
  return ocrValue.value + "/" + scanLength.value;
});

// Methods
const ScanGoogleDrive = async () => {
  manualScan.value = true; // Set flag to show toast
  toast.info('Scanning Google Drive...');
  await refetchDrive();
};
const ProcessDocs = async () => {
  console.log('ProcessDocs called');
  console.log('Files in drive:', filesInDrive.value);
  
  if (!filesInDrive.value || filesInDrive.value.length === 0) {
    toast.warning('No files to process');
    return;
  }
  
  reloading.value = true;
  firstActionMessage.value = "Processing files...";
  progressMessages.value = [];
  ocrValue.value = 0;
  
  toast.info(`Starting to process ${filesInDrive.value.length} files...`);
  
  for (const file of filesInDrive.value) {
    // Check if file is CSV
    const fileName = file.name.toLowerCase();
    const isCsvFile = fileName === "edovo.csv" || fileName.endsWith(".csv");

    if (isCsvFile) {
      await processEdovoFile(file);
    } else {
      await startOcrStreamSequential(file);
    }
    ocrValue.value++;
  }
  
  // Silently refresh the drive files list (no toast)
  await refetchDrive();
  firstActionMessage.value = "Processing completed";
  reloading.value = false;
  toast.success('All files processed successfully! ✅');
};

const startOcrStreamSequential = (file) => {
  return new Promise((resolve) => {
    const fileId = file.id;
    const fileName = encodeURIComponent(file.name);
    const backendUrl = import.meta.env.VITE_API_URL || "/api";
    const eventSource = new EventSource(
      `${backendUrl}/stream-ocr?file_id=${fileId}&file_name=${fileName}`
    );

    eventSource.onmessage = (event) => {
      const msg = event.data.trim();
      console.log("OCR progress:", msg);
      progressMessages.value.push(msg);
      if (msg === "DONE") {
        eventSource.close();
        resolve();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      eventSource.close();
      resolve(); // fail-safe resolve
    };
  });
};

const processEdovoFile = (file) => {
  return new Promise((resolve) => {
    const fileId = file.id;
    const fileName = encodeURIComponent(file.name);
    const backendUrl = import.meta.env.VITE_API_URL || "/api";
    const eventSource = new EventSource(
      `${backendUrl}/process-edovo?file_id=${fileId}&file_name=${fileName}`
    );

    progressMessages.value.push(`Starting Edovo CSV processing: ${file.name}`);

    eventSource.onmessage = (event) => {
      const msg = event.data.trim();
      console.log("Edovo processing progress:", msg);
      progressMessages.value.push(msg);
      if (msg === "DONE") {
        eventSource.close();
        resolve();
      }
    };

    eventSource.onerror = (err) => {
      console.error("Edovo processing SSE connection error", err);
      progressMessages.value.push(`Error processing CSV file: ${file.name}`);
      eventSource.close();
      resolve(); // fail-safe resolve
    };
  });
};

const uploadFiles = async () => {
  const files = Array.isArray(selectedFiles.value) ? selectedFiles.value : (selectedFiles.value ? [selectedFiles.value] : []);
  
  if (files.length === 0) {
    toast.error('No files selected');
    return;
  }
  
  uploading.value = true;
  const formData = new FormData();
  formData.append("question_type", mainFolder.value);

  for (let file of files) {
    formData.append("files", file);
  }

  try {
    const res = await api.post("/upload-to-google-drive", formData);
    uploading.value = false;
    
    const uploadedCount = res.data.uploaded?.length || files.length;
    toast.success(`${uploadedCount} ${uploadedCount === 1 ? 'file' : 'files'} uploaded successfully! 🎉`);
    selectedFiles.value = null;
    
    setTimeout(() => {
      ScanGoogleDrive();
    }, 2000);
  } catch (err) {
    console.error(err);
    uploading.value = false;
    toast.error('Error uploading files');
  }
};

const getIcon = (msg) => {
  if (msg.includes("✅")) return "mdi-check-circle";
  if (msg.toLowerCase().includes("error")) return "mdi-alert-circle";
  if (msg.toLowerCase().includes("starting")) return "mdi-play-circle";
  if (msg.toLowerCase().includes("uploaded")) return "mdi-cloud-upload";
  if (msg.toLowerCase().includes("extracted")) return "mdi-file-document";
  return "mdi-information";
};

const getIconColor = (msg) => {
  if (msg.includes("✅")) return "green";
  if (msg.toLowerCase().includes("error")) return "red";
  if (msg.toLowerCase().includes("starting")) return "blue";
  if (msg.toLowerCase().includes("uploaded")) return "orange";
  return "grey";
};
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
}

.v-theme--dark .upload-container {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
}

/* Content */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Sections */
.upload-section,
.drive-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.upload-section:hover,
.drive-section:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  border-color: #D1D5DB;
  transform: translateY(-1px);
}

.v-theme--dark .upload-section,
.v-theme--dark .drive-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .upload-section:hover,
.v-theme--dark .drive-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.section-header {
  padding: 24px 28px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(to bottom, #FFFFFF, #FAFBFC);
}

.v-theme--dark .section-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1A2332, #151E2E);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  color: #6366F1;
  opacity: 0.85;
}

.v-theme--dark .section-icon {
  color: #818CF8;
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
  color: #F8FAFC;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Upload Area */
.upload-area {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.v-theme--dark .upload-area {
  background: #151E2E;
  border-top-color: #334155;
}

.file-upload {
  width: 100%;
  border: 2px dashed #D1D5DB !important;
  border-radius: 12px;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.file-upload:hover {
  border-color: #9CA3AF !important;
  background: #FAFBFC;
}

.v-theme--dark .file-upload {
  border-color: #475569 !important;
  background: #1E293B;
}

.v-theme--dark .file-upload:hover {
  border-color: #64748B !important;
}

.upload-btn {
  align-self: flex-start;
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2) !important;
  border: 1px solid #6366F1 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  cursor: pointer !important;
}

.upload-btn:not(:disabled):hover {
  border-color: #4F46E5 !important;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3) !important;
  cursor: pointer !important;
}

.upload-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Status Card */
.status-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.v-theme--dark .status-card {
  background: #151E2E;
  border-top-color: #334155;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.v-theme--dark .status-header {
  border-bottom-color: #334155;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.v-theme--dark .status-title {
  color: #F9FAFB;
}

.status-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .status-subtitle {
  color: #9CA3AF;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4338CA;
  white-space: nowrap;
  border: 1px solid #C7D2FE;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.15);
}

.v-theme--dark .status-badge {
  background: linear-gradient(135deg, #312E81, #3730A3);
  color: #A5B4FC;
  border: 1px solid #4C1D95;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.v-theme--dark .progress-section {
  background: #1E293B;
  border-color: #334155;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.v-theme--dark .progress-label {
  color: #D1D5DB;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366F1;
}

.v-theme--dark .progress-value {
  color: #818CF8;
}

.progress-bar {
  border-radius: 4px;
}

/* Messages Section */
.messages-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.v-theme--dark .messages-section {
  background: #1E293B;
  border-color: #334155;
}

.messages-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.v-theme--dark .messages-header {
  color: #D1D5DB;
  border-bottom-color: #334155;
}

.messages-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #F9FAFB;
}

.v-theme--dark .messages-list {
  background: #0F172A;
  border-color: #334155;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #FFFFFF;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: all 0.2s ease;
  border: 1px solid #F3F4F6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.v-theme--dark .message-item {
  background: #1E293B;
  border-color: transparent;
}

.message-item:hover {
  background: #F9FAFB;
  border-color: #E5E7EB;
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.v-theme--dark .message-item:hover {
  background: #334155;
  border-color: #475569;
  transform: translateX(4px);
}

.message-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.message-text {
  flex: 1;
  color: #374151;
}

.v-theme--dark .message-text {
  color: #D1D5DB;
}

/* Buttons */
.scan-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  color: #6B7280 !important;
  border: 1px solid #D1D5DB !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  background: #FFFFFF !important;
  cursor: pointer !important;
}

.v-theme--dark .scan-btn {
  color: #9CA3AF !important;
  border-color: #334155 !important;
  background: transparent !important;
}

.scan-btn:not(:disabled):hover {
  border-color: #9CA3AF !important;
  background: #F9FAFB !important;
  color: #374151 !important;
  cursor: pointer !important;
}

.v-theme--dark .scan-btn:not(:disabled):hover {
  border-color: #475569 !important;
  background: #1E293B !important;
}

.scan-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.process-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  border: 1px solid #6366F1 !important;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2) !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  cursor: pointer !important;
}

.process-btn:not(:disabled):hover {
  border-color: #4F46E5 !important;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3) !important;
  cursor: pointer !important;
}

.process-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 20px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .content-wrapper {
    padding: 16px;
    gap: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    flex-direction: column;
  }

  .section-actions .v-btn {
    width: 100%;
  }

  .status-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }

  .upload-area {
    padding: 16px;
  }

  .upload-btn {
    width: 100%;
  }
}

/* Custom Scrollbar */
.messages-list::-webkit-scrollbar {
  width: 8px;
}

.messages-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.v-theme--dark .messages-list::-webkit-scrollbar-track {
  background: #1F2937;
}

.messages-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.v-theme--dark .messages-list::-webkit-scrollbar-thumb {
  background: #4B5563;
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

.v-theme--dark .messages-list::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}
</style>
