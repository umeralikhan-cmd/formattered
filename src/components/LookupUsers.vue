<template>
  <v-card class="lookup-card">
    <!-- Header -->
    <div class="lookup-header">
      <h2 class="lookup-title">Results Info</h2>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="closeDialog"
        class="close-btn"
      ></v-btn>
    </div>

    <v-divider></v-divider>

    <v-card-text class="lookup-content">
      <v-row>
        <!-- Left Column: Status and Info -->
        <v-col cols="12" md="4">
          <div class="info-section">
            <!-- Status Badge -->
            <div class="status-badge" :class="user.parent_id ? 'status-matched' : 'status-not-found'">
              <v-icon size="20">{{ user.parent_id ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
              <span>{{ user.parent_id ? 'Matched' : 'Not Found' }}</span>
            </div>

            <!-- Matching Fields -->
            <div class="info-card">
              <h3 class="info-card-title">Matching Fields</h3>
              <div class="info-item">
                <span class="info-label">First Name:</span>
                <span class="info-value">{{ user.first_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Name:</span>
                <span class="info-value">{{ user.last_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">DOC ID:</span>
                <span class="info-value">{{ user.doc_number }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Facility ID:</span>
                <span class="info-value">{{ originalMaverickData.maverick_facility_id }}</span>
              </div>
            </div>

            <!-- Other Fields -->
            <div class="info-card">
              <h3 class="info-card-title">Other Fields</h3>
              <div class="info-item">
                <span class="info-label">Middle Name:</span>
                <span class="info-value">{{ user.middle_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">DOB:</span>
                <span class="info-value">{{ user.date_of_birth }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Document Type:</span>
                <span class="info-value">{{ user.document_type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Document Name:</span>
                <span class="info-value">{{ user.document_name }}</span>
              </div>
            </div>

            <!-- Help Card (when not found) -->
            <div v-if="!user.parent_id" class="help-card">
              <v-icon color="#EF4444" size="48" class="mb-3">mdi-account-alert</v-icon>
              <h3 class="help-title">Profile Not Found</h3>
              <div class="help-text">
                <strong>Search for Maverick</strong> by clicking "Search Maverick"
              </div>
              <div class="help-text">
                <strong>Create a New Maverick</strong> by clicking "New Mav"
              </div>
              <div class="help-text">
                <strong>Reference a Scanned PDF</strong> by clicking "More Info" below
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right Column: Search and Form -->
        <v-col cols="12" md="8">
          <!-- Action Buttons -->
          <div class="action-buttons">
            <div v-if="!showMaverickSearch && !isNewMaverickMode" class="button-row">
              <v-btn
                color="primary"
                size="large"
                :disabled="isAnyActionInProgress"
                @click="openMaverickSearch"
                prepend-icon="mdi-magnify"
                class="action-btn flex-grow-1"
              >
                Search Maverick
              </v-btn>
              <v-btn
                color="success"
                size="large"
                :disabled="isAnyActionInProgress"
                @click="clearMaverickFields"
                prepend-icon="mdi-plus"
                class="action-btn"
              >
                New Mav
              </v-btn>
            </div>

            <!-- New Maverick Mode Buttons -->
            <div v-if="!showMaverickSearch && isNewMaverickMode" class="button-row">
              <div class="flex-spacer"></div>
              <v-btn
                color="grey"
                size="large"
                variant="outlined"
                :disabled="isAnyActionInProgress"
                @click="cancelNewMaverick"
                class="action-btn"
              >
                Cancel
              </v-btn>
            </div>

            <!-- Search Mode -->
            <div v-if="showMaverickSearch" class="button-row search-row">
              <v-autocomplete
                label="Search Applicant"
                v-model="selectedApplicantId"
                :items="applicantOptions"
                return-object
                item-title="display_name"
                v-model:search="searchQuery"
                :loading="loading ? 'primary' : false"
                :disabled="isAnyActionInProgress"
                placeholder="Type to search..."
                no-filter
                hide-details
                variant="outlined"
                clearable
                @update:search="searchApplicants"
                @update:model-value="handleApplicantSelection"
                class="search-input"
              >
                <template v-slot:selection="{ item }">
                  <span v-if="item">
                    {{ item.raw.Name_first }} {{ item.raw.Name_last }} ({{ item.raw["DOC ID Number"] }})
                  </span>
                </template>

                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>
                      {{ item.raw["Last Known Facility Name"] }}
                      {{ item.raw["Last Known Facility ID"] }}
                    </v-list-item-title>
                  </v-list-item>
                </template>

                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title v-if="!loading">No Maverick Found</v-list-item-title>
                    <v-list-item-title v-else>Loading...</v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
              <v-btn
                color="grey"
                size="large"
                variant="outlined"
                :disabled="isAnyActionInProgress"
                @click="cancelMaverickSearch"
                class="action-btn"
              >
                Cancel
              </v-btn>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="form-section">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="First Name"
                  v-model="user.maverick_name_first"
                  variant="outlined"
                  :readonly="!isNewMaverickMode && !editingMaverick"
                  :disabled="(!isNewMaverickMode && !editingMaverick) || isAnyActionInProgress"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Middle Name"
                  v-model="user.maverick_name_middle"
                  variant="outlined"
                  :readonly="!isNewMaverickMode && !editingMaverick"
                  :disabled="(!isNewMaverickMode && !editingMaverick) || isAnyActionInProgress"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Last Name"
                  v-model="user.maverick_name_last"
                  variant="outlined"
                  :readonly="!isNewMaverickMode && !editingMaverick"
                  :disabled="(!isNewMaverickMode && !editingMaverick) || isAnyActionInProgress"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-date-input
                  label="Date of Birth"
                  v-model="dobModel"
                  variant="outlined"
                  :readonly="!isNewMaverickMode && !editingMaverick"
                  :disabled="(!isNewMaverickMode && !editingMaverick) || isAnyActionInProgress"
                  :format="formatMMDDYYYY"
                  :parse="parseMMDDYYYY"
                  clearable
                  hide-details
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="DOC Number"
                  v-model="user.maverick_doc_id"
                  variant="outlined"
                  :readonly="!isNewMaverickMode && !editingMaverick"
                  :disabled="(!isNewMaverickMode && !editingMaverick) || isAnyActionInProgress"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <template v-if="isNewMaverickMode || editingMaverick">
                  <v-text-field
                    v-if="facilityAddressesV2.length === 1"
                    label="Mailing Address"
                    :model-value="facilityAddressesV2[0]?.combined || ''"
                    variant="outlined"
                    readonly
                    disabled
                    hide-details
                  />
                  <v-select
                    v-else-if="facilityAddressesV2.length > 1"
                    :items="facilityAddressesV2"
                    item-title="combined"
                    item-value="id"
                    label="Mailing Address"
                    v-model="user.maverick_mailing_address_id"
                    variant="outlined"
                    :disabled="isAnyActionInProgress"
                    clearable
                    placeholder="Select an address"
                    hide-details
                  />
                  <v-text-field
                    v-else
                    label="Mailing Address"
                    :model-value="user.maverick_mailing_addresses"
                    variant="outlined"
                    readonly
                    disabled
                    hide-details
                  />
                </template>
                <template v-else>
                  <v-text-field
                    label="Mailing Address"
                    :model-value="user.maverick_mailing_addresses"
                    variant="outlined"
                    readonly
                    disabled
                    hide-details
                  />
                </template>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-if="isNewMaverickMode || editingMaverick"
                  label="Facility Name"
                  v-model="selectedFacility"
                  :items="facilityOptions"
                  item-value="facility_id"
                  item-title="facility_name"
                  variant="outlined"
                  :disabled="isAnyActionInProgress"
                  clearable
                  hide-details
                  @update:model-value="updateMaverickFacility"
                >
                  <template v-slot:selection="{ item }">
                    <span v-if="item">{{ item.raw.facility_name }}</span>
                  </template>
                </v-autocomplete>

                <v-text-field
                  v-else
                  label="Facility Name"
                  v-model="user.maverick_facility_name"
                  variant="outlined"
                  readonly
                  hide-details
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Action Row (Match/Edit/Save) -->
            <div v-if="showMaverickSearch && changed && !editingMaverick" class="action-row">
              <v-btn
                v-if="selectedApplicantId"
                size="large"
                color="primary"
                :loading="matchMaverickLoading"
                :disabled="isAnyActionInProgress"
                @click="MatchMaverickWithResults()"
                prepend-icon="mdi-content-save"
              >
                Match Maverick with Results
              </v-btn>
              <v-chip
                v-if="matchMaverickMessage"
                :color="matchMaverickMessage.type === 'success' ? 'success' : 'error'"
                closable
                @click:close="matchMaverickMessage = null"
                class="message-chip"
              >
                {{ matchMaverickMessage.text }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                size="large"
                variant="outlined"
                :disabled="isAnyActionInProgress"
                @click="EditMaverick"
                prepend-icon="mdi-pencil"
              >
                Edit Maverick
              </v-btn>
            </div>

            <div v-if="showMaverickSearch && changed && editingMaverick" class="action-row">
              <v-btn
                size="large"
                color="primary"
                :disabled="!maverickDataChanged || isAnyActionInProgress"
                :loading="saveMaverickChangesLoading"
                @click="SaveMaverickChanges"
                prepend-icon="mdi-content-save"
              >
                Save Maverick Changes
              </v-btn>
              <v-chip
                v-if="saveMaverickChangesMessage"
                :color="saveMaverickChangesMessage.type === 'success' ? 'success' : 'error'"
                closable
                @click:close="saveMaverickChangesMessage = null"
                class="message-chip"
              >
                {{ saveMaverickChangesMessage.text }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn
                color="grey"
                size="large"
                variant="outlined"
                @click="CancelEditMaverick"
                :disabled="isAnyActionInProgress"
              >
                Cancel
              </v-btn>
            </div>

            <div v-if="isNewMaverickMode" class="action-row">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                size="large"
                @click="saveNewMaverick"
                :loading="saveNewMaverickLoading"
                :disabled="isAnyActionInProgress"
                prepend-icon="mdi-content-save"
              >
                Save New Maverick
              </v-btn>
              <v-chip
                v-if="saveNewMaverickMessage"
                :color="saveNewMaverickMessage.type === 'success' ? 'success' : 'error'"
                closable
                @click:close="saveNewMaverickMessage = null"
                class="message-chip"
              >
                {{ saveNewMaverickMessage.text }}
              </v-chip>
            </div>
          </div>

          <!-- Document Preview -->
          <div class="document-preview">
            <h3 class="preview-title">Document Preview</h3>
            <div class="iframe-wrapper">
              <iframe
                :src="`https://drive.google.com/file/d/${user.document_id}/preview`"
                width="100%"
                height="800"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import api from "@/plugins/axios";
import { VDateInput } from "vuetify/labs/VDateInput";

export default {
  name: "LookupUsers",
  components: {
    VDateInput,
  },
  emits: ["closeDialog", "update-user"],
  data() {
    return {
      facilityOptions: [],
      facilityAddressesV2: [],
      applicantOptions: [],
      searchQuery: null,
      loading: false,
      searchTimeout: null,
      selectedApplicantId: null,
      showMaverickSearch: false,
      originalMaverickData: {},
      changed: false,
      selectedFacility: null,
      isNewMaverickMode: false,
      dobModel: null,
      editingMaverick: false,
      saveNewMaverickLoading: false,
      matchMaverickLoading: false,
      saveMaverickChangesLoading: false,
      matchMaverickMessage: null,
      saveMaverickChangesMessage: null,
      saveNewMaverickMessage: null,
    };
  },
  props: {
    user: {
      type: Object,
    },
    facilities: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    isAnyActionInProgress() {
      return this.saveNewMaverickLoading || this.matchMaverickLoading || this.saveMaverickChangesLoading;
    },
    selectedFacilityObj() {
      return (
        this.facilityOptions.find(
          (f) => f.facility_id === this.selectedFacility
        ) || null
      );
    },
    maverickDataChanged() {
      if (
        !this.originalMaverickData ||
        Object.keys(this.originalMaverickData).length === 0
      ) {
        return false;
      }

      return (
        this.user.maverick_name_first !==
          this.originalMaverickData.maverick_name_first ||
        this.user.maverick_name_last !==
          this.originalMaverickData.maverick_name_last ||
        this.user.maverick_name_middle !==
          this.originalMaverickData.maverick_name_middle ||
        this.user.maverick_date_of_birth !==
          this.originalMaverickData.maverick_date_of_birth ||
        this.user.maverick_doc_id !==
          this.originalMaverickData.maverick_doc_id ||
        this.user.maverick_facility_name !==
          this.originalMaverickData.maverick_facility_name ||
        this.user.maverick_facility_id !==
          this.originalMaverickData.maverick_facility_id ||
        JSON.stringify(this.user.maverick_facility_mailing_address || []) !==
          JSON.stringify(
            this.originalMaverickData.maverick_facility_mailing_address || []
          ) ||
        this.user.maverick_mailing_addresses !==
          this.originalMaverickData.maverick_mailing_addresses ||
        this.user.maverick_mailing_address_id !==
          this.originalMaverickData.maverick_mailing_address_id
      );
    },
  },
  methods: {
    async getDocumentName() {
      try {
        if (
          this.user &&
          this.user.bubble_sheet_data &&
          this.user.bubble_sheet_data.document_id
        ) {
          const res = await api.get("/get-document-name", {
            params: {
              document_id: this.user.bubble_sheet_data.document_id,
            },
          });

          if (res.data.success) {
            this.user.document_name = res.data.document_name;
            console.log(`Document name set to: ${this.user.document_name}`);
          } else {
            console.warn(`Failed to get document name: ${res.data.error}`);
            this.user.document_name =
              res.data.document_name || "Unknown Document";
          }
        } else {
          console.warn("No document_id found in user.bubble_sheet_data");
        }
      } catch (err) {
        console.error("Error getting document name:", err);
        if (
          this.user &&
          this.user.bubble_sheet_data &&
          this.user.bubble_sheet_data.document_id
        ) {
          this.user.document_name = `Document ${this.user.bubble_sheet_data.document_id}`;
        }
      }
    },
    EditMaverick() {
      this.editingMaverick = true;
    },
    CancelEditMaverick() {
      this.editingMaverick = false;

      if (this.originalMaverickData) {
        this.user.maverick_name_first =
          this.originalMaverickData.maverick_name_first;
        this.user.maverick_name_last =
          this.originalMaverickData.maverick_name_last;
        this.user.maverick_name_middle =
          this.originalMaverickData.maverick_name_middle;
        this.user.maverick_date_of_birth =
          this.originalMaverickData.maverick_date_of_birth;
        this.user.maverick_doc_id = this.originalMaverickData.maverick_doc_id;
        this.user.maverick_facility_name =
          this.originalMaverickData.maverick_facility_name;
        this.user.maverick_facility_id =
          this.originalMaverickData.maverick_facility_id;
        this.user.maverick_facility_mailing_address =
          this.originalMaverickData.maverick_facility_mailing_address;
        this.user.maverick_mailing_addresses =
          this.originalMaverickData.maverick_mailing_addresses;
        this.user.maverick_mailing_address_id =
          this.originalMaverickData.maverick_mailing_address_id;

        if (this.originalMaverickData.maverick_facility_id) {
          const facility = this.allFacilities.find(
            (f) => f.id === this.originalMaverickData.maverick_facility_id
          );
          this.selectedFacility = facility || null;
        } else {
          this.selectedFacility = null;
        }
      }

      this.changed = true;
    },
    async MatchMaverickWithResults() {
      try {
        this.matchMaverickLoading = true;
        this.matchMaverickMessage = null;

        const payload = {
          document_type: this.user.document_type,
          bubble_id: this.user.bubble_id,
          id: this.user.id,
          parent_id: this.selectedApplicantId?.id,
        };
        const res = await api.post("/match-maverick-with-results", payload);
        if (res.data.success) {
          if (this.selectedApplicantId?.id) {
            this.user.parent_id = this.selectedApplicantId.id;
          }

          this.setOriginalMaverickData();
          this.showMaverickSearch = false;
          this.changed = false;
          this.searchQuery = null;
          this.applicantOptions = [];
          this.selectedApplicantId = null;

          const message = `Matched successfully! Updated ${res.data.updated_extracted || 0} extracted record(s) and ${res.data.updated_bubble || 0} bubble sheet(s).`;

          this.matchMaverickMessage = {
            type: 'success',
            text: message
          };

          this.$emit("update-user", this.user);
        } else {
          this.matchMaverickMessage = {
            type: 'error',
            text: res.data.error || 'Failed to match maverick.'
          };

        }
      } catch (err) {
        console.error("Error matching maverick:", err);
        this.matchMaverickMessage = {
          type: 'error',
          text: 'Error matching maverick.'
        };

      } finally {
        this.matchMaverickLoading = false;
      }
    },

    async getFacilityMailingAddress() {
      try {
        if (this.user && this.user.maverick_facility_id) {
          const res = await api.get("/get-facility-mailing-address", {
            params: { facility_id: this.user.maverick_facility_id },
          });

          if (res.data.success) {
            const v2 = Array.isArray(res.data.mailing_addresses_v2)
              ? res.data.mailing_addresses_v2
              : [];
            this.facilityAddressesV2 = v2;
            const currentId = this.user.maverick_mailing_address_id;
            if (currentId) {
              const found = v2.find((a) => a.id === currentId);
              this.user.maverick_mailing_addresses = found?.combined || this.user.maverick_mailing_addresses || "";
            } else if (v2.length === 1) {
              this.user.maverick_mailing_address_id = v2[0].id;
              this.user.maverick_mailing_addresses = v2[0].combined || "";
            } else {
              this.user.maverick_mailing_addresses = this.user.maverick_mailing_addresses || "";
            }
            console.log(
              `Facility mailing addresses set to: ${JSON.stringify(
                this.facilityAddressesV2
              )}`
            );
          } else {
            console.warn(
              `Failed to get facility mailing address: ${res.data.error}`
            );
            this.facilityAddressesV2 = [];
            this.user.maverick_mailing_addresses = "";
          }
          this.setOriginalMaverickData();
        } else {
          this.setOriginalMaverickData();
          console.warn("No maverick_facility_id found in user object");
        }
      } catch (err) {
        console.error("Error getting facility mailing address:", err);
        this.facilityAddressesV2 = [];
        this.user.maverick_mailing_addresses = "";
      }
    },

    async getFacilityMailingAddressForSelection(facilityId) {
      try {
        const res = await api.get("/get-facility-mailing-address", {
          params: { facility_id: facilityId },
        });

        if (res.data.success) {
          const v2 = Array.isArray(res.data.mailing_addresses_v2)
            ? res.data.mailing_addresses_v2
            : [];
          this.facilityAddressesV2 = v2;
          if (v2.length === 1) {
            this.user.maverick_mailing_address_id = v2[0].id;
            this.user.maverick_mailing_addresses = v2[0].combined || "";
          } else {
            this.user.maverick_mailing_addresses = "";
          }
        } else {
          console.warn(
            `Failed to get facility mailing address: ${res.data.error}`
          );
          this.facilityAddressesV2 = [];
          this.user.maverick_mailing_addresses = "";
        }
      } catch (err) {
        console.error(
          "Error getting facility mailing address for selection:",
          err
        );
        this.facilityAddressesV2 = [];
        this.user.maverick_mailing_addresses = "";
      }
    },

    async getFacilities() {
      try {
        if (this.facilities && this.facilities.length > 0) {
          this.facilityOptions = this.facilities.map((facility) => ({
            facility_id: facility.facility_id,
            facility_name: facility.facility_name,
            mailing_addresses: Array.isArray(facility.mailing_addresses)
              ? facility.mailing_addresses
              : facility.facility_address
              ? [facility.facility_address]
              : [],
          }));
          console.log("Using passed facilities:", this.facilityOptions);
          return;
        }

        const res = await api.get("/get-facilities");

        this.facilityOptions = res.data.map((facility) => ({
          facility_id: facility.facility_id,
          facility_name: facility.facility_name,
          mailing_addresses: facility.location?.line1
            ? [facility.location.line1]
            : [],
        }));
        console.log("Facilities fetched:", this.facilityOptions);
      } catch (err) {
        console.error("Error fetching facilities:", err);
      }
    },

    async searchApplicants(val) {
      console.log("Search triggered with value:", val);
      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      if (!val || val.length < 2) {
        this.applicantOptions = [];
        return;
      }

      this.loading = true;

      this.searchTimeout = setTimeout(async () => {
        try {
          console.log("Making API request for:", val);
          const res = await api.get("/search-mavericks", {
            params: {
              query: val,
              limit: 20,
            },
          });

          console.log("API response:", res.data);

          this.applicantOptions = res.data.map((applicant) => ({
            ...applicant,
            display_name: `${applicant.Name_first || ""} ${
              applicant.Name_last || ""
            } (${applicant["DOC ID Number"] || ""})`,
          }));

          if (
            this.applicantOptions.length === 1 &&
            (this.applicantOptions[0]["DOC ID Number"] === val ||
              `${this.applicantOptions[0].Name_first} ${this.applicantOptions[0].Name_last}`.toLowerCase() ===
                val.toLowerCase())
          ) {
            this.selectedApplicant = this.applicantOptions[0];
          }
        } catch (err) {
          console.error("Error searching applicants:", err);
        } finally {
          this.loading = false;
        }
      }, 500);
    },

    closeDialog() {
      this.cancelMaverickSearch();
      this.$emit("closeDialog");
    },
    handleApplicantSelection(item) {
      this.changed = true;
      this.isNewMaverickMode = false;
      console.log("Applicant selected:", item);
      if (item) {
        this.user.maverick_name_first = item.Name_first || "";
        this.user.maverick_name_last = item.Name_last || "";
        this.user.maverick_name_middle = item.Name_middle || "";
        this.user.maverick_date_of_birth = item["Date of Birth"] || "";
        this.user.maverick_doc_id = item["DOC ID Number"] || "";
        this.user.maverick_facility_name =
          item["Last Known Facility Name"] || "";
        this.user.maverick_facility_id = item["Last Known Facility ID"] || null;

        this.selectedFacility = item["Last Known Facility ID"] || null;

        if (item["Last Known Facility ID"]) {
          this.getFacilityMailingAddressForSelection(
            item["Last Known Facility ID"]
          );
        } else {
          this.user.maverick_facility_mailing_address = "";
        }
        this.dobModel =
          this.parseMMDDYYYY(this.user.maverick_date_of_birth) ||
          (this.user.maverick_date_of_birth
            ? new Date(this.user.maverick_date_of_birth)
            : null);
      }
    },
    openMaverickSearch() {
      this.showMaverickSearch = true;
      this.changed = true;
      this.searchQuery = null;
      this.applicantOptions = [];
      this.selectedApplicantId = null;
    },
    cancelMaverickSearch() {
      this.showMaverickSearch = false;
      this.changed = false;
      this.isNewMaverickMode = false;
      if (this.originalMaverickData) {
        this.user.maverick_name_first =
          this.originalMaverickData.maverick_name_first;
        this.user.maverick_name_last =
          this.originalMaverickData.maverick_name_last;
        this.user.maverick_name_middle =
          this.originalMaverickData.maverick_name_middle;
        this.user.maverick_date_of_birth =
          this.originalMaverickData.maverick_date_of_birth;
        this.user.maverick_doc_id = this.originalMaverickData.maverick_doc_id;
        this.user.maverick_facility_name =
          this.originalMaverickData.maverick_facility_name;
        this.user.maverick_facility_id =
          this.originalMaverickData.maverick_facility_id;
        this.user.maverick_facility_mailing_address =
          this.originalMaverickData.maverick_facility_mailing_address;
        this.user.maverick_mailing_addresses =
          this.originalMaverickData.maverick_mailing_addresses;

        this.selectedFacility = this.originalMaverickData.maverick_facility_id;
        this.dobModel =
          this.parseMMDDYYYY(this.user.maverick_date_of_birth) ||
          (this.user.maverick_date_of_birth
            ? new Date(this.user.maverick_date_of_birth)
            : null);
      }

      this.searchQuery = null;
      this.applicantOptions = [];
      this.selectedApplicantId = null;
      this.editingMaverick = false;
    },
    setOriginalMaverickData() {
      this.originalMaverickData = {
        maverick_name_first: this.user.maverick_name_first || "",
        maverick_name_last: this.user.maverick_name_last || "",
        maverick_name_middle: this.user.maverick_name_middle || "",
        maverick_date_of_birth: this.user.maverick_date_of_birth || "",
        maverick_doc_id: this.user.maverick_doc_id || "",
        maverick_facility_name: this.user.maverick_facility_name || "",
        maverick_facility_id: this.user.maverick_facility_id || null,
        maverick_facility_mailing_address: Array.isArray(
          this.user.maverick_facility_mailing_address
        )
          ? this.user.maverick_facility_mailing_address
          : this.user.maverick_facility_mailing_address
          ? [this.user.maverick_facility_mailing_address]
          : [],
        maverick_mailing_addresses: this.user.maverick_mailing_addresses || "",
        maverick_mailing_address_id: this.user.maverick_mailing_address_id || null,
      };
      console.log("Original Maverick Data Set:", this.originalMaverickData);
    },
    clearMaverickFields() {
      this.user.maverick_name_first = "";
      this.user.maverick_name_last = "";
      this.user.maverick_name_middle = "";
      this.user.maverick_date_of_birth = "";
      this.user.maverick_doc_id = "";
      this.user.maverick_facility_name = "";
      this.user.maverick_facility_id = null;
      this.user.maverick_facility_mailing_address = [];
      this.selectedFacility = null;
      this.user.maverick_mailing_addresses = "";
      this.isNewMaverickMode = true;
      this.changed = true;
    },
    updateMaverickFacility(facilityId) {
      if (facilityId) {
        const selectedFacility = this.facilityOptions.find(
          (facility) => facility.facility_id === facilityId
        );

        if (selectedFacility) {
          this.user.maverick_facility_name = selectedFacility.facility_name;
          this.user.maverick_facility_id = facilityId;
          this.getFacilityMailingAddressForSelection(facilityId);
          this.user.maverick_mailing_address_id = null;
          this.user.maverick_mailing_addresses = "";
        }
      } else {
        this.user.maverick_facility_name = "";
        this.user.maverick_facility_id = null;
        this.facilityAddressesV2 = [];
        this.user.maverick_mailing_addresses = "";
        this.user.maverick_mailing_address_id = null;
      }
      this.changed = true;
    },
    cancelNewMaverick() {
      this.isNewMaverickMode = false;
      this.changed = false;

      if (this.originalMaverickData) {
        this.user.maverick_name_first =
          this.originalMaverickData.maverick_name_first;
        this.user.maverick_name_last =
          this.originalMaverickData.maverick_name_last;
        this.user.maverick_name_middle =
          this.originalMaverickData.maverick_name_middle;
        this.user.maverick_date_of_birth =
          this.originalMaverickData.maverick_date_of_birth;
        this.user.maverick_doc_id = this.originalMaverickData.maverick_doc_id;
        this.user.maverick_facility_name =
          this.originalMaverickData.maverick_facility_name;
        this.user.maverick_facility_id =
          this.originalMaverickData.maverick_facility_id;
        this.user.maverick_facility_mailing_address =
          this.originalMaverickData.maverick_facility_mailing_address;
        this.user.maverick_mailing_addresses =
          this.originalMaverickData.maverick_mailing_addresses;

        this.selectedFacility = this.originalMaverickData.maverick_facility_id;
      }
    },
    async saveNewMaverick() {
      try {
        this.saveNewMaverickMessage = null;

        if (
          !this.user.maverick_name_first ||
          !this.user.maverick_name_last ||
          !this.user.maverick_doc_id ||
          !this.user.maverick_facility_id
        ) {
          this.saveNewMaverickMessage = {
            type: 'error',
            text: 'Please fill in required fields: First Name, Last Name, DOC Number, and Facility'
          };

          return;
        }

        this.saveNewMaverickLoading = true;

        const payload = {
          document_type: this.user.document_type,
          bubble_id: this.user.bubble_id,
          id: this.user.id,
          maverick_name_first: this.user.maverick_name_first,
          maverick_name_last: this.user.maverick_name_last,
          maverick_name_middle: this.user.maverick_name_middle,
          maverick_date_of_birth: this.user.maverick_date_of_birth,
          maverick_doc_id: this.user.maverick_doc_id,
          maverick_facility_name: this.user.maverick_facility_name,
          maverick_facility_id: this.user.maverick_facility_id,
          maverick_mailing_addresses: this.user.maverick_mailing_addresses,
          maverick_mailing_address_id: this.user.maverick_mailing_address_id,
        };

        const res = await api.post("/save-new-maverick", payload);
        if (res.data && res.data.success) {
          if (res.data.user && res.data.user.id) {
            this.user.parent_id = res.data.user.id;
            Object.assign(this.user, res.data.user);
          }

          this.saveNewMaverickMessage = {
            type: 'success',
            text: `New maverick created successfully! ID: ${res.data.user?.id || 'N/A'}`
          };

          this.$emit("update-user", this.user);

          this.setOriginalMaverickData();
          this.isNewMaverickMode = false;
          this.changed = false;
        } else {
          this.saveNewMaverickMessage = {
            type: 'error',
            text: res.data?.error || 'Failed to save maverick'
          };

        }
      } catch (err) {
        console.error("Error saving new maverick:", err);
        this.saveNewMaverickMessage = {
          type: 'error',
          text: 'Error saving new maverick'
        };

      } finally {
        this.saveNewMaverickLoading = false;
      }
    },
    async SaveMaverickChanges() {
      try {
        this.saveMaverickChangesLoading = true;
        this.saveMaverickChangesMessage = null;

        if (
          !this.user.maverick_name_first ||
          !this.user.maverick_name_last ||
          !this.user.maverick_doc_id ||
          !this.user.maverick_facility_id
        ) {
          this.saveMaverickChangesMessage = {
            type: 'error',
            text: 'Please fill in required fields: First Name, Last Name, DOC Number, and Facility'
          };

          return;
        }

        const payload = {
          document_type: this.user.document_type,
          bubble_id: this.user.bubble_id,
          id: this.user.id,
          maverick_name_first: this.user.maverick_name_first,
          maverick_name_last: this.user.maverick_name_last,
          maverick_name_middle: this.user.maverick_name_middle,
          maverick_date_of_birth: this.user.maverick_date_of_birth,
          maverick_doc_id: this.user.maverick_doc_id,
          maverick_facility_name: this.user.maverick_facility_name,
          maverick_facility_id: this.user.maverick_facility_id,
          maverick_mailing_addresses: this.user.maverick_mailing_addresses,
          maverick_mailing_address_id: this.user.maverick_mailing_address_id,
          maverick_id: this.user.parent_id,
        };

        const res = await api.post("/save-maverick-changes", payload);
        if (res.data && res.data.success) {
          if (res.data.user) {
            Object.assign(this.user, res.data.user);
          }

          const details = [];
          if (res.data.updated_profile) details.push('profile updated');
          if (res.data.parent_changed) details.push('parent changed');
          if (res.data.updated_extracted > 0) details.push(`${res.data.updated_extracted} extracted record(s)`);
          if (res.data.updated_bubble > 0) details.push(`${res.data.updated_bubble} bubble sheet(s)`);

          const message = `Maverick changes saved successfully! ${details.length > 0 ? '(' + details.join(', ') + ')' : ''}`;

          this.saveMaverickChangesMessage = {
            type: 'success',
            text: message
          };

          this.$emit("update-user", this.user);

          this.setOriginalMaverickData();
          this.editingMaverick = false;
          this.isNewMaverickMode = false;
          this.changed = false;
        } else {
          this.saveMaverickChangesMessage = {
            type: 'error',
            text: res.data?.error || 'Failed to save maverick'
          };

        }
      } catch (err) {
        console.error("Error saving new maverick:", err);
        this.saveMaverickChangesMessage = {
          type: 'error',
          text: 'Error saving new maverick'
        };

      } finally {
        this.saveMaverickChangesLoading = false;
      }
    },
    formatMMDDYYYY(date) {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d)) return "";
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    },
    parseMMDDYYYY(text) {
      if (!text) return null;
      const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(text);
      if (m) {
        const month = parseInt(m[1], 10) - 1;
        const day = parseInt(m[2], 10);
        const year = parseInt(m[3], 10);
        const d = new Date(year, month, day);
        return isNaN(d) ? null : d;
      }
      const iso = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(text);
      if (iso) {
        const year = parseInt(iso[1], 10);
        const month = parseInt(iso[2], 10) - 1;
        const day = parseInt(iso[3], 10);
        const d = new Date(year, month, day);
        return isNaN(d) ? null : d;
      }
      const d = new Date(text);
      return isNaN(d) ? null : d;
    },
  },
  watch: {
    dobModel(newVal) {
      this.user.maverick_date_of_birth = newVal
        ? this.formatMMDDYYYY(newVal)
        : "";
      this.changed = true;
    },
    selectedFacility() {
      const addrs = this.facilityAddressesV2 || [];
      if (addrs.length === 1) {
        this.user.maverick_mailing_address_id = addrs[0].id;
        this.user.maverick_mailing_addresses = addrs[0].combined || "";
      } else if (addrs.length > 1) {
        this.user.maverick_mailing_address_id = null;
        this.user.maverick_mailing_addresses = "";
      }
    },
  },
  mounted() {
    this.getFacilities();
    this.getDocumentName();
    this.getFacilityMailingAddress();
    if (this.user && this.user.maverick_facility_id) {
      this.selectedFacility = this.user.maverick_facility_id;
    }

    this.searchQuery = null;
    this.applicantOptions = [];

    this.dobModel =
      this.parseMMDDYYYY(this.user.maverick_date_of_birth) ||
      (this.user.maverick_date_of_birth
        ? new Date(this.user.maverick_date_of_birth)
        : null);
  },
};
</script>

<style scoped>
.lookup-card {
  border-radius: 16px !important;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.lookup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(to bottom, #F9FAFB, #FFFFFF);
}

.v-theme--dark .lookup-header {
  background: linear-gradient(to bottom, #0F172A, #1E293B);
}

.lookup-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.v-theme--dark .lookup-title {
  color: #F9FAFB;
}

.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

/* Content */
.lookup-content {
  padding: 24px !important;
}

/* Status Badge */
.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
}

.status-matched {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-not-found {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Info Cards */
.info-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.v-theme--dark .info-card {
  background: #1E293B;
  border-color: #334155;
}

.info-card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.v-theme--dark .info-card-title {
  color: #94A3B8;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #F1F5F9;
}

.v-theme--dark .info-item {
  border-bottom-color: #334155;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #64748B;
  font-size: 0.875rem;
}

.v-theme--dark .info-label {
  color: #94A3B8;
}

.info-value {
  font-weight: 600;
  color: #1E293B;
  font-size: 0.875rem;
}

.v-theme--dark .info-value {
  color: #F9FAFB;
}

/* Help Card */
.help-card {
  background: linear-gradient(to bottom, #FEF2F2, #FFFFFF);
  border: 2px solid #FEE2E2;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.v-theme--dark .help-card {
  background: linear-gradient(to bottom, #450A0A, #1E293B);
  border-color: #7F1D1D;
}

.help-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #DC2626;
  margin-bottom: 16px;
}

.v-theme--dark .help-title {
  color: #FCA5A5;
}

.help-text {
  font-size: 0.875rem;
  color: #475569;
  margin-bottom: 12px;
  line-height: 1.5;
}

.v-theme--dark .help-text {
  color: #CBD5E1;
}

.help-text strong {
  color: #1E293B;
  font-weight: 600;
}

.v-theme--dark .help-text strong {
  color: #F9FAFB;
}

/* Action Buttons */
.action-buttons {
  margin-bottom: 24px;
}

.button-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.search-row {
  flex-wrap: nowrap;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 40px !important;
}

.flex-grow-1 {
  flex-grow: 1;
}

.flex-spacer {
  flex-grow: 1;
}

.search-input {
  flex-grow: 1;
}

/* Form Section */
.form-section {
  background: #F9FAFB;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.v-theme--dark .form-section {
  background: #0F172A;
  border-color: #334155;
}

/* Action Row */
.action-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E2E8F0;
}

.v-theme--dark .action-row {
  border-top-color: #334155;
}

.message-chip {
  max-width: 500px;
}

/* Document Preview */
.document-preview {
  margin-top: 24px;
}

.preview-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 12px;
}

.v-theme--dark .preview-title {
  color: #F9FAFB;
}

.iframe-wrapper {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  background: #F9FAFB;
}

.v-theme--dark .iframe-wrapper {
  border-color: #334155;
  background: #0F172A;
}

/* Responsive Design */
@media (max-width: 768px) {
  .lookup-header {
    padding: 16px;
  }

  .lookup-content {
    padding: 16px !important;
  }

  .button-row {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .search-row {
    flex-direction: column;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
