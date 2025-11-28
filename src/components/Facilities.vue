<template>
  <div class="facilities-container">
    <div class="content-wrapper">
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <div class="filters-title-group">
            <v-icon size="20" class="filters-icon"> mdi-filter-outline </v-icon>
            <h2 class="filters-title">Filters & Actions</h2>
          </div>
          <v-btn color="primary" size="large" class="add-btn" @click="addNewFacility">
            <v-icon start> mdi-plus-circle </v-icon>
            Add New Facility
          </v-btn>
        </div>

        <div class="filters-content">
          <v-row dense>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="search"
                label="Search Facilities"
                variant="outlined"
                density="comfortable"
                clearable
                prepend-inner-icon="mdi-magnify"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="activeCustomerFilter"
                :items="['All', 'Yes', 'No', 'N/A']"
                label="Active Customer"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                :menu-props="{ maxHeight: 400 }"
              />
            </v-col>
          </v-row>

          <!-- Action Buttons Row -->
          <v-row dense class="mt-3">
            <v-col cols="12" sm="6" md="4">
              <v-btn
                color="primary"
                class="action-btn"
                :disabled="reportButtonDisabled"
                prepend-icon="mdi-file-chart"
                block
                @click="openReportDialog"
              >
                <template v-if="selectedFacilities.length === 1"> Report </template>
                <template v-else> Select Single Facility </template>
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-btn
                color="primary"
                class="action-btn"
                :disabled="selectedFacilities.length === 0"
                prepend-icon="mdi-email-multiple"
                block
                @click="openBulkEmailDraftDialog"
              >
                Make Draft ({{ selectedFacilities.length }})
              </v-btn>
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
              {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'Facility' : 'Facilities' }}
            </span>
            <v-progress-circular v-if="isFetching" indeterminate color="primary" size="20" width="2" class="ml-2" />
            <v-chip v-if="selectedFacilities.length > 0" size="small" color="primary" variant="flat" class="ml-3">
              {{ selectedFacilities.length }} Selected
            </v-chip>
          </div>
        </div>

        <div class="table-content">
          <div v-if="loader" class="loader-container">
            <v-progress-circular :size="60" :width="6" color="primary" indeterminate />
            <p class="loader-text">Loading facilities...</p>
          </div>

          <div v-else class="table-wrapper">
            <v-data-table
              v-model:expanded="expanded"
              v-model="selectedFacilities"
              :headers="headers"
              :items="filteredItems"
              :loading="loader || isFetching"
              :items-per-page="20"
              show-expand
              show-select
              :search="search"
              item-value="id"
              fixed-header
              height="500"
            >
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

              <template #item.report_link="{ item }">
                <v-icon
                  v-if="item['Roster Report Google Sheet Link'] && item['Roster Report Google Sheet Link'].trim()"
                  color="primary"
                  class="report-link-icon"
                  @click="openReportLink(item['Roster Report Google Sheet Link'])"
                >
                  mdi-link
                </v-icon>
                <v-icon v-else color="grey"> mdi-link-off </v-icon>
              </template>

              <template #expanded-row="{ columns, item }">
                <tr class="expanded-row">
                  <td :colspan="columns.length" class="expanded-cell">
                    <div class="expanded-content">
                      <!-- Action Buttons -->
                      <div class="expanded-actions">
                        <v-btn
                          color="primary"
                          class="expanded-action-btn"
                          prepend-icon="mdi-table-account"
                          @click="openRosterReportDialogForItem(item)"
                        >
                          Roster Report
                        </v-btn>
                        <v-btn
                          color="primary"
                          class="expanded-action-btn"
                          prepend-icon="mdi-email-edit"
                          @click="openEmailDraftDialog(item)"
                        >
                          Make Draft
                        </v-btn>
                        <v-btn
                          color="primary"
                          class="expanded-action-btn"
                          prepend-icon="mdi-pencil"
                          @click="editFacility(item)"
                        >
                          Edit
                        </v-btn>
                      </div>

                      <!-- Mailing Addresses Table -->
                      <div
                        v-if="Array.isArray(item.mailing_addresses) && item.mailing_addresses.length"
                        class="addresses-section"
                      >
                        <h3 class="addresses-title">Mailing Addresses</h3>
                        <v-table density="compact" class="addresses-table">
                          <thead>
                            <tr>
                              <th class="text-left">Account Name</th>
                              <th class="text-left">Mailing Address</th>
                              <th class="text-left">City</th>
                              <th class="text-left">State</th>
                              <th class="text-left">Zip</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(addr, idx) in item.mailing_addresses" :key="idx">
                              <td>{{ addr['Mailing Account Name'] || '' }}</td>
                              <td class="address-cell">
                                {{ addr['Mailing Account Address_line1'] || '' }}
                                <template v-if="addr['Mailing Account Address_line2']">
                                  <br />{{ addr['Mailing Account Address_line2'] }}
                                </template>
                              </td>
                              <td>{{ addr['Mailing Account Address_city'] || '' }}</td>
                              <td>{{ addr['Mailing Account Address_state'] || '' }}</td>
                              <td>{{ addr['Mailing Account Address_zip'] || '' }}</td>
                            </tr>
                          </tbody>
                        </v-table>
                      </div>
                      <div v-else class="no-addresses">
                        <v-icon>mdi-information-outline</v-icon>
                        <span>No mailing addresses</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Facility Dialog -->
  <v-dialog v-model="editFacilityDialog" max-width="1000">
    <v-card class="modern-dialog">
      <v-card-title class="modern-dialog-header">
        <div class="dialog-header-content">
          <v-icon class="dialog-header-icon"> mdi-office-building-edit </v-icon>
          <span class="dialog-header-title">{{
            editFacilityData && editFacilityData.id ? 'Edit Facility' : 'Add New Facility'
          }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" class="dialog-close-btn" @click="closeEditFacilityDialog" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-if="editFacilityData">
          <div class="text-subtitle-1 mb-2">Facility Info</div>
          <v-row dense>
            <v-col v-for="key in facilityFieldKeys" :key="key" cols="12" sm="6">
              <template v-if="key === 'Active Customer?'">
                <v-select
                  v-model="editFacilityData[key]"
                  :label="key"
                  :items="['Yes', 'No', 'N/A']"
                  variant="outlined"
                  density="comfortable"
                />
              </template>
              <template v-else>
                <v-text-field
                  v-model="editFacilityData[key]"
                  :label="key"
                  :readonly="key === 'id' || (key === 'Facility ID' && !!editFacilityData.id)"
                  :disabled="key === 'id' || (key === 'Facility ID' && !!editFacilityData.id)"
                  :required="isRequiredFacilityField(key)"
                  :rules="facilityRules(key)"
                  variant="outlined"
                  density="comfortable"
                />
              </template>
            </v-col>
          </v-row>

          <div class="text-subtitle-1 mt-6 mb-2">Mailing Addresses</div>
          <div v-if="Array.isArray(editFacilityData.mailing_addresses) && editFacilityData.mailing_addresses.length">
            <v-expansion-panels>
              <v-expansion-panel v-for="(addr, aidx) in editFacilityData.mailing_addresses" :key="aidx">
                <v-expansion-panel-title>
                  {{ addr['Mailing Account Name'] || `Address #${aidx + 1}` }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col v-for="akey in addressFieldKeys(addr)" :key="akey" cols="12" sm="6">
                      <v-text-field
                        :label="akey"
                        :model-value="addr[akey]"
                        :readonly="akey === 'id' || akey === 'parent_id' || akey === 'Facility Mailing Account ID'"
                        :disabled="akey === 'id' || akey === 'parent_id' || akey === 'Facility Mailing Account ID'"
                        :required="isRequiredAddressField(akey)"
                        :rules="addressRules(akey)"
                        variant="outlined"
                        density="comfortable"
                        @update:model-value="(val) => handleAddressFieldChange(addr, akey, val)"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-2" justify="end" align="center">
                    <v-btn v-if="addr.id" class="mr-2" color="error" variant="tonal" @click="deleteAddress(aidx)">
                      Delete
                    </v-btn>
                    <v-btn class="mr-2" color="secondary" variant="tonal" @click="duplicateAddress(addr)">
                      Duplicate
                    </v-btn>
                    <v-btn
                      class="mr-2"
                      color="primary"
                      variant="tonal"
                      :disabled="!isAddressChanged(addr) || !isAddressValid(addr)"
                      @click="saveAddress(aidx)"
                    >
                      Save
                    </v-btn>
                    <v-btn variant="text" @click="cancelAddress(aidx, addr)"> Cancel </v-btn>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <div v-else class="text-medium-emphasis">No mailing addresses</div>
          <div class="mt-4 text-right">
            <template v-if="editFacilityData && editFacilityData.id">
              <v-btn color="primary" variant="outlined" @click="addNewAddress"> Add Mailing Address </v-btn>
            </template>
            <template v-else>
              <span class="text-medium-emphasis">Save new Facility before adding address</span>
            </template>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeEditFacilityDialog"> Cancel </v-btn>
        <v-btn color="primary" :disabled="!isFacilityValid" @click="saveFacilityEdits"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Bulk Email Draft Dialog -->
  <v-dialog v-model="bulkEmailDraftDialog" max-width="1000" :persistent="bulkMakeDraftLoading">
    <v-card class="modern-dialog">
      <v-card-title class="modern-dialog-header">
        <div class="dialog-header-content">
          <v-icon class="dialog-header-icon"> mdi-email-multiple </v-icon>
          <span class="dialog-header-title">Create Email Drafts for Multiple Facilities</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="bulkMakeDraftLoading"
          class="dialog-close-btn"
          @click="closeBulkEmailDraftDialog"
        />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="10">
            <v-select
              v-model="bulkEmailType"
              :items="emailTypes"
              item-title="document_type"
              item-value="document_id"
              label="Select Email Type"
              variant="outlined"
              :loading="bulkEmailTypesLoading"
              :disabled="bulkMakeDraftLoading"
              clearable
              return-object
              @update:model-value="onBulkEmailTypeChange"
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn
              color="primary"
              size="large"
              block
              :disabled="!bulkEmailType || validSelectedFacilities.length === 0 || !isSignedIn"
              :loading="bulkMakeDraftLoading"
              @click="makeBulkDraft"
            >
              Make Drafts
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="bulkMakeDraftLoading">
          <v-col cols="12" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="mt-4 text-h6">Creating email drafts... Please wait.</div>
          </v-col>
        </v-row>

        <template v-if="!bulkMakeDraftLoading">
          <v-row v-if="!isSignedIn">
            <v-col cols="12" class="text-center">
              <v-btn color="secondary" size="large" @click="signInWithGoogle">
                <v-icon left> mdi-google </v-icon>
                Sign in with Google
              </v-btn>
              <div class="text-caption mt-2 text-medium-emphasis">Sign in to create email drafts</div>
            </v-col>
          </v-row>

          <v-row v-if="validSelectedFacilities.length > 0">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Selected Facilities ({{ validSelectedFacilities.length }}):</div>
              <v-chip-group column>
                <v-chip
                  v-for="facility in validSelectedFacilities"
                  :key="facility.id"
                  color="primary"
                  variant="outlined"
                  closable
                  @click:close="removeFacilityFromSelection(facility.id)"
                >
                  {{ facility['Facility Name'] }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>

          <v-row v-if="selectedFacilities.length > 0 && validSelectedFacilities.length === 0">
            <v-col cols="12">
              <p class="text-body-2 text-warning py-2">
                <v-icon size="small" class="mr-1"> mdi-alert </v-icon>
                Selected facilities must have both a Report Link and Email address. Please select facilities with
                complete information.
              </p>
            </v-col>
          </v-row>

          <v-row v-if="bulkEmailType && bulkEmailType.document_id">
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Email Template Preview:</div>
              <iframe
                :src="`https://docs.google.com/document/d/${bulkEmailType.document_id}/preview`"
                width="100%"
                height="400"
                frameborder="0"
                allowfullscreen
              />
            </v-col>
          </v-row>
        </template>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" :disabled="bulkMakeDraftLoading" @click="closeBulkEmailDraftDialog"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Email Draft Dialog -->
  <v-dialog v-model="emailDraftDialog" max-width="1200" :persistent="makeDraftLoading">
    <v-card class="modern-dialog">
      <v-card-title class="modern-dialog-header">
        <div class="dialog-header-content">
          <v-icon class="dialog-header-icon"> mdi-email-edit </v-icon>
          <span class="dialog-header-title">Create Email Draft</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="makeDraftLoading"
          class="dialog-close-btn"
          @click="closeEmailDraftDialog"
        />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="10">
            <v-select
              v-model="selectedEmailType"
              :items="emailTypes"
              item-title="document_type"
              item-value="document_id"
              label="Select Email Type"
              variant="outlined"
              :loading="emailTypesLoading"
              :disabled="makeDraftLoading"
              clearable
              return-object
              @update:model-value="onEmailTypeChange"
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn
              color="primary"
              size="large"
              block
              :disabled="!selectedEmailType || makeDraftLoading"
              :loading="makeDraftLoading"
              @click="makeDraft"
            >
              Make Draft
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="makeDraftLoading">
          <v-col cols="12" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="mt-4 text-h6">Creating email draft... Please wait.</div>
          </v-col>
        </v-row>

        <template v-if="!makeDraftLoading">
          <v-row v-if="selectedEmailType && !isSignedIn">
            <v-col cols="12" class="text-center">
              <v-btn color="secondary" size="large" @click="signInWithGoogle">
                <v-icon left> mdi-google </v-icon>
                Sign in with Google
              </v-btn>
              <div class="text-caption mt-2 text-medium-emphasis">Sign in to view document and create email drafts</div>
            </v-col>
          </v-row>
          <v-row v-if="selectedEmailType && isSignedIn">
            <v-col cols="12">
              <p class="text-body-2 text-success py-2">
                <v-icon size="small" class="mr-1"> mdi-check-circle </v-icon>
                Signed in as Google user - Ready to create drafts
              </p>
            </v-col>
          </v-row>
          <v-row v-if="selectedEmailType && selectedEmailType.document_id">
            <v-col cols="12">
              <iframe
                :src="`https://docs.google.com/document/d/${selectedEmailType.document_id}/preview`"
                width="100%"
                height="600"
                frameborder="0"
                allowfullscreen
              />
            </v-col>
          </v-row>
        </template>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" :disabled="makeDraftLoading" @click="closeEmailDraftDialog"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Roster Report Dialog -->
  <RosterReport
    v-model="rosterReportDialog"
    :facility-id="selectedFacilityId"
    :facility-facility-id="selectedFacilityFacilityId"
    @close="closeRosterReportDialog"
  />

  <!-- Report Exports Dialog -->
  <ReportExports
    v-model="reportExportsDialog"
    :facility="selectedReportFacility"
    @close="closeReportDialog"
    @export-success="onExportSuccess"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import api from '@/plugins/axios';
import RosterReport from './RosterReport.vue';
import ReportExports from './ReportExports.vue';

// Table headers - auto-size columns to content
const headers = [
  { title: 'Name', key: 'Facility Name' },
  { title: 'Facility ID', key: 'Facility ID' },
  { title: 'Report Link', key: 'report_link', align: 'center' },
  { title: 'Active Customer', key: 'Active Customer?', align: 'center' },
  { title: 'Staff Emails', key: 'Staff Emails For Reporting' },
];

// Reactive state
const expanded = ref([]);
const search = ref('');
const activeCustomerFilter = ref('All');
const editFacilityDialog = ref(false);
const editFacilityData = ref(null);
const editFacilityOriginalData = ref(null);
const editFacilityAddressOriginalMap = ref({});
const editFacilityAddressOriginalByRef = ref(null);
const emailDraftDialog = ref(false);
const emailTypes = ref([]);
const selectedEmailType = ref(null);
const selectedEmailTypeData = ref(null);
const selectedFacility = ref(null);
const emailTypesLoading = ref(false);
const googleAccessToken = ref(null);
const isSignedIn = ref(false);
const makeDraftLoading = ref(false);
const selectedFacilities = ref([]);
const bulkEmailDraftDialog = ref(false);
const bulkEmailType = ref(null);
const bulkEmailTypeData = ref(null);
const bulkEmailTypesLoading = ref(false);
const bulkMakeDraftLoading = ref(false);
const rosterReportDialog = ref(false);
const selectedFacilityId = ref(null);
const selectedFacilityFacilityId = ref(null);
const reportExportsDialog = ref(false);
const selectedReportFacility = ref(null);

// TanStack Query - Fetch facilities (smart caching)
const {
  data: facilitiesData,
  isLoading: loader,
  isFetching,
  refetch: refetchFacilities,
  error: facilitiesError,
} = useQuery({
  queryKey: ['facilitiesSupabase'], // UNIQUE KEY - different from DisplayResults
  queryFn: async () => {
    const res = await api.get('/get-facilities-supabase');
    const facilities = Array.isArray(res.data)
      ? res.data.map((f) => ({
          ...f,
          facility_id: f.facility_id || f['Facility ID'],
          facility_name: f.facility_name || f['Facility Name'],
          mailing_addresses: Array.isArray(f.mailing_addresses)
            ? f.mailing_addresses
            : f.mailing_addresses
              ? [f.mailing_addresses]
              : [],
        }))
      : [];
    console.log('Facilities (Supabase) loaded:', facilities.length);
    return facilities;
  },
  staleTime: 1000 * 60 * 15, // 15 minutes - facilities don't change often
  gcTime: 1000 * 60 * 60, // 60 minutes in cache
  refetchOnMount: false, // ✅ Don't refetch on mount - use cached data
  refetchOnWindowFocus: false, // Don't refetch on tab focus
  refetchOnReconnect: false, // Don't refetch on network reconnect
  select: (data) => data || [], // Ensure always returns array
  placeholderData: [], // Show empty array while loading to prevent undefined errors
  keepPreviousData: true, // Keep showing old data while refetching
});

// Watch for errors
watch(facilitiesError, (error) => {
  if (error) {
    console.error('Error fetching facilities');
  }
});

// Computed properties
const items = computed(() => {
  const data = facilitiesData.value || [];
  console.log('Facilities items computed:', data.length);
  return data;
});

const isFacilityValid = computed(() => {
  const d = editFacilityData.value || {};
  return isNonEmpty(d['Facility ID']) && isNonEmpty(d['Facility Name']) && isNonEmpty(d['Facility Abbreviation']);
});

const reportButtonDisabled = computed(() => {
  return selectedFacilities.value.length !== 1;
});

const validSelectedFacilities = computed(() => {
  return items.value.filter(
    (facility) =>
      selectedFacilities.value.includes(facility.id) &&
      facility['Roster Report Google Sheet Link'] &&
      facility['Roster Report Google Sheet Link'].trim() &&
      facility['Staff Emails For Reporting'] &&
      facility['Staff Emails For Reporting'].trim()
  );
});

const filteredItems = computed(() => {
  if (activeCustomerFilter.value === 'All' || !activeCustomerFilter.value) {
    return items.value;
  }
  const filter = activeCustomerFilter.value;
  return items.value.filter((it) => {
    const val = it['Active Customer?'];
    const isNA = (v) =>
      v === null ||
      v === undefined ||
      String(v).trim() === '' ||
      String(v).trim().toLowerCase() === 'n/a' ||
      String(v).trim().toLowerCase() === 'na';
    if (filter === 'N/A') {
      return isNA(val);
    }
    const wantYes = filter === 'Yes';
    if (typeof val === 'boolean') return wantYes ? val === true : val === false;
    if (isNA(val)) return false;
    const s = String(val).trim().toLowerCase();
    if (wantYes) return s === 'yes' || s === 'true' || s === '1' || s === 'y';
    return s === 'no' || s === 'false' || s === '0' || s === 'n';
  });
});

const facilityFieldKeys = computed(() => {
  if (!editFacilityData.value) return [];
  return Object.keys(editFacilityData.value).filter((k) => k !== 'mailing_addresses');
});

// Helper functions
const isNonEmpty = (val) => {
  return val !== null && val !== undefined && String(val).trim() !== '';
};

const isRequiredFacilityField = (key) => {
  return key === 'Facility ID' || key === 'Facility Name' || key === 'Facility Abbreviation';
};

const facilityRules = (key) => {
  if (isRequiredFacilityField(key)) {
    return [(v) => isNonEmpty(v) || 'Required'];
  }
  return [];
};

const isRequiredAddressField = (akey) => {
  return akey === 'Mailing Account Name' || akey === 'Mailing Account Address_line1';
};

const addressRules = (akey) => {
  if (isRequiredAddressField(akey)) {
    return [(v) => isNonEmpty(v) || 'Required'];
  }
  return [];
};

const isAddressValid = (addr) => {
  if (!addr) return false;
  return isNonEmpty(addr['Mailing Account Name']) && isNonEmpty(addr['Mailing Account Address_line1']);
};

const _shallowEqualAddresses = (a, b) => {
  const keys = new Set([...(a ? Object.keys(a) : []), ...(b ? Object.keys(b) : [])]);
  for (const k of keys) {
    if ((a ? a[k] : undefined) !== (b ? b[k] : undefined)) return false;
  }
  return true;
};

const _hasMeaningfulValue = (obj) => {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k === 'id' || k === 'parent_id') continue;
    if (v !== null && v !== undefined && String(v).trim() !== '') return true;
  }
  return false;
};

// Methods
const editFacility = (item) => {
  console.log('Editing facility:', item);
  editFacilityData.value = JSON.parse(JSON.stringify(item));
  editFacilityOriginalData.value = JSON.parse(JSON.stringify(item));
  editFacilityAddressOriginalMap.value = {};
  (item.mailing_addresses || []).forEach((a) => {
    if (a && a.id != null) {
      editFacilityAddressOriginalMap.value[a.id] = JSON.parse(JSON.stringify(a));
    }
  });
  editFacilityAddressOriginalByRef.value = new WeakMap();
  (editFacilityData.value.mailing_addresses || []).forEach((a) => {
    editFacilityAddressOriginalByRef.value.set(a, JSON.parse(JSON.stringify(a)));
  });
  editFacilityDialog.value = true;
};

const closeEditFacilityDialog = () => {
  editFacilityDialog.value = false;
  editFacilityData.value = null;
  editFacilityOriginalData.value = null;
  editFacilityAddressOriginalMap.value = {};
  editFacilityAddressOriginalByRef.value = null;
};

const addressFieldKeys = (addr) => {
  return Object.keys(addr || {});
};
const duplicateAddress = (addr) => {
  if (!editFacilityData.value) return;
  const copy = JSON.parse(JSON.stringify(addr || {}));
  copy.id = '';
  copy.parent_id = editFacilityData.value.id;
  if (copy['Mailing Account Name']) {
    copy['Mailing Account Name'] = `${copy['Mailing Account Name']} (Copy)`;
  }
  const facId = editFacilityData.value && editFacilityData.value['Facility ID'];
  const name = copy['Mailing Account Name'] || '';
  copy['Facility Mailing Account ID'] = facId ? `${facId}_${name}` : name;
  (editFacilityData.value.mailing_addresses ||= []).push(copy);
  if (!editFacilityAddressOriginalByRef.value) editFacilityAddressOriginalByRef.value = new WeakMap();
  const lastRef = editFacilityData.value.mailing_addresses[editFacilityData.value.mailing_addresses.length - 1];
  editFacilityAddressOriginalByRef.value.set(lastRef, JSON.parse(JSON.stringify(lastRef)));
};
const saveAddress = async (aidx) => {
  try {
    if (!editFacilityData.value || !Array.isArray(editFacilityData.value.mailing_addresses)) return;
    const addr = editFacilityData.value.mailing_addresses[aidx];
    if (!addr) return;
    if (!addr.parent_id) addr.parent_id = editFacilityData.value.id;
    const res = await api.post('/save-new-address', addr);
    const saved = res && res.data ? res.data : null;
    if (!saved) throw new Error('Empty response');
    editFacilityData.value.mailing_addresses.splice(aidx, 1, saved);
    if (!editFacilityAddressOriginalByRef.value) editFacilityAddressOriginalByRef.value = new WeakMap();
    editFacilityAddressOriginalByRef.value.set(
      editFacilityData.value.mailing_addresses[aidx],
      JSON.parse(JSON.stringify(saved))
    );
    if (saved.id != null) {
      editFacilityAddressOriginalMap.value[saved.id] = JSON.parse(JSON.stringify(saved));
    }
  } catch (err) {
    console.error('Error saving address');
  }
};
const deleteAddress = async (aidx) => {
  try {
    if (!editFacilityData.value || !Array.isArray(editFacilityData.value.mailing_addresses)) return;
    const addr = editFacilityData.value.mailing_addresses[aidx];
    if (!addr || !addr.id) {
      editFacilityData.value.mailing_addresses.splice(aidx, 1);
      return;
    }
    await api.post('/delete-address', { id: addr.id });
    editFacilityData.value.mailing_addresses.splice(aidx, 1);
    if (addr.id && editFacilityAddressOriginalMap.value[addr.id]) {
      delete editFacilityAddressOriginalMap.value[addr.id];
    }
  } catch (err) {
    console.error('Error deleting address');
  }
};
const cancelAddress = (aidx, addr) => {
  if (!editFacilityData.value || !Array.isArray(editFacilityData.value.mailing_addresses)) return;
  const id = addr && addr.id;
  if (id != null && editFacilityAddressOriginalMap.value[id]) {
    const original = JSON.parse(JSON.stringify(editFacilityAddressOriginalMap.value[id]));
    editFacilityData.value.mailing_addresses.splice(aidx, 1, original);
    if (!editFacilityAddressOriginalByRef.value) editFacilityAddressOriginalByRef.value = new WeakMap();
    editFacilityAddressOriginalByRef.value.set(
      editFacilityData.value.mailing_addresses[aidx],
      JSON.parse(JSON.stringify(editFacilityData.value.mailing_addresses[aidx]))
    );
  } else {
    editFacilityData.value.mailing_addresses.splice(aidx, 1);
  }
};

const handleAddressFieldChange = (addr, key, value) => {
  addr[key] = value;
  if (key === 'Mailing Account Name') {
    const facId = editFacilityData.value && editFacilityData.value['Facility ID'];
    const name = value || '';
    addr['Facility Mailing Account ID'] = facId ? `${facId}_${name}` : name;
  }
};
const addNewAddress = () => {
  if (!editFacilityData.value) return;
  const facId = editFacilityData.value && editFacilityData.value['Facility ID'];

  const baseVals = {
    id: '',
    parent_id: editFacilityData.value.id,
    'Mailing Account Address Type': '',
    'Mailing Account Name': '',
    'Facility Mailing Account ID': '',
    'Facility/Company Name': editFacilityData.value['Facility Name'] || '',
    'Facility Contact Emails (ALL)': '',
    'Primary H2.0 Sales Email': '',
    'Mailing Account Notes': '',
    'Ship To Name_first': '',
    'Ship To Name_middle': '',
    'Ship To Name_last': '',
    'Mailing Account Address_line1': '',
    'Mailing Account Address_line2': '',
    'Mailing Account Address_city': '',
    'Mailing Account Address_state': '',
    'Mailing Account Address_zip': '',
    'Mailing Account Address_country': '',
    'Mailing Account Address_county': '',
    'Mailing Account Address_neighborhood': '',
    'Mailing Account Address_geolocation': '',
  };

  const existing = (editFacilityData.value.mailing_addresses || []).find((a) => a && typeof a === 'object');

  const fallbackOrder = [
    'id',
    'parent_id',
    'Mailing Account Address Type',
    'Mailing Account Name',
    'Facility Mailing Account ID',
    'Facility/Company Name',
    'Facility Contact Emails (ALL)',
    'Primary H2.0 Sales Email',
    'Mailing Account Notes',
    'Ship To Name_first',
    'Ship To Name_middle',
    'Ship To Name_last',
    'Mailing Account Address_line1',
    'Mailing Account Address_line2',
    'Mailing Account Address_city',
    'Mailing Account Address_state',
    'Mailing Account Address_zip',
    'Mailing Account Address_country',
    'Mailing Account Address_county',
    'Mailing Account Address_neighborhood',
    'Mailing Account Address_geolocation',
  ];

  const orderedKeys = existing ? Object.keys(existing) : fallbackOrder;

  const newAddr = {};
  orderedKeys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(baseVals, k)) {
      newAddr[k] = baseVals[k];
    } else {
      newAddr[k] = '';
    }
  });
  fallbackOrder.forEach((k) => {
    if (!(k in newAddr)) newAddr[k] = baseVals[k];
  });

  (editFacilityData.value.mailing_addresses ||= []).push(newAddr);
  if (!editFacilityAddressOriginalByRef.value) editFacilityAddressOriginalByRef.value = new WeakMap();
  const inserted = editFacilityData.value.mailing_addresses[editFacilityData.value.mailing_addresses.length - 1];
  editFacilityAddressOriginalByRef.value.set(inserted, JSON.parse(JSON.stringify(inserted)));
};

const saveFacilityEdits = async () => {
  try {
    if (!editFacilityData.value) return;
    const prevId = editFacilityData.value.id;
    const res = await api.post('/save-new-facility', editFacilityData.value);
    const saved = res && res.data ? res.data : null;
    if (!saved) throw new Error('Empty response');

    if (!prevId || String(prevId).trim() === '' || prevId !== saved.id) {
      if (Array.isArray(editFacilityData.value.mailing_addresses)) {
        editFacilityData.value.mailing_addresses.forEach((a) => {
          if (a) a.parent_id = saved.id;
        });
      }
    }

    const merged = {
      ...saved,
      mailing_addresses: Array.isArray(editFacilityData.value.mailing_addresses)
        ? editFacilityData.value.mailing_addresses
        : [],
    };

    // Refetch to update the table
    await refetchFacilities();

    editFacilityData.value = JSON.parse(JSON.stringify(merged));
  } catch (err) {
    console.error('Error saving facility');
  }
};

const isAddressChanged = (addr) => {
  const byRef = editFacilityAddressOriginalByRef.value && editFacilityAddressOriginalByRef.value.get(addr);
  if (byRef) return !_shallowEqualAddresses(addr, byRef);

  const id = addr && addr.id;
  if (id != null && editFacilityAddressOriginalMap.value[id]) {
    return !_shallowEqualAddresses(addr, editFacilityAddressOriginalMap.value[id]);
  }

  return _hasMeaningfulValue(addr);
};

const loadGoogleToken = () => {
  const token = localStorage.getItem('google_access_token');
  const expiresAt = localStorage.getItem('google_token_expires_at');

  if (token && expiresAt) {
    const now = Date.now();
    if (now < parseInt(expiresAt)) {
      googleAccessToken.value = token;
      isSignedIn.value = true;
    } else {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expires_at');
    }
  }
};

const loadGoogleApi = () => {
  if (!window.gapi) {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        console.log('Google API loaded');
      });
    };
    document.head.appendChild(script);
  }
};

const signInWithGoogle = () => {
  const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    return;
  }

  const scope = 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/documents.readonly';
  const currentUrl = window.location.href.split('#')[0].split('?')[0];
  const redirectUri = currentUrl;

  console.log('OAuth Config:', {
    clientId,
    redirectUri,
    currentUrl: window.location.href,
  });

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    'response_type=token&' +
    `scope=${encodeURIComponent(scope)}&` +
    'prompt=select_account';

  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const popup = window.open(authUrl, 'Google Sign In', `width=${width},height=${height},left=${left},top=${top}`);

  if (!popup) {
    console.error('Popup blocked. Please allow popups for this site.');
    return;
  }

  const handleMessage = (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'google_auth_success') {
      googleAccessToken.value = event.data.access_token;
      isSignedIn.value = true;

      const expiresIn = event.data.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem('google_access_token', event.data.access_token);
      localStorage.setItem('google_token_expires_at', expiresAt.toString());

      window.removeEventListener('message', handleMessage);
      if (popup) popup.close();
    }
  };

  window.addEventListener('message', handleMessage);

  const checkPopupClosed = setInterval(() => {
    if (popup && popup.closed) {
      clearInterval(checkPopupClosed);
      window.removeEventListener('message', handleMessage);
    }
  }, 500);
};
const openEmailDraftDialog = async (facility) => {
  selectedFacility.value = facility;
  emailDraftDialog.value = true;
  selectedEmailType.value = null;
  selectedEmailTypeData.value = null;

  try {
    emailTypesLoading.value = true;
    const res = await api.get('/get-email-types');
    emailTypes.value = res.data.email_types || [];
  } catch (err) {
    console.error('Error fetching email types:', err);
  } finally {
    emailTypesLoading.value = false;
  }
};
const closeEmailDraftDialog = () => {
  if (makeDraftLoading.value) return;
  emailDraftDialog.value = false;
  selectedEmailType.value = null;
  selectedEmailTypeData.value = null;
  selectedFacility.value = null;
  emailTypes.value = [];
};

const onEmailTypeChange = (emailType) => {
  selectedEmailTypeData.value = emailType;
};

const makeDraft = async () => {
  if (!isSignedIn.value || !googleAccessToken.value) {
    return;
  }

  if (!selectedEmailTypeData.value) {
    return;
  }

  try {
    makeDraftLoading.value = true;

    const payload = {
      access_token: googleAccessToken.value,
      email_type: selectedEmailTypeData.value,
      facility: selectedFacility.value,
    };

    const res = await api.post('/make-email-draft', payload);
  } catch (err) {
    console.error('Error creating draft:', err);
  } finally {
    makeDraftLoading.value = false;
    setTimeout(() => {
      closeEmailDraftDialog();
    }, 100);
  }
};

const openReportLink = (link) => {
  if (link && link.trim()) {
    window.open(link, '_blank');
  }
};

const openBulkEmailDraftDialog = async () => {
  bulkEmailDraftDialog.value = true;
  bulkEmailType.value = null;
  bulkEmailTypeData.value = null;

  try {
    bulkEmailType.value.valuesLoading = true;
    const res = await api.get('/get-email-types');
    emailTypes.value = res.data.email_types || [];
  } catch (err) {
    console.error('Error fetching email types:', err);
  } finally {
    bulkEmailTypesLoading.value = false;
  }
};

const closeBulkEmailDraftDialog = () => {
  if (bulkMakeDraftLoading.value) return;
  bulkEmailDraftDialog.value = false;
  bulkEmailType.value = null;
  bulkEmailTypeData.value = null;
};

const onBulkEmailTypeChange = (emailType) => {
  bulkEmailTypeData.value = emailType;
};

const removeFacilityFromSelection = (facilityId) => {
  const index = selectedFacilities.value.indexOf(facilityId);
  if (index > -1) {
    selectedFacilities.value.splice(index, 1);
  }
};

const makeBulkDraft = async () => {
  if (!isSignedIn.value || !googleAccessToken.value) {
    return;
  }

  if (!bulkEmailTypeData.value) {
    return;
  }

  if (validSelectedFacilities.value.length === 0) {
    return;
  }

  try {
    bulkMakeDraftLoading.value = true;

    const payload = {
      access_token: googleAccessToken.value,
      email_type: bulkEmailTypeData.value,
      facilities: validSelectedFacilities.value,
    };

    const res = await api.post('/make-email-draft-bulk', payload);

    if (res.data && res.data.success) {
      selectedFacilities.value = [];
    }
  } catch (err) {
    console.error('Error creating bulk drafts:', err);
  } finally {
    bulkMakeDraftLoading.value = false;
    setTimeout(() => {
      closeBulkEmailDraftDialog();
    }, 100);
  }
};

const addNewFacility = () => {
  const blank = {
    id: '',
    'Facility ID': '',
    'Facility Implementation Method': '',
    'Facility Name': '',
    'Facility Abbreviation': '',
    'Facility Status': '',
    'Facility Status Notes': '',
    'Facility Book One Payer': '',
    'Facility Book Two Payer': '',
    'Facility Preseason Payer': '',
    'Facility Standalone Course Payer': '',
    'Facility Data Entry Notes': '',
    'Facility Mail Policy Notes': '',
    'Facility Sponsor Notes': '',
    '"Other" explained:': '',
    'Google Drive Folder Link': '',
    'Roster Report Google Sheet Link': '',
    'Payer Type (all guides)': '',
    'Sales Email(s)': '',
    'Staff Emails For Reporting': '',
    'Supervisor Email(s)': '',
    'Supervisor Phone #': '',
    'Facility Contact Supervisor Name_first': '',
    'Facility Contact Supervisor Name_middle': '',
    'Facility Contact Supervisor Name_last': '',
    'Facility Contact Supervisor Title': '',
    'Facility Digital Messaging Platform': '',
    'Active Customer?': 'N/A',
    mailing_addresses: [],
  };
  editFacilityData.value = JSON.parse(JSON.stringify(blank));
  editFacilityOriginalData.value = JSON.parse(JSON.stringify(blank));
  editFacilityAddressOriginalMap.value = {};
  editFacilityAddressOriginalByRef.value = new WeakMap();
  editFacilityDialog.value = true;
};

const openRosterReportDialogForItem = (item) => {
  if (item) {
    selectedFacilityId.value = item.id;
    selectedFacilityFacilityId.value = item['Facility ID'];
    rosterReportDialog.value = true;
  }
};

const closeRosterReportDialog = () => {
  rosterReportDialog.value = false;
  selectedFacilityId.value = null;
  selectedFacilityFacilityId.value = null;
};

const openReportDialog = () => {
  if (selectedFacilities.value.length === 1) {
    const facilityId = selectedFacilities.value[0];
    const facility = items.value.find((f) => f.id === facilityId);
    if (facility) {
      selectedReportFacility.value = facility;
      reportExportsDialog.value = true;
    }
  }
};

const closeReportDialog = () => {
  reportExportsDialog.value = false;
  selectedReportFacility.value = null;
};

const onExportSuccess = (payload) => {
  console.log('Export completed successfully!');
};

// Initialize on mount
onMounted(() => {
  loadGoogleToken();
  loadGoogleApi();
});
</script>

<style scoped>
/* Main Container - Same as Results page */
.facilities-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  position: relative;
  isolation: isolate;
}

.v-theme--dark .facilities-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.facilities-container::-webkit-scrollbar {
  display: none !important;
}

/* Hide scrollbars everywhere in facilities container */
.facilities-container *::-webkit-scrollbar {
  display: none !important;
}

.facilities-container * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

/* Content wrapper */
.content-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Filters Section - Same pattern as Results */
.filters-section {
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

.v-theme--dark .filters-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.filters-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
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
  color: #111827;
  margin: 0;
}

.v-theme--dark .filters-title {
  color: #f9fafb;
}

.filters-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
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

/* Action Buttons */
.add-btn,
.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  box-shadow: none !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
  cursor: pointer !important;
}

.add-btn:hover,
.action-btn:hover {
  transform: translateY(-1px);
}

/* Table Section - Same as Results */
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

.v-theme--dark .table-section {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.table-section:hover {
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08);
  border-color: #c7d2fe;
  transform: translateY(-2px);
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
  background: #fafbfc;
  border-top: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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
  width: auto; /* Table grows to fit content */
  min-width: 100%; /* At least fill container */
  table-layout: auto; /* Auto layout for flexible columns */
}

.table-wrapper :deep(.v-table tbody) {
  width: 100%;
}

/* Better row spacing */
.table-wrapper :deep(.v-data-table__tr) {
  height: auto !important;
  min-height: 52px !important;
}

/* Data Table Styling */
:deep(.v-data-table) {
  background: transparent !important;
  isolation: isolate;
}

:deep(.v-data-table tbody tr) {
  position: relative;
  isolation: isolate;
  cursor: default;
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
  letter-spacing: 0.05em !important;
  white-space: nowrap !important;
  padding: 14px 12px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.2 !important;
}

:deep(.v-theme--dark .v-data-table__th) {
  color: #94a3b8 !important;
  background: #0f172a !important;
}

/* Force header content to stay on one line */
:deep(.v-data-table__th span),
:deep(.v-data-table__th .v-data-table-header__content),
:deep(.v-data-table-header__content) {
  white-space: nowrap !important;
  display: inline-block !important;
  line-height: 1.2 !important;
}

:deep(.v-data-table__td) {
  color: #1e293b !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-size: 0.875rem !important;
  white-space: normal !important;
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

/* Report Link Icon */
.report-link-icon {
  cursor: pointer !important;
  transition: all 0.2s ease;
}

.report-link-icon:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

/* Show/Hide Expand Button - Enhanced styling */
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
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  transition: all 0.2s ease !important;
}

:deep(.expand-btn::before) {
  opacity: 0 !important;
}

:deep(.expand-btn::after) {
  display: none !important;
}

:deep(.expand-btn:active) {
  transform: scale(0.96) !important;
}

:deep(.expand-btn .v-btn__overlay) {
  display: none !important;
}

:deep(.expand-btn .v-ripple__container) {
  display: none !important;
}

:deep(.expand-btn .v-icon) {
  color: currentColor !important;
  font-size: 18px !important;
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

:deep(.expanded-row) {
  background: #f9fafb !important;
}

.v-theme--dark :deep(.expanded-row) {
  background: #0f172a !important;
}

.expanded-cell {
  padding: 0 !important;
}

.expanded-content {
  padding: 28px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.v-theme--dark .expanded-content {
  background: #1e293b;
}

.expanded-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.v-theme--dark .expanded-actions {
  border-bottom-color: #334155;
}

.expanded-action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  padding: 10px 20px !important;
  height: auto !important;
  min-height: 42px !important;
  cursor: pointer !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2) !important;
}

.expanded-action-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3) !important;
}

.addresses-section {
  margin-top: 24px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.v-theme--dark .addresses-section {
  background: #1e293b;
  border-color: #334155;
}

.addresses-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6366f1;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.addresses-title::before {
  content: '📍';
  font-size: 1.2rem;
}

.v-theme--dark .addresses-title {
  color: #818cf8;
}

.addresses-table {
  background: #fafbfc !important;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.v-theme--dark .addresses-table {
  background: #0f172a !important;
  border-color: #334155;
}

:deep(.addresses-table thead th) {
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6) !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 12px 16px !important;
}

:deep(.v-theme--dark .addresses-table thead th) {
  background: linear-gradient(to bottom, #1a2332, #151e2e) !important;
}

:deep(.addresses-table tbody td) {
  padding: 12px 16px !important;
  color: #374151 !important;
}

:deep(.v-theme--dark .addresses-table tbody td) {
  color: #d1d5db !important;
}

:deep(.addresses-table tbody tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}

:deep(.v-theme--dark .addresses-table tbody tr:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

.address-cell {
  white-space: normal !important;
  word-wrap: break-word !important;
  line-height: 1.6 !important;
  max-width: 300px;
}

.no-addresses {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
  color: #6b7280;
  font-size: 0.875rem;
  background: #fafbfc;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  margin-top: 20px;
}

.v-theme--dark .no-addresses {
  color: #9ca3af;
  background: #151e2e;
  border-color: #334155;
}

:deep(.no-addresses .v-icon) {
  color: #a5b4fc !important;
  font-size: 1.5rem !important;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .filters-content,
  .table-content {
    padding: 16px;
  }

  .filters-header,
  .table-header {
    padding: 16px;
  }

  .expanded-content {
    padding: 16px;
  }

  .expanded-actions {
    flex-direction: column;
  }

  .expanded-action-btn {
    width: 100%;
  }
}

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
  background: linear-gradient(to right, #3b82f6 0% 100%) !important;
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

:deep(.modern-dialog .v-card-text) {
  padding: 24px !important;
}

:deep(.modern-dialog .v-card-actions) {
  padding: 16px 24px !important;
  border-top: 1px solid #e2e8f0;
}

:deep(.v-theme--dark .modern-dialog .v-card-actions) {
  border-top-color: #334155;
}
</style>
