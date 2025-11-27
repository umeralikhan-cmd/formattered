<template>
<v-card style="height: 80%;">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Thank You Note</span>
      <v-btn color="primary" :loading="loading" @click="getThankYouNote">
        Get Thank You Note
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-textarea
        v-model="message"
        label="Message"
        variant="outlined"
        clearable
        density="comfortable"
        placeholder="Write a short thank you note..."
        rows="6"
      />

      <div class="mt-4">
        <div v-if="hasPreview">
          <iframe
            :src="iframeSrc"
            style="width: 100%; height: 800px; border: none"
            allow="autoplay"
            referrerpolicy="no-referrer"
          />
        </div>
        <v-alert v-else type="info" variant="tonal">
          No document to preview. Click "Get Thank You Note" to generate and
          preview.
        </v-alert>
      </div>
    </v-card-text>

  </v-card>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "ThankYouNotes",
  props: {
    user: { type: Object, required: true },
    // documentId prop is no longer used for preview; we only show the generated file URL
    documentId: { type: String, default: null },
  },
  data() {
    return {
      message: "",
      loading: false,
      resultFileUrl: null, // URL returned by backend for the uploaded thank-you page
    };
  },
  computed: {
    hasPreview() {
      return !!this.resultFileUrl;
    },
    iframeSrc() {
      // Only display the generated thank-you note file URL
      return this.resultFileUrl || null;
    },
  },
  mounted() {
    this.populateFromExisting();
  },
  methods: {
    async populateFromExisting() {
      try {
        if (!this.user?.id || !this.user?.document_type) return;
        const res = await api.get(`/thank-you-note/${this.user.id}`, {
          params: { document_type: this.user.document_type },
        });
        const data = res?.data || {};
        if (data?.thankyou_text) this.message = data.thankyou_text;
        if (data?.thankyou_id) this.resultFileUrl = data.thankyou_id;
      } catch (e) {
        // Silent: if not found, user can click button to generate
      }
    },
    async getThankYouNote() {
      if (this.loading) return;
      this.loading = true;
      try {
        const payload = {
          document_id: this.user.document_id,
          document_type: this.user.document_type,
          id: this.user.id, // Extracted row id to update thankyou_id/text
        };
        const res = await api.post("/get-thank-you-note", payload);
        const data = res?.data || {};
        if (data.note) this.message = data.note;
        if (data.file_url) this.resultFileUrl = data.file_url;
      } catch (e) {
        console.error("Failed to get thank you note:", e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
