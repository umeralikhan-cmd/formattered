<template>
  <v-card>
    <v-card-title>
      <v-row no-gutters>
        <v-col> Document Details </v-col> 
        <v-col sm="1" class="text-right">
          <v-btn icon @click="lookUpUsers"><v-icon>mdi-magnify</v-icon></v-btn>
        </v-col>
        <v-col sm="1" class="text-right"
          ><v-btn icon @click="refreshDialog = true"
            ><v-icon>mdi-refresh-auto</v-icon></v-btn
          ></v-col
        >
        <v-col sm="1" class="text-right"
          ><v-btn icon @click="deleteDialog = true"
            ><v-icon>mdi-delete</v-icon></v-btn
          ></v-col
        >
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-row no-gutters>
        <v-col>
          <v-table
            density="compact"
            style="overflow-y: auto; max-height: 1100px"
          >
            <thead>
              <tr>
                <th class="text-left">Question</th>
                <th class="text-left">Answer</th>
                <th class="text-left">Correct</th>
                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index">
                <td>{{ item.question }}</td>
                <td>
                  <v-select
                    flat
                    v-model="item.answer"
                    :items="answerOptions"
                    density="compact"
                    hide-details
                    variant="solo"
                    @update:modelValue="() => saveNewAnswer(item)"
                    style="min-width: 40px"
                  />
                </td>
                <td>
                  {{ item.correct }}
                </td>
                <td>{{ scoreStatus(item) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>Score Summary</v-card-title>
            <v-card-text>
              <v-table density="compact" class="text-sm">
                <thead>
                  <tr>
                    <th class="text-left">Variant</th>
                    <th class="text-left">Score</th>
                    <th class="text-left">Correct</th>
                    <th class="text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(mark, index) in marks" :key="index">
                    <td>{{ mark.variant }}</td>
                    <td>{{ mark.score }}%</td>
                    <td>{{ mark.correct }}</td>
                    <td>{{ mark.total }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
            <v-tabs v-model="tab" fixed-tabs density="compact">
              <v-tab value="pdf">Document</v-tab>
              <v-tab value="image">Bubble sheet</v-tab>
            </v-tabs>

            <v-card-text>
              <v-tabs-window v-model="tab">
                <v-tabs-window-item value="pdf">
                  <v-row no-gutters>
                    <v-col class="text-center">
                      <v-progress-circular
                        v-if="loading[0]"
                        indeterminate
                        color="primary"
                        size="50"
                        class="my-5"
                      ></v-progress-circular>
                      <iframe
                        :src="`https://drive.google.com/file/d/${documentId}/preview`"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allowfullscreen
                      ></iframe>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <v-tabs-window-item value="image">
                  <v-row no-gutters>
                    <v-col class="text-center">
                      <iframe
                        :src="`https://drive.google.com/file/d/${imageID}/preview`"
                        width="100%"
                        height="800"
                        frameborder="0"
                        allowfullscreen
                      ></iframe
                    ></v-col>
                  </v-row>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card style="justify-content: center">
      <v-card-title class="headline">Delete Document</v-card-title>
      <v-card-text>
        Are you sure you want to delete this document?
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          @click="deleteDialog = false"
          :disabled="deleteLoading"
          >Cancel</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          @click="deleteDocumentFunction"
          v-if="!deleteLoading"
          >Delete</v-btn
        >
        <v-progress-circular
          v-if="deleteLoading"
          indeterminate
          color="error"
          size="24"
        ></v-progress-circular>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="refreshDialog" max-width="600px" persistent>
    <v-card style="justify-content: center">
      <v-card-title class="headline">Re-grade Document</v-card-title>
      <v-card-text>
        Current document will be deleted and re-graded. Are you sure you want to
        proceed?
        <v-row v-if="displayMore">
          <!-- Scrollable Progress Messages -->
          <v-sheet
            class="mt-4"
            color="grey-lighten-4"
            rounded
            style="max-height: 300px; overflow-y: auto; padding: 10px"
          >
            <v-list density="compact" lines="one">
              <v-list-item
                v-for="(msg, index) in progressMessages"
                :key="index"
                :class="getMessageClass(msg)"
                style="white-space: pre-wrap; word-break: break-word"
              >
                <v-icon :color="getIconColor(msg)">
                  {{ getIcon(msg) }}
                </v-icon>
                <v-list-item-title
                  style="white-space: pre-wrap; word-break: break-word"
                >
                  {{ msg }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="refreshDialog = false">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          @click="refreshDocumentFunction"
          v-if="!displayMore"
          >Re-grade</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="lookUpUsersDialog">
    <LookupUsers :user="user" @closeDialog="closeDialog" />

  </v-dialog>
</template>

<script>
import api from "@/plugins/axios";  
import LookupUsers from "./LookupUsers.vue";
export default {
  components:{
    LookupUsers
  },
  props: {
    user:{
      type: Object
    }
  },
  emits: [
    "documentDeleted",
    "documentRegraded",
  ],
  data() {
    return {
      headersD: [
        { title: "Question", key: "question" },
        { title: "Answer", key: "answer" },
        { title: "Correct Answer", key: "correct" },
        { title: "Status", key: "status" },
      ],
      documentId: null,
      marks: {},
      pdfBlobUrl: null,
      imageBlobUrl: null,
      currentView: "pdf", // or 'image'
      items: [],
      loading: [true], // Initialize loading state for the PDF tab
      tab: "pdf",
      imageID: null,
      answerOptions: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      selectedDocument: null, // Stores the selected document for deletion
      deleteDialog: false, // Controls the visibility of the delete confirmation dialog
      refreshDialog: false,
      progressMessages: [],
      displayMore: false, // Controls the visibility of the more details section
      deleteLoading: false,
      lookUpUsersDialog:false,
      eventSource: null, // Stores the EventSource instance
    };
  },
  mounted() {
    this.getDocumentDetails();
    this.loadDocumentFiles();
  },
  beforeUnmount() {
    if (this.eventSource) {
      console.log("Closing EventSource on component unmount");
      this.eventSource.close();
      this.eventSource = null;
    }
  },
  methods: {
    closeDialog(){
      this.lookUpUsersDialog= false
    },
    lookUpUsers(){
      this.lookUpUsersDialog = true
    },
    async deleteDocumentFunction() {
      this.deleteLoading = true; // Show loading state
      try {
        const res = await api.post("/delete-document", {
          document_id: this.documentId,
          image_id: this.imageID,
        });
        if (res.status === 200) {
          this.deleteDialog = false; // Close the dialog
          this.$emit("documentDeleted", this.documentId); // Emit an event to notify parent component
          this.deleteLoading = false; // Reset loading state
        }
      } catch (err) {
        console.error(err);
      }
    },
    async refreshDocumentFunction() {
      try {
        this.displayMore = true;
        this.progressMessages = [];
        
        // Close any existing EventSource
        if (this.eventSource) {
          this.eventSource.close();
        }
        
        const backendUrl = import.meta.env.VITE_API_URL || "/api";
        
        // Create a new EventSource
        this.eventSource = new EventSource(
          `${backendUrl}/stream-regrade-ocr?document_id=${this.documentId}&_=${Date.now()}`  // Add cache buster
        );
        
        console.log("EventSource created, connecting to server...");
        
        // Handle connection open
        this.eventSource.onopen = () => {
          console.log("SSE connection opened");
          this.progressMessages.push("Connection established with server...");
        };
        
        // Handle messages
        this.eventSource.onmessage = (event) => {
          console.log("Received SSE message:", event.data);
          
          const msg = event.data.trim();
          this.progressMessages.push(msg);
          
          // Auto-scroll to the latest message
          this.$nextTick(() => {
            const container = document.querySelector('.mt-4');
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
          
          // Check for completion
          if (msg === "DONE" || msg.includes("Regrading completed successfully")) {
            console.log("Processing complete, closing EventSource");
            this.eventSource.close();
            this.refreshDialog = false;
            this.loadDocumentFiles();
            this.getDocumentDetails();
            this.$emit("documentRegraded", this.documentId);
          }
        };
        
        // Handle errors
        this.eventSource.onerror = (err) => {
          console.error("SSE connection error", err);
          this.progressMessages.push(`Error: Connection to server failed or was interrupted.`);
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
        const res = await api.post("/save-new-answer", {
          document_id: this.documentId,
          question: item.question,
          answer: item.answer,
          status: this.scoreStatus(item),
          type: item.type,
        });
        console.log("Response:", res.data);
        this.updateMarks(res.data);
      } catch (err) {
        console.error(err);
      }
      console.log("Answer updated:", item.question, "→", item.answer);
      // You can call an API here or mark as dirty
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
      this.loading[0] = true; // Set loading state for the PDF tab
      try {
        const res = await api.post("/get-document-image", {
          document_id: this.documentId,
        });
        this.imageID = res.data.image_document_id;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading[0] = false; // Reset loading state
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
      try {
        const res = await api.post("/get-results-details", {
          parent_id: this.user.parent_id,
          bubble_id: this.user.bubble_id,
          docuement_type: this.user.docuement_type,
        });
        console.log("Responsublah:", res.data);
        this.items = res.data;
      } catch (err) {
        console.error(err);
      }
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
    updateUserData(updatedUser) {
      // Update the user data in the parent component
      this.user = updatedUser;
    }
  },
  watch: {
    refreshDialog(newValue) {
      if (!newValue) {
        this.displayMore = false;
      }
    },
  },
};
</script>

<style scoped></style>
