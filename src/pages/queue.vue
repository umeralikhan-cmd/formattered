<template>
  <div class="page-container">
    <Suspense>
      <template #default>
        <Queue />
      </template>
      <template #fallback>
        <div class="loading-state">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p>Loading queue...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';

const Queue = defineAsyncComponent(() => import('@/components/Queue.vue'));

export default {
  components: {
    Queue,
  },
};
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  position: relative;
  isolation: isolate;
}

.page-container::-webkit-scrollbar {
  display: none;
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
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.v-theme--dark .loading-state p {
  color: #9ca3af;
}
</style>
