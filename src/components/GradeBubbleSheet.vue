<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height mx-auto" max-width="1200">
      <v-card>
        <v-card-title>Manual Grading</v-card-title>

        <v-card-text>
          <v-row>
            <v-col sm="3">
              <v-select
                v-model="selectedQuestionType"
                :items="questionTypes"
                label="Select Question Type"
                outlined
              ></v-select>
            </v-col>
            <v-col sm="7">
              <v-file-input
                v-model="selectedFiles"
                label="Select Files"
                multiple
                outlined
              ></v-file-input>
            </v-col>
            <v-col sm="2">
              <v-btn
                color="primary"
                class="mb-2"
                @click="gradeFiles"
                :disabled="uploading"
              >
                <template v-if="!uploading">
                  <b>Grade</b>
                </template>
                <template v-else>
                  <b>Loading</b>
                  <v-progress-circular
                    color="success"
                    indeterminate
                    size="20"
                  ></v-progress-circular>
                </template>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Progress Messages -->
        <v-card-text v-if="progressMessages.length">
          <div class="text-body-2 mb-3">
            <div v-for="(msg, idx) in progressMessages" :key="idx" class="py-1">
              <v-icon start size="small">mdi-progress-clock</v-icon> {{ msg }}
            </div>
          </div>
        </v-card-text>

        <!-- Final Grading Results -->
        <v-card-text v-if="results.length > 0">
          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col
              v-for="(item, index) in results"
              :key="index"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card elevation="2">
                <!-- Display the image -->
                <v-img
                  :src="item.images"
                  aspect-ratio="16/9"
                  class="mb-2"
                  max-height="800"
                ></v-img>
                <!-- Display marks -->
                <v-card-subtitle>Score Summary:</v-card-subtitle>
                <v-card-text>
                  <div v-for="(data, variant) in item.marks" :key="variant">
                    <b>{{ variant }}:</b> {{ data.correct }}/{{
                      data.total
                    }}
                    ({{ data.score }}%)
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
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
      selectedFile: null,
      selectedQuestionType: "Preseason v1",
      questionTypes: [],
      selectedFiles: [],
      results: [], // Contains the images and marks
      progressMessages: [],
    };
  },

  mounted() {
    this.getQuestionTypes();
  },
  methods: {
    async getQuestionTypes() {
      try {
        const res = await api.post("/get-question-types");
        this.questionTypes = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async gradeFiles() {
      this.results = []; // Reset results
      if (this.selectedFiles.length === 0) {
        return;
      }

      this.uploading = true;
      this.progressMessages = [];

      try {
        await this.startGradingStream(this.selectedFiles[0]);
        this.uploading = false;
      } catch (err) {
        console.error("Grading error:", err);
        this.uploading = false;
      }
    },
    async startGradingStream(file) {
      const formData = new FormData();
      formData.append("question_type", this.selectedQuestionType);
      formData.append("file", file);

      const backendUrl = import.meta.env.VITE_API_URL || "/api";

      const response = await fetch(`${backendUrl}/grade-files`, {
        method: "POST",
        body: formData,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        let lines = partial.split("\n\n");
        partial = lines.pop(); // Keep the last incomplete

        for (let line of lines) {
          if (line.startsWith("data:")) {
            const msg = line.replace("data:", "").trim();
            try {
              const parsed = JSON.parse(msg);
              if (parsed.results) {
                this.results = parsed.results; // Update results with images and marks
                console.log("Grading results:", this.results);
                this.selectedFiles = []; // Clear selected files after grading
              } else {
                this.progressMessages.push(msg);
              }
            } catch (e) {
              this.progressMessages.push(msg);
            }
          }
        }
      }
    },
  },
};
</script>
