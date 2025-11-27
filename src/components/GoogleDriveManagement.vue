<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height mx-auto" max-width="1200">
      <v-card>
        <v-card-title> Google Drive </v-card-title>

        <v-card-text>
          <v-row>
            <v-col sm="3">
              <v-text-field
              :disabled="true"
                v-model="mainFolder"
                label="Upload Folder"
                outlined></v-text-field>
            </v-col>
            <v-col sm="7">
              <v-file-input
                v-model="selectedFiles"
                label="Select Files"
                multiple
                accept=".pdf"
                outlined
              ></v-file-input>
            </v-col>
            <v-col sm="2">
              <v-btn color="primary" class="mb-2" @click="uploadFiles" :disabled="uploading">
              <b v-if="!uploading">Upload Files</b> <b v-else>Loading</b> <v-progress-circular
                  v-if="uploading"
                  color="success"
                  indeterminate
                ></v-progress-circular>
              </v-btn>
              
            </v-col>
          </v-row>

          <v-row>
            <v-select
              v-model="status"
              :items="statuses"
              label="Status"
              outlined
              @update:modelValue="getGoogleDocuments"
            ></v-select>
            <v-data-table
              :headers="headers"
              :items="items"
              :items-per-page="20"
              :search="status"
            >
              <template v-slot:item.action="{ item, index }">
                <div v-if="item.status === 'unprocessed'">
                  <v-progress-circular
                    v-if="loading[index]"
                    color="success"
                    indeterminate
                  ></v-progress-circular>
                  <v-icon
                    v-else
                    @click="processFile(item, index)"
                    style="cursor: pointer"
                  >
                    mdi-send
                  </v-icon>
                </div>
              </template>
            </v-data-table>
          </v-row>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>

</template>


<script>
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";

export default {
  data() {
    return {
      uploading: false,
      mainFolder: "Triage Inbox (WIP)",
      items: [],
      status: "unprocessed",
      statuses: ["unprocessed", "marked", "sorted"],
      users: [],
      selectedFile: null,
      imageInfo: [],
      fileInputRef: null,
      selectedQuestionType: null,
      questionTypes: [],
      answerKey: {},
      headers: [
        { title: "Document Name", key: "document_name" },
        { title: "Type", key: "type" },
        { title: "Status", key: "status" },
        { title: "Action", key: "action" },
      ],
      selectedFiles: [],
      loading: [],
    };
  },
  mounted() {
    //this.fetchUsers()
    this.getGoogleDocuments();
  },
  methods: {
    async processFile(item, index) {
      this.loading[index] = true;
      try {
        const res = await api.post("/sort-documents", {
          document_id: item.document_id,
        });
        if (res.data) {
          this.loading[index] = false;
          item.status = "marked";
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getGoogleDocuments() {
      let status = this.status;
      if (status === "marked") {
        status = "processed";
      }
      try {
        console.log("Fetching Google documents...", this.status);
        const res = await api.post("/get-google-documents", {
          status: status,
        });

        this.items = res.data;
        
        // loop thought items and renadte status where processed to marked
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].status == "processed") {
            this.items[i].status = "marked";
          }
        }
        console.log(" the items", this.items);
      } catch (err) {
        console.error(err);
      }
    },
    async getQuestionTypes() {
      try {
        const res = await api.post("/get-question-types");
        this.questionTypes = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async checkGoogleDrive() {
      if (!this.selectedQuestionType) {
        console.error("No question type selected");
        return;
      }

      try {
        const res = await api.post("/check-google-drive", {
          question_type: this.selectedQuestionType,
        });
        this.items = res.data;
        console.log(" the items", this.items);
      } catch (err) {
        console.error(err);
      }
    },

    async uploadFiles() {
      if (this.selectedFiles.length === 0) {
        return;
      }
      this.uploading = true;
      const formData = new FormData();
      formData.append("question_type", this.mainFolder);

      for (let file of this.selectedFiles) {
        formData.append("files", file); // backend must expect 'files'
      }

      try {
        await api.post("/upload-to-google-drive", formData);
        this.uploading = false;
        this.selectedFiles = [];
        this.getGoogleDocuments();
         //   this.getGoogleDocuments();
      } catch (err) {
        console.error(err);
      }
    },
    async fetchUsers() {
      try {
        const res = await api.get("/users");
        this.users = res.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
  },
};
</script>
