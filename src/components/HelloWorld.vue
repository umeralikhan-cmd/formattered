<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height mx-auto" max-width="900">
      <v-card>
        <v-card-title>
          Select Question Type
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedQuestionType"
            :items="questionTypes"
            label="Select Question Type"
            @update:modelValue="getAnswerKey"
            outlined
          ></v-select>
        </v-card-text>

        <v-card-title>
          Upload PDF
        </v-card-title>

        <v-card-text>
          <v-btn color="primary" class="mb-2" @click="triggerFileInput">
            Select PDF
          </v-btn>

          <!-- Hidden file input -->
          <input
            type="file"
            accept="application/pdf"
            ref="fileInputRef"
            style="display: none"
            @change="handleFileChange"
          />

          <v-btn
            color="success"
            class="mb-2 ml-2"
            :disabled="!selectedFile"
            @click="uploadFile"
          >
            Upload to Server
          </v-btn>

          <div v-if="imageInfo.length">
            <h3>PDF Converted Pages</h3>
            <div v-for="(page, index) in imageInfo" :key="index">
              <img :src="page.image_base64" :alt="'Page ' + page.page" width="300" />
              <a :href="page.image_base64" :download="'page_' + page.page + '.png'">
                <v-btn small>Download Page {{ page.page }}</v-btn>
              </a>
            </div>
          </div>

          <div>
            <h1>Users</h1>
            <ul>
              <li v-for="user in users" :key="user.id">
                {{ user.name }} — {{ user.email }}
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

export default {
  data() {
    return {
      users: [],
      selectedFile: null,
      imageInfo: [],
      fileInputRef: null,
      selectedQuestionType: null,
      questionTypes: [],
      answerKey:{},
    }
  },
  mounted() {
    //this.fetchUsers()
    //this.getQuestionTypes()
  },
  methods: {
    async getAnswerKey() {
      if (!this.selectedQuestionType) {
        console.error('No question type selected')
        return
      }

      try {
        const res = await api.post('/get-answer-key', { question_type: this.selectedQuestionType })
        console.log('Response:', res.data)
        this.answerKey = res.data
      } catch (err) {
        console.error(err)
      }
    },
    async getQuestionTypes() {
      try {
        const res = await api.post('/get-question-types')
        console.log('Response:', res.data)
        this.questionTypes = res.data
      } catch (err) {
        console.error(err)
      }
    },

    triggerFileInput() {
      this.$refs.fileInputRef.click()
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file
      } else {
        this.selectedFile = null
        alert('Please select a valid PDF file.')
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        console.error('No file selected')
        return
      }

      const formData = new FormData()
      formData.append('file', this.selectedFile)
      formData.append('question_type', this.selectedQuestionType)

      try {
        const res = await api.post('/match-template', formData)

        console.log('Response:', res.data)
        this.imageInfo = res.data.matched_pages
      } catch (err) {
        console.error(err)
      }
    },
    async fetchUsers() {
      try {
        const res = await api.get('/users')
        this.users = res.data
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
  }
}
</script>
