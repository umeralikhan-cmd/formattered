<template>
  <div class="results-container">
    <div class="content-wrapper">
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <div class="filters-title-group">
            <v-icon size="20" class="filters-icon"> mdi-filter-outline </v-icon>
            <h2 class="filters-title">Filters</h2>
          </div>
          <v-btn
            color="primary"
            size="large"
            class="export-btn"
            :disabled="selectedIDS.length === 0"
            @click="openExportResultsDialog"
          >
            <v-icon start> mdi-download </v-icon>
            Export ({{ selectedIDS.length }})
          </v-btn>
        </div>

        <div class="filters-content">
          <v-row dense>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-select
                v-model="selectedQuestionType"
                :items="questionTypes"
                label="Document Type"
                variant="outlined"
                density="comfortable"
                :disabled="loader"
                hide-details
                :menu-props="{ maxHeight: 400, closeOnContentClick: true }"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-autocomplete
                v-model="selectedFacility"
                label="Facility"
                :items="facilityOptions"
                item-value="facility_id"
                item-title="facility_name"
                variant="outlined"
                density="comfortable"
                clearable
                :loading="facilitiesLoading"
                :disabled="facilitiesLoading"
                hide-details
                :menu-props="{ maxHeight: 400, closeOnContentClick: true }"
                no-filter
                auto-select-first
              >
                <template #selection="{ item }">
                  <span v-if="item && item.raw" class="text-truncate">
                    {{ item.raw.facility_name || 'Unknown' }}
                  </span>
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :key="item.raw.facility_id" class="facility-list-item">
                    <v-list-item-title class="facility-name">
                      {{ item.raw.facility_name || 'Unknown Facility' }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      v-for="(address, idx) in item.raw.mailing_addresses || []"
                      :key="`${item.raw.facility_id}-${idx}`"
                      class="facility-address"
                    >
                      {{ address }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-select
                v-model="matchStatus"
                :items="['All', 'Matched', 'Unmatched']"
                label="Match Status"
                variant="outlined"
                density="comfortable"
                hide-details
                :menu-props="{ maxHeight: 400 }"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model="search"
                label="Search Name"
                variant="outlined"
                density="comfortable"
                clearable
                prepend-inner-icon="mdi-magnify"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-menu
                v-model="dateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template #activator="{ props }">
                  <v-text-field
                    v-model="dateRangeText"
                    label="Date Range"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    placeholder="Select date range"
                    prepend-inner-icon="mdi-calendar-range"
                    hide-details
                    @click:clear="clearDateRange"
                  />
                </template>
                <v-date-picker :model-value="dateRangeArr" range @update:model-value="onDateRangeChange">
                  <template #actions>
                    <v-btn color="primary" variant="text" @click="dateMenu = false"> Close </v-btn>
                    <v-btn color="primary" variant="text" @click="clearDateRange"> Clear </v-btn>
                  </template>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Data Table Section -->
      <div class="table-section">
        <div class="table-header">
          <div class="table-stats">
            <v-icon size="20" class="stats-icon"> mdi-table </v-icon>
            <span class="stats-text">
              {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'Result' : 'Results' }}
            </span>
            <v-progress-circular v-if="isFetching" indeterminate color="primary" size="20" width="2" class="ml-2" />
            <v-chip v-if="selectedIDS.length > 0" size="small" color="primary" variant="flat" class="ml-3">
              {{ selectedIDS.length }} Selected
            </v-chip>
          </div>
        </div>

        <div class="table-content">
          <div v-if="loader" class="loader-container">
            <v-progress-circular :size="60" :width="6" color="primary" indeterminate />
            <p class="loader-text">Loading results...</p>
          </div>

          <div v-else class="table-wrapper">
            <v-data-table
              v-model="selectedIDS"
              v-model:expanded="expanded"
              :headers="headers"
              :items="paginatedItems"
              :loading="loader || isFetching"
              :items-per-page="-1"
              show-expand
              item-value="result_uid"
              :search="search"
              show-select
              :custom-filter="firstAndLastNameFilter"
              :row-props="rowProps"
              hide-default-footer
              fixed-header
              height="500"
            >
              <!-- Display First Name -->
              <template #item.first_name="{ item }">
                {{ item.first_name }}
              </template>

              <!-- Display Last Name -->
              <template #item.last_name="{ item }">
                {{ item.last_name }}
              </template>

              <!-- Display Middle Name -->
              <template #item.middle_name="{ item }">
                {{ item.middle_name }}
              </template>

              <!-- Display Document Type -->
              <template #item.document_type="{ item }">
                {{ item.document_type }}
              </template>

              <!-- Display DOC Number -->
              <template #item.doc_number="{ item }">
                {{ item.doc_number }}
              </template>

              <!-- Display Facility Name -->
              <template #item.facility_name="{ item }">
                {{ item.facility_name }}
              </template>

              <!-- Display Inmate Number -->
              <template #item.inmate_number="{ item }">
                {{ item.inmate_number }}
              </template>

              <template #item.mark="{ item }">
                {{ item.score }}
              </template>

              <template #item.date_created="{ item }">
                {{ formatToLocal(item.date_created) }}
              </template>

              <template #item.mailing_address="{ item }">
                {{ item.mailing_address }}
              </template>

              <template #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                <v-btn
                  :append-icon="isExpanded(internalItem) ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"
                  :text="isExpanded(internalItem) ? 'Hide' : 'Show'"
                  variant="text"
                  size="small"
                  class="expand-btn"
                  @click="toggleExpand(internalItem)"
                />
              </template>

              <template #expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length">
                    <v-sheet rounded="lg" border>
                      <!-- Check if it's an Edovo table -->
                      <div v-if="isEdovoDocument(item)">
                        <v-card flat>
                          <v-card-title>Edovo Questions & Answers</v-card-title>
                          <v-card-text>
                            <v-table density="compact">
                              <thead>
                                <tr>
                                  <th style="width: 5%">Q#</th>
                                  <th style="width: 15%">Lesson</th>
                                  <th style="width: 40%">Question</th>
                                  <th style="width: 30%">Answer</th>
                                  <th style="width: 10%">Required</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="q in getEdovoQuestionsWithAnswerKey(item)" :key="q.questionNumber">
                                  <td class="font-weight-bold">
                                    {{ q.questionNumber }}
                                  </td>
                                  <td>{{ q.lesson || '-' }}</td>
                                  <td>{{ q.question || '-' }}</td>
                                  <td>{{ q.answer || '(empty)' }}</td>
                                  <td>
                                    <v-chip v-if="q.required" color="error" size="x-small" variant="flat">
                                      Required
                                    </v-chip>
                                    <v-chip v-else color="grey" size="x-small" variant="outlined"> Optional </v-chip>
                                  </td>
                                </tr>
                              </tbody>
                            </v-table>
                          </v-card-text>
                        </v-card>
                      </div>
                      <!-- Regular result details for non-Edovo documents -->
                      <resultsDetails
                        v-else
                        :user="item"
                        :facilities="facilityOptions"
                        @document-deleted="documentDeleted"
                        @document-regraded="documentRegraded"
                        @score-updated="scoreUpdated"
                      />
                    </v-sheet>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>

          <!-- Pagination Footer - Outside scrollable area -->
          <div class="pagination-footer">
            <div class="d-flex justify-space-between align-center">
              <!-- Left side: Items per page selector -->
              <div class="d-flex align-center">
                <span class="mr-3 text-body-2 items-per-page-label">Items per page:</span>
                <v-select
                  v-model="itemsPerPage"
                  :items="[10, 20, 30, 50, 100]"
                  density="compact"
                  variant="outlined"
                  class="items-per-page-select"
                  hide-details
                />
              </div>

              <!-- Center: Pagination -->
              <div>
                <v-pagination v-model="page" :length="pageCount" :total-visible="5" size="small" />
              </div>

              <!-- Right side: Items info -->
              <div class="text-body-2">{{ currentRangeText }} of {{ filteredItems.length }} items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <v-dialog v-model="ExportResultsDialog">
    <Exports
      :applicants="selectedItems"
      :question-type="selectedQuestionType"
      @close="ExportResultsDialog = false"
      @document-deleted="documentDeletedBulk"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import api from '@/plugins/axios';
import resultsDetails from './resultsDetails.vue';
import Exports from './Exports.vue';

const props = defineProps({
  refresh: {
    type: Boolean,
    default: false,
  },
});

// Reactive state
const selectedFacility = ref(null);
const selectedQuestionType = ref('All');
const dateMenu = ref(false);
const dateRangeArr = ref([]);
const matchStatus = ref('All');
const selectedDocumentId = ref(null);
const dialog = ref(false);
const loading = ref([]);
const expandedDocumentId = ref(null);
const expanded = ref([]);
const search = ref('');
const ExportResultsDialog = ref(false);
const selectedIDS = ref([]);
const page = ref(1);
const itemsPerPage = ref(20);

const headers = [
  { title: 'First Name', key: 'first_name' },
  { title: 'Middle Name', key: 'middle_name' },
  { title: 'Last Name', key: 'last_name' },
  { title: 'Document Type', key: 'document_type' },
  { title: 'Score', key: 'score' },
  { title: 'Created', key: 'created_at' },
  { title: 'DOC Number', key: 'doc_number' },
  { title: 'Facility Name', key: 'facility_name' },
];

// TanStack Query for question types (cached, fetches once)
const { data: questionTypesData } = useQuery({
  queryKey: ['questionTypes'],
  queryFn: async () => {
    const res = await api.post('/get-question-types');
    return ['All', ...res.data];
  },
  staleTime: Infinity, // Never goes stale - this data rarely changes
  gcTime: 1000 * 60 * 60, // 60 minutes - data stays in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Only fetch once, never refetch
  refetchOnReconnect: false,
});

const questionTypes = computed(() => questionTypesData.value || ['All']);

// TanStack Query for facilities (cached, rarely changes)
const { data: facilitiesData, isLoading: facilitiesLoading } = useQuery({
  queryKey: ['facilityProfiles'], // UNIQUE KEY - different from Facilities page
  queryFn: async () => {
    const res = await api.get('/get-facility-profile');
    // Ensure consistent data structure
    const normalized = res.data.map((facility) => ({
      facility_id: facility['Facility ID'] || facility.facility_id,
      facility_name: facility['Facility Name'] || facility.facility_name,
      id: facility.id,
      mailing_addresses: Array.isArray(facility.mailing_addresses)
        ? facility.mailing_addresses
        : facility.mailing_addresses
          ? [facility.mailing_addresses]
          : [],
    }));
    console.log('Facility profiles loaded:', normalized.length);
    return normalized;
  },
  staleTime: 1000 * 60 * 30, // 30 minutes - facilities don't change often
  gcTime: 1000 * 60 * 60, // 60 minutes in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // ✅ Don't refetch on mount - use cached data
  refetchOnReconnect: false,
  select: (data) => data || [], // Ensure always returns array
  placeholderData: [], // Show empty array while loading to prevent undefined errors
});

const facilityOptions = computed(() => {
  const options = facilitiesData.value || [];
  console.log('Facility options updated:', options.length);
  return options;
});

// TanStack Query for Edovo answer keys (cached, rarely changes)
const { data: edovoAnswerKeysData } = useQuery({
  queryKey: ['edovoAnswerKeys'],
  queryFn: async () => {
    const res = await api.post('/get-edovo-answer-key');
    return res.data;
  },
  staleTime: Infinity, // Never goes stale - this data rarely changes
  gcTime: 1000 * 60 * 60, // 60 minutes in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Only fetch once
  refetchOnReconnect: false,
});

const edovoAnswerKeys = computed(() => edovoAnswerKeysData.value || {});

// TanStack Query for results (refetches when filters change)
const {
  data: resultsData,
  isLoading: loader,
  isFetching,
  refetch: refetchResults,
} = useQuery({
  queryKey: ['markedResults', selectedQuestionType, selectedFacility], // Reactive query key
  queryFn: async () => {
    console.log('Fetching results:', {
      question_type: selectedQuestionType.value,
      facility_id: selectedFacility.value,
    });
    const res = await api.post('/get-marked-results', {
      question_type: selectedQuestionType.value,
      facility_id: selectedFacility.value,
    });
    console.log('Results fetched:', res.data?.length || 0, 'items');
    return res.data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh, no unnecessary refetches
  gcTime: 1000 * 60 * 30, // 30 minutes in cache for back/forward navigation
  refetchOnWindowFocus: false,
  refetchOnMount: false, // ✅ Don't refetch on mount - only when queryKey changes
  refetchOnReconnect: false,
  select: (data) => data || [], // Ensure always returns array
  keepPreviousData: true, // Keep showing old data while fetching new
});

const items = computed(() => {
  const data = resultsData.value || [];
  console.log('Items computed:', data.length);
  return data;
});

// Watch for refresh prop
watch(
  () => props.refresh,
  (newValue) => {
    if (newValue) {
      refetchResults();
    }
  }
);

// Watch for pagination changes - reset to page 1
watch(itemsPerPage, () => {
  page.value = 1;
});

watch(search, () => {
  page.value = 1;
});

watch(dateRangeArr, () => {
  page.value = 1;
});

watch(matchStatus, () => {
  page.value = 1;
});

// Computed properties
const dateRangeText = computed(() => {
  if (!dateRangeArr.value || !Array.isArray(dateRangeArr.value) || dateRangeArr.value.length === 0) return '';
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  };
  if (dateRangeArr.value.length === 1 && dateRangeArr.value[0]) {
    return formatDate(dateRangeArr.value[0]);
  }
  if (dateRangeArr.value.length >= 2 && dateRangeArr.value[0] && dateRangeArr.value[1]) {
    const sortedDates = [...dateRangeArr.value].sort();
    return `${formatDate(sortedDates[0])} - ${formatDate(sortedDates[1])}`;
  }
  return '';
});

const filteredItems = computed(() => {
  let filtered = items.value;

  // Filter by match status based on parent_id
  if (matchStatus.value === 'Matched') {
    filtered = filtered.filter((item) => item.parent_id);
  } else if (matchStatus.value === 'Unmatched') {
    filtered = filtered.filter((item) => !item.parent_id);
  }

  // Filter by search text
  if (search.value) {
    filtered = filtered.filter((item) => firstAndLastNameFilter(null, search.value, { columns: item }));
  }

  // Filter by date range
  if (
    dateRangeArr.value &&
    Array.isArray(dateRangeArr.value) &&
    dateRangeArr.value.length === 2 &&
    dateRangeArr.value[0] &&
    dateRangeArr.value[1]
  ) {
    const [startDateStr, endDateStr] = [...dateRangeArr.value].sort();

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    filtered = filtered.filter((item) => {
      const dateValue = item.date_created || item.created_at;
      if (!dateValue) return false;

      try {
        const created = new Date(dateValue);

        if (isNaN(created.getTime())) {
          return false;
        }

        const isInRange = created >= start && created <= end;
        return isInRange;
      } catch (error) {
        return false;
      }
    });
  }

  return filtered;
});

const selectedItems = computed(() => {
  return items.value.filter((item) => selectedIDS.value.includes(item.document_id));
});

const pageCount = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});

const currentRangeText = computed(() => {
  if (filteredItems.value.length === 0) return '0-0';
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(page.value * itemsPerPage.value, filteredItems.value.length);
  return `${start}-${end}`;
});

// Methods
const rowProps = (row) => {
  const data = row && row.item ? row.item : null;
  const noParent = data == null || data.parent_id === null || data.parent_id === undefined;
  return noParent ? { class: 'row-orange' } : {};
};

const documentDeletedBulk = (item) => {
  refetchResults();
  ExportResultsDialog.value = false;
};

const onDateRangeChange = (val) => {
  const formatDateToString = (date) => {
    if (!date) return null;

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.warn('Could not parse date:', date);
    }

    return null;
  };

  if (!val || (Array.isArray(val) && val.length === 0)) {
    dateRangeArr.value = [];
  } else if (Array.isArray(val)) {
    const validDates = val.map(formatDateToString).filter((d) => d !== null);

    if (validDates.length === 0) {
      dateRangeArr.value = [];
    } else if (validDates.length === 1) {
      dateRangeArr.value = validDates;
    } else if (validDates.length === 2) {
      const sortedDates = [...validDates].sort();
      dateRangeArr.value = sortedDates;

      setTimeout(() => {
        dateMenu.value = false;
      }, 300);
    } else {
      const sortedDates = [...validDates].sort();
      dateRangeArr.value = [sortedDates[0], sortedDates[sortedDates.length - 1]];
    }
  } else {
    const formattedDate = formatDateToString(val);

    if (!formattedDate) {
      dateRangeArr.value = [];
    } else {
      if (dateRangeArr.value && dateRangeArr.value.length === 1) {
        const firstDate = dateRangeArr.value[0];

        if (firstDate === formattedDate) {
          dateRangeArr.value = [formattedDate];
        } else {
          const sortedDates = [firstDate, formattedDate].sort();
          dateRangeArr.value = sortedDates;
          setTimeout(() => {
            dateMenu.value = false;
          }, 300);
        }
      } else {
        dateRangeArr.value = [formattedDate];
      }
    }
  }

  page.value = 1;
};

const clearDateRange = () => {
  dateRangeArr.value = [];
  dateMenu.value = false;
  page.value = 1;
};

const documentDeleted = (item) => {
  console.log('Document deleted:', item);
  refetchResults();
  selectedDocumentId.value = null;
};

const documentRegraded = (item) => {
  refetchResults();
};

const scoreUpdated = (scoreData) => {
  refetchResults();
};

const formatToLocal = (dateString) => {
  if (!dateString) return '';

  const options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

const firstAndLastNameFilter = (value, query, item) => {
  if (!query) return true;

  const fullName = `${item.columns.first_name} ${item.columns.last_name}`.toLowerCase();
  const reversedFullName = `${item.columns.last_name} ${item.columns.first_name}`.toLowerCase();
  const lowerQuery = query.toLowerCase();

  return fullName.includes(lowerQuery) || reversedFullName.includes(lowerQuery);
};

const openExportResultsDialog = () => {
  ExportResultsDialog.value = true;
};

// This method is no longer needed - TanStack Query handles fetching automatically
// when selectedQuestionType or selectedFacility changes
const getResults = () => {
  // Just trigger a refetch
  refetchResults();
};

const isEdovoDocument = (item) => {
  return item.document_type?.startsWith('Edovo') || item.extracted_table?.startsWith('Edovo');
};

const getEdovoQuestionsWithAnswerKey = (item) => {
  let documentType = item.document_type || item.extracted_table || '';
  documentType = documentType.replace('Edovo ', '').trim();

  const answerKeys = edovoAnswerKeys.value[documentType] || [];

  const questions = [];
  for (const answerKey of answerKeys) {
    const questionNumber = answerKey.question_number;
    const qColumn = `Q${questionNumber}`;
    const answer = item[qColumn];

    questions.push({
      questionNumber: questionNumber,
      lesson: answerKey.lesson,
      question: answerKey.question,
      answer: answer,
      required: answerKey.required,
    });
  }

  questions.sort((a, b) => a.questionNumber - b.questionNumber);

  return questions;
};
</script>

<style scoped>
.results-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch;
  position: relative;
  isolation: isolate;
}

.v-theme--dark .results-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Hide all scrollbars for Chrome, Safari and Opera */
.results-container::-webkit-scrollbar {
  display: none !important;
}

/* Hide scrollbars everywhere in results container */
.results-container *::-webkit-scrollbar {
  display: none !important;
}

.results-container * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

/* Prevent any unwanted overlays in results container */
.results-container :deep(.v-overlay:not(.v-menu__content-container)) {
  display: none !important;
  pointer-events: none !important;
}

.results-container :deep(.v-overlay__scrim) {
  display: none !important;
}

/* Content wrapper - same pattern as upload page */
.content-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  overflow: hidden; /* Prevent children from overflowing */
}

/* Filters Section */
.filters-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: 12px !important;
}

.filters-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
}

.v-theme--dark .filters-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .filters-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.filters-header {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
}

.v-theme--dark .filters-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1a2332, #151e2e);
}

.filters-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters-icon {
  color: #6366f1;
  opacity: 0.7;
}

.v-theme--dark .filters-icon {
  color: #818cf8;
  opacity: 0.8;
}

.filters-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .filters-title {
  color: #f8fafc;
}

.export-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2) !important;
  border: 1px solid #6366f1 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  cursor: pointer !important;
}

.export-btn:hover {
  border-color: #4f46e5 !important;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3) !important;
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.filters-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.v-theme--dark .filters-content {
  background: #151e2e;
  border-top-color: #334155;
}

.filters-content :deep(.v-row) {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.filters-content :deep(.v-col) {
  flex-shrink: 1;
  min-width: 0;
}

/* Filter Inputs Styling */
:deep(.v-autocomplete .v-field__input),
:deep(.v-select .v-field__input),
:deep(.v-text-field .v-field__input) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer !important;
}

/* Filter field styling */
:deep(.v-field) {
  cursor: pointer !important;
  transition: all 0.2s ease;
  border-radius: 8px !important;
}

:deep(.v-field:hover) {
  border-color: #a5b4fc !important;
}

:deep(.v-field--focused) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
}

/* Selected text in filters - clean without background */
:deep(.v-select__selection),
:deep(.v-autocomplete__selection) {
  color: #1f2937 !important;
  font-weight: 500 !important;
}

:deep(.v-theme--dark .v-select__selection),
:deep(.v-theme--dark .v-autocomplete__selection) {
  color: #f9fafb !important;
}

/* Dropdown Menu Styling - All Filters */
:deep(.v-overlay__content) {
  max-width: 600px !important;
}

:deep(.v-overlay__content .v-list) {
  max-width: 600px !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

:deep(.v-overlay__content .v-list)::-webkit-scrollbar {
  display: none !important;
}

/* General List Items */
:deep(.v-list-item) {
  white-space: normal !important;
  word-wrap: break-word !important;
  min-height: 48px !important;
  height: auto !important;
  padding: 10px 16px !important;
  cursor: pointer !important;
  transition: all 0.2s ease;
}

:deep(.v-list-item:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

:deep(.v-list-item--active) {
  background: rgba(99, 102, 241, 0.08) !important;
}

:deep(.v-theme--dark .v-list-item--active) {
  background: rgba(99, 102, 241, 0.15) !important;
}

:deep(.v-list-item__content) {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  line-height: 1.4 !important;
}

:deep(.v-list-item-title) {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  line-height: 1.4 !important;
  font-weight: 500 !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 600 !important;
  color: #1f2937 !important;
}

:deep(.v-theme--dark .v-list-item--active .v-list-item-title) {
  color: #f9fafb !important;
}

/* Facility Dropdown Styling */
.facility-list-item {
  min-height: 60px !important;
  padding: 12px 16px !important;
  white-space: normal !important;
}

.facility-list-item .facility-name {
  font-weight: 600 !important;
  color: #1e293b !important;
  font-size: 0.9375rem !important;
  margin-bottom: 4px !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  line-height: 1.4 !important;
}

.v-theme--dark .facility-list-item .facility-name {
  color: #f9fafb !important;
}

.facility-list-item .facility-address {
  font-size: 0.8125rem !important;
  color: #64748b !important;
  margin-top: 2px !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  line-height: 1.3 !important;
  opacity: 0.9 !important;
}

.v-theme--dark .facility-list-item .facility-address {
  color: #94a3b8 !important;
}

.facility-list-item {
  cursor: pointer !important;
}

.facility-list-item:hover {
  background: rgba(99, 102, 241, 0.08) !important;
}

.v-theme--dark .facility-list-item:hover {
  background: rgba(99, 102, 241, 0.12) !important;
}

.facility-list-item.v-list-item--active {
  background: rgba(99, 102, 241, 0.08) !important;
}

.v-theme--dark .facility-list-item.v-list-item--active {
  background: rgba(99, 102, 241, 0.15) !important;
}

/* Table Section */
.table-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
}

.v-theme--dark .table-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .table-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: #475569;
  transform: translateY(-2px);
}

.table-header {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(to bottom, #fafbfc, #f8fafc);
}

.v-theme--dark .table-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1a2332, #151e2e);
}

.table-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  color: #6366f1;
  opacity: 0.7;
}

.v-theme--dark .stats-icon {
  color: #818cf8;
  opacity: 0.8;
}

.stats-text {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .stats-text {
  color: #f9fafb;
}

/* Selected items chip - match upload page badge style */
.table-stats :deep(.v-chip) {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff) !important;
  color: #4f46e5 !important;
  border: 1px solid #c7d2fe !important;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.1) !important;
  font-weight: 600 !important;
}

.v-theme--dark .table-stats :deep(.v-chip) {
  background: linear-gradient(135deg, #312e81, #3730a3) !important;
  color: #a5b4fc !important;
  border: 1px solid #4c1d95 !important;
}

.table-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* Prevent content from overflowing */
  box-sizing: border-box;
}

.v-theme--dark .table-content {
  background: #151e2e;
  border-top-color: #334155;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.v-theme--dark .loader-container {
  background: #1e293b;
  border-color: #334155;
}

.loader-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.v-theme--dark .loader-text {
  color: #9ca3af;
}

.table-wrapper {
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  z-index: 1;
  contain: layout style;
}

.v-theme--dark .table-wrapper {
  background: #1e293b;
  border-color: #334155;
}

/* The data-table wrapper - handles scrolling */
.table-wrapper :deep(.v-data-table__wrapper) {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  touch-action: pan-y pan-x;
  will-change: scroll-position;
  position: relative;
  z-index: 1;
}

/* Hide all scrollbars */
.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar {
  display: none !important;
}

/* Fixed header - Vuetify handles this with fixed-header prop */
.table-wrapper :deep(thead th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

.table-wrapper :deep(.v-table) {
  width: auto; /* Table sizes to content */
  min-width: 100%; /* At least fill container */
  table-layout: auto; /* Auto layout - columns size to content */
}

/* Allow table to grow wider if needed, but wrap text first */
.table-wrapper :deep(.v-table tbody) {
  width: 100%;
}

/* Better row spacing for wrapped content */
.table-wrapper :deep(.v-data-table__tr) {
  height: auto !important;
  min-height: 52px !important;
}

/* Short content columns - prefer no wrap */
:deep(.v-data-table__td:nth-child(2)),  /* First name */
:deep(.v-data-table__td:nth-child(3)),  /* Middle name */
:deep(.v-data-table__td:nth-child(4)),  /* Last name */
:deep(.v-data-table__td:nth-child(6)),  /* Score */
:deep(.v-data-table__td:nth-child(8)) {
  /* Doc number */
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* Long content columns - allow wrap */
:deep(.v-data-table__td:nth-child(5)),  /* Document type */
:deep(.v-data-table__td:nth-child(7)),  /* Date created */
:deep(.v-data-table__td:nth-child(9)) {
  /* Facility name */
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

/* Data Table Styling */
:deep(.v-data-table) {
  background: transparent !important;
  isolation: isolate;
}

/* Ensure rows don't create stacking context issues */
:deep(.v-data-table tbody tr) {
  position: relative;
  isolation: isolate;
  cursor: default;
}

/* Prevent any backdrop or overlay from showing */
:deep(.v-data-table .v-overlay) {
  display: none !important;
}

:deep(.v-data-table__tr--clickable) {
  cursor: default !important;
}

/* Checkboxes */
:deep(.v-checkbox) {
  cursor: pointer !important;
}

:deep(.v-checkbox .v-selection-control__input) {
  cursor: pointer !important;
}

:deep(.v-data-table__th) {
  font-weight: 600 !important;
  font-size: 0.8125rem !important;
  color: #64748b !important;
  background: #f9fafb !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  white-space: nowrap !important;
  padding: 14px 16px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.2 !important;
}

/* Force header content to stay on one line */
:deep(.v-data-table__th span),
:deep(.v-data-table__th .v-data-table-header__content),
:deep(.v-data-table-header__content) {
  white-space: nowrap !important;
  display: inline-block !important;
  line-height: 1.2 !important;
}

:deep(.v-theme--dark .v-data-table__th) {
  color: #94a3b8 !important;
  background: #0f172a !important;
}

:deep(.v-data-table__td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-size: 0.875rem !important;
  white-space: normal !important; /* Allow text wrapping */
  padding: 12px 16px !important;
  vertical-align: top !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  line-height: 1.5 !important;
}

:deep(.v-theme--dark .v-data-table__td) {
  color: #f9fafb !important;
  border-bottom-color: #334155 !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}

:deep(.v-theme--dark .v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

:deep(.row-orange) {
  background-color: rgba(255, 165, 0, 0.15) !important;
}

:deep(.v-theme--dark .row-orange) {
  background-color: rgba(255, 165, 0, 0.25) !important;
}

/* Expanded Row Styling */
:deep(.v-data-table__expanded__content) {
  background: #f9fafb !important;
  border-top: 2px solid #e5e7eb !important;
  padding: 20px !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  position: relative !important;
  z-index: 1 !important;
}

:deep(.v-data-table__expanded__content) tr {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.v-data-table__expanded__content) tr td {
  position: relative !important;
}

:deep(.v-theme--dark .v-data-table__expanded__content) {
  background: #0f172a !important;
  border-top-color: #334155 !important;
}

/* Expanded row content - allow text wrapping */
:deep(.v-data-table__expanded__content td) {
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  overflow: hidden !important;
  vertical-align: top !important;
}

/* Style the sheet inside expanded row */
:deep(.v-data-table__expanded__content .v-sheet) {
  background: #ffffff !important;
  padding: 16px !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  position: relative !important;
  z-index: 1 !important;
}

:deep(.v-theme--dark .v-data-table__expanded__content .v-sheet) {
  background: #1e293b !important;
}

/* Edovo table inside expanded row - allow text wrapping */
:deep(.v-data-table__expanded__content .v-table td) {
  white-space: normal !important;
  word-wrap: break-word !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  max-width: none !important;
  line-height: 1.5 !important;
  padding: 10px !important;
}

:deep(.v-data-table__expanded__content .v-table th) {
  white-space: normal !important;
  word-wrap: break-word !important;
  line-height: 1.4 !important;
  padding: 10px !important;
}

/* Remove specific column width constraints - let columns auto-size to content */

/* Show/Hide Expand Button - Simple styling */
:deep(.expand-btn) {
  box-shadow: none !important;
  pointer-events: auto !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  position: relative !important;
  z-index: 2 !important;
  cursor: pointer !important;
}

:deep(.expand-btn:hover) {
  background: transparent !important;
  cursor: pointer !important;
}

:deep(.expand-btn::before) {
  opacity: 0 !important;
}

:deep(.expand-btn::after) {
  display: none !important;
}

:deep(.expand-btn:active) {
  transform: scale(0.98) !important;
}

:deep(.expand-btn .v-btn__overlay) {
  display: none !important;
}

:deep(.expand-btn .v-ripple__container) {
  display: none !important;
}

/* Pagination Footer - Outside scroll area */
.pagination-footer {
  padding: 16px 20px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.v-theme--dark .pagination-footer {
  background: #1e293b;
  border-top-color: #334155;
}

.items-per-page-label {
  color: #4b5563 !important;
  font-weight: 500 !important;
}

.v-theme--dark .items-per-page-label {
  color: #9ca3af !important;
}

.items-per-page-select {
  width: 90px !important;
}

.items-per-page-select :deep(.v-field__input) {
  color: #1f2937 !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
}

.v-theme--dark .items-per-page-select :deep(.v-field__input) {
  color: #f9fafb !important;
}

.items-per-page-select :deep(.v-field) {
  min-height: 36px !important;
}

.pagination-footer .text-body-2 {
  color: #4b5563 !important;
  font-weight: 500 !important;
}

.v-theme--dark .pagination-footer .text-body-2 {
  color: #9ca3af !important;
}

/* Pagination Styling */
:deep(.v-data-table__footer) {
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px 16px;
}

:deep(.v-theme--dark .v-data-table__footer) {
  border-top-color: #334155;
  background: #0f172a;
}

:deep(.v-pagination__item) {
  border-radius: 6px !important;
  transition: all 0.2s ease;
  cursor: pointer !important;
}

:deep(.v-pagination__item:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
  cursor: pointer !important;
}

:deep(.v-pagination__item--is-active) {
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3) !important;
  color: white !important;
}

:deep(.v-pagination__prev),
:deep(.v-pagination__next),
:deep(.v-pagination__first),
:deep(.v-pagination__last) {
  cursor: pointer !important;
}

:deep(.v-pagination__prev:hover),
:deep(.v-pagination__next:hover),
:deep(.v-pagination__first:hover),
:deep(.v-pagination__last:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
    gap: 16px;
  }

  .filters-header,
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .export-btn {
    width: 100%;
  }

  .filters-title {
    font-size: 1rem;
  }

  .table-wrapper {
    max-height: 400px;
  }

  .table-wrapper :deep(.v-data-table__wrapper) {
    max-height: 400px;
  }

  .filters-content,
  .table-content {
    padding: 16px;
  }

  .pagination-footer {
    padding: 12px 16px;
  }

  .pagination-footer .d-flex {
    flex-direction: column;
    gap: 12px;
    align-items: stretch !important;
  }

  .pagination-footer .text-body-2 {
    text-align: center;
  }
}
</style>
