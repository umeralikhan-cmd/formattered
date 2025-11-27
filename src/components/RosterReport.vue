<template>
  <v-dialog :model-value="modelValue" max-width="1200" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="modern-dialog">
      <v-card-title class="modern-dialog-header">
        <div class="dialog-header-content">
          <v-icon class="dialog-header-icon">mdi-file-chart</v-icon>
          <span class="dialog-header-title">Roster Report</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" class="dialog-close-btn" />
      </v-card-title>
      <v-divider />
      <v-card-text class="dialog-content">
        <div v-if="loading" class="loading-state">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="mt-4 loading-text">Loading roster report...</div>
        </div>

        <div v-else-if="error" class="error-state">
          <v-alert type="error" variant="tonal" class="modern-alert">
            {{ error }}
          </v-alert>
        </div>

        <div v-else-if="rosterData" class="roster-content">
          <div class="info-section">
            <div class="facility-info">
              <v-icon class="info-icon">mdi-office-building</v-icon>
              <div class="info-text">
                <div class="info-label">Facility</div>
                <div class="info-value">{{ facilityFacilityId }}</div>
              </div>
            </div>
            <div class="total-info">
              <v-icon class="info-icon">mdi-account-group</v-icon>
              <div class="info-text">
                <div class="info-label">Total Mavericks</div>
                <div class="info-value">{{ rosterData.total_mavericks || 0 }}</div>
              </div>
            </div>
          </div>

          <div v-if="rosterData.mavericks && rosterData.mavericks.length > 0" class="table-section">
            <div class="table-wrapper">
              <v-data-table
                :headers="headers"
                :items="rosterData.mavericks"
                :items-per-page="20"
                density="comfortable"
                class="modern-table"
              >
                <template v-slot:item.application="{ item }">
                  <v-chip
                    v-if="item.application && item.application.status"
                    size="small"
                    :color="getStatusChipColor(item.application.status)"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ item.application.status }}
                  </v-chip>
                  <span v-else class="empty-value">—</span>
                </template>
                <template v-slot:item.tyh="{ item }">
                  <v-chip
                    v-if="item.tyh && item.tyh.status"
                    size="small"
                    :color="getStatusChipColor(item.tyh.status)"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ item.tyh.status }}
                  </v-chip>
                  <span v-else class="empty-value">—</span>
                </template>
                <template v-slot:item.preseason="{ item }">
                  <v-chip
                    v-if="item.preseason && item.preseason.status"
                    size="small"
                    :color="getStatusChipColor(item.preseason.status)"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ item.preseason.status }}
                  </v-chip>
                  <span v-else class="empty-value">—</span>
                </template>
                <template v-slot:item.book_one="{ item }">
                  <v-chip
                    v-if="item.book_one && item.book_one.status"
                    size="small"
                    :color="getStatusChipColor(item.book_one.status)"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ item.book_one.status }}
                  </v-chip>
                  <span v-else class="empty-value">—</span>
                </template>
                <template v-slot:item.book_two="{ item }">
                  <v-chip
                    v-if="item.book_two && item.book_two.status"
                    size="small"
                    :color="getStatusChipColor(item.book_two.status)"
                    variant="flat"
                    class="status-chip"
                  >
                    {{ item.book_two.status }}
                  </v-chip>
                  <span v-else class="empty-value">—</span>
                </template>
                <template v-slot:item.notes="{ item }">
                  <span class="notes-text">{{ item.notes || '—' }}</span>
                </template>
              </v-data-table>
            </div>
          </div>

          <div v-else class="empty-state">
            <v-alert type="info" variant="tonal" class="modern-alert">
              <div class="d-flex align-center gap-2">
                <v-icon>mdi-information</v-icon>
                <span>No mavericks found for this facility.</span>
              </div>
            </v-alert>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-btn variant="text" @click="close" class="close-btn">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "RosterReport",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    facilityId: {
      type: [Number, String],
      default: null,
    },
    facilityFacilityId: {
      type: String,
      default: "",
    },
  },
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      loading: false,
      error: null,
      rosterData: null,
      headers: [
        { title: "First Name", key: "first_name", width: "10%" },
        { title: "Last Name", key: "last_name", width: "10%" },
        { title: "Doc Number", key: "doc_number", width: "10%" },
        { title: "Application", key: "application", width: "10%" },
        { title: "TYH", key: "tyh", width: "12%" },
        { title: "Preseason", key: "preseason", width: "12%" },
        { title: "Book One", key: "book_one", width: "12%" },
        { title: "Book Two", key: "book_two", width: "12%" },
        { title: "Notes", key: "notes", width: "12%" },
      ],
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.facilityId) {
        this.fetchRosterReport();
      }
    },
  },
  methods: {
    async fetchRosterReport() {
      if (!this.facilityId) {
        this.error = "Facility ID is required";
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        this.rosterData = null;

        const payload = {
          instructions: {
            action: "get_roster_report"
          },
          facility_id: this.facilityId
        };

        const response = await api.post('/local-dash', payload);
        this.rosterData = response.data;
      } catch (err) {
        console.error('Error fetching roster report:', err);
        this.error = err.response?.data?.detail || 'Error fetching roster report';
      } finally {
        this.loading = false;
      }
    },
    getLogColor(status) {
      if (!status) return 'grey';
      const statusLower = status.toLowerCase();
      if (statusLower === 'complete') return 'success';
      if (statusLower === 'pending') return 'warning';
      if (statusLower === 'failed' || statusLower === 'error') return 'error';
      return 'info';
    },
    getChipColor(displayText) {
      if (!displayText) return 'grey';
      if (displayText === 'Completed') return 'success';
      if (displayText.includes('2nd chance')) return 'warning';
      return 'info';
    },
    getStatusChipColor(status) {
      if (!status) return 'grey';
      const statusLower = status.toLowerCase();
      if (statusLower === 'complete') return 'success';
      if (statusLower === 'approved') return 'success';
      if (statusLower === 'fail') return 'error';
      if (statusLower === 'pending') return 'warning';
      if (statusLower === 'n/a') return 'grey';
      return 'info';
    },
    close() {
      this.$emit('close');
      this.$emit('update:modelValue', false);
      this.error = null;
      this.rosterData = null;
    },
  },
};
</script>

<style scoped>
/* Modern Dialog Styling */
.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.modern-dialog-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 24px !important;
  background: linear-gradient(to right, #3B82F6 0%, #6366F1 100%) !important;
  color: white !important;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header-icon {
  font-size: 1.75rem !important;
  color: white !important;
}

.dialog-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.dialog-close-btn {
  color: white !important;
}

.dialog-content {
  padding: 24px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-actions {
  padding: 16px 24px !important;
  border-top: 1px solid #E2E8F0;
  justify-content: flex-end;
}

.v-theme--dark .dialog-actions {
  border-top-color: #334155;
}

.close-btn {
  text-transform: none !important;
  font-weight: 600 !important;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6B7280;
}

.v-theme--dark .loading-text {
  color: #9CA3AF;
}

/* Error State */
.error-state {
  padding: 20px 0;
}

.modern-alert {
  border-radius: 12px !important;
  font-weight: 500;
}

/* Roster Content */
.roster-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Section */
.info-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.facility-info,
.total-info {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
  border: 1px solid #C7D2FE;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.v-theme--dark .facility-info,
.v-theme--dark .total-info {
  background: linear-gradient(135deg, #312E81, #3730A3);
  border-color: #4C1D95;
}

.info-icon {
  font-size: 2rem !important;
  color: #6366F1 !important;
}

.v-theme--dark .info-icon {
  color: #A5B4FC !important;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.v-theme--dark .info-label {
  color: #9CA3AF;
}

.info-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.v-theme--dark .info-value {
  color: #F9FAFB;
}

/* Table Section */
.table-section {
  margin-top: 8px;
}

.table-wrapper {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.v-theme--dark .table-wrapper {
  background: #1E293B;
  border-color: #334155;
}

.modern-table {
  background: transparent !important;
}

:deep(.modern-table .v-data-table__th) {
  background: #F9FAFB !important;
  color: #64748B !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid #E2E8F0 !important;
}

:deep(.v-theme--dark .modern-table .v-data-table__th) {
  background: #0F172A !important;
  color: #94A3B8 !important;
  border-bottom-color: #334155 !important;
}

:deep(.modern-table .v-data-table__td) {
  border-bottom: 1px solid #F3F4F6 !important;
}

:deep(.v-theme--dark .modern-table .v-data-table__td) {
  border-bottom-color: #1E293B !important;
}

:deep(.modern-table tbody tr:hover) {
  background: #F9FAFB !important;
}

:deep(.v-theme--dark .modern-table tbody tr:hover) {
  background: #0F172A !important;
}

/* Status Chips */
.status-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.02em !important;
}

.empty-value {
  color: #9CA3AF;
  font-size: 0.875rem;
}

.notes-text {
  font-size: 0.875rem;
  color: #6B7280;
  line-height: 1.5;
}

.v-theme--dark .notes-text {
  color: #9CA3AF;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* Scrollbar */
.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.v-theme--dark .dialog-content::-webkit-scrollbar-track {
  background: #1E293B;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.v-theme--dark .dialog-content::-webkit-scrollbar-thumb {
  background: #475569;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

.v-theme--dark .dialog-content::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}

/* Responsive */
@media (max-width: 768px) {
  .info-section {
    flex-direction: column;
  }

  .facility-info,
  .total-info {
    min-width: 100%;
  }

  .dialog-header-title {
    font-size: 1.125rem;
  }

  .dialog-content {
    padding: 16px !important;
  }
}
</style>
