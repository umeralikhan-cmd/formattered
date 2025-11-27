<template>
  <div class="page-container">
    <Suspense>
      <template #default>
        <UploadFiles :refreshScan="refreshScan" />
      </template>
      <template #fallback>
        <div class="loading-state">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p>Loading upload page...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

// Lazy load components for better performance
const UploadFiles = defineAsyncComponent(() => import("@/components/UploadFiles.vue"));

export default {
  components: {
    UploadFiles,
  },
  data() {
    return {
      refreshScan: true,
      eventSource: null,
    };
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  },
};
</script>
<style scoped>
.page-container {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-state p {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

.v-theme--dark .loading-state p {
  color: #9CA3AF;
}
</style>

