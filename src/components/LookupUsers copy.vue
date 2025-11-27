<template>
  <v-card>
    <v-card-title>
      <v-row no-gutters>
        <v-col> Applicants </v-col>
        <v-col class="text-right">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-row>
        <v-col sm="6">
          <div class="d-flex align-center mb-2">
            <v-autocomplete
              label="Search Applicant"
              v-model="selectedApplicantId"
              :items="applicantOptions"
              item-value="id"
              item-title="full_name"
              v-model:search="searchQuery"
              :loading="loading"
              placeholder="Type to search..."
              no-filter
              hide-no-data
              dense
              variant="outlined"
              clearable
              @update:search="searchApplicants"
              @update:model-value="handleApplicantSelection"
              class="flex-grow-1"
            >
              <!-- Customize how selected item appears -->
              <template v-slot:selection="{ item }">
                <span v-if="item">
                  {{ item.raw.first_name }} {{ item.raw.last_name }} ({{
                    item.raw.inmate_number
                  }})
                </span>
              </template>

              <!-- Customize dropdown item appearance -->
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <v-list-item-subtitle>
                    {{ item.raw.inmate_number }} -
                    {{ item.raw.facility_name || "No facility" }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>

              <!-- No results message -->
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>
                    No applicants found. Try a different search.
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
          </div>
        </v-col>
        <v-col sm="6" class="text-right">
          <v-btn
            icon
            color="primary"
            class="ml-2"
            @click="clearApplicant"
            title="Clear applicant"
          >
            <v-icon>mdi-account-remove-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <!-- First Column: Applicant Details -->
        <v-col sm="2">
          <v-text-field
            label="First Name"
            v-model="selectedApplicant.first_name"
            dense
            variant="outlined"
          ></v-text-field>
          <v-text-field
            label="Last Name"
            v-model="selectedApplicant.last_name"
            dense
            variant="outlined"
          ></v-text-field>
          <v-text-field
            label="Middle Name"
            v-model="selectedApplicant.middle_name"
            dense
            variant="outlined"
          ></v-text-field>
          <v-date-input
            v-model="selectedApplicant.date_of_birth"
            label="Date of Birth"
            variant="outlined"
          ></v-date-input>
          <v-text-field
            label="Inmate Number"
            v-model="selectedApplicant.inmate_number"
            dense
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            label="Facility Name"
            v-model="selectedApplicant.facility_id"
            :items="facilityOptions"
            item-value="facility_id"
            item-title="facility_name"
            densetitle
            variant="outlined"
            clearable
            @update:model-value="updateMailingAddress"
          >
            <!-- Customize how selected item appears -->
            <template v-slot:selection="{ item }">
              <span v-if="item">
                {{ item.raw.facility_name }}
              </span>
            </template>

            <!-- Customize dropdown item appearance -->
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.facility_name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.raw.facility_address }}</v-list-item-subtitle
                >
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            label="Mailing Address"
            v-model="selectedApplicant.mailing_address"
            dense
            readonly
            variant="outlined"
          ></v-text-field>
          <div class="text-center">
            <v-btn
              v-if="isNewUser"
              @click="addUser"
              color="primary"
              :disabled="!isFormValid"
            >
              Add - <v-icon>mdi-account-plus</v-icon>
            </v-btn>
            <v-btn
              v-else
              @click="saveChanges"
              color="primary"
              :disabled="!isFormValid"
            >
              Update - <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Second Column: Document Details -->
        <v-col sm="10">
          <div v-if="items.length">
            <v-data-table
              :headers="headers"
              :items="items"
              :items-per-page="10"
              item-value="document.document_id"
              return-object
              show-select
              v-model="selectedItems"
              show-expand
            >
              <!-- Applicant First Name -->
              <template v-slot:item.first_name="{ item }">
                <span
                  >{{ item.applicant.first_name }}
                  <v-icon
                    v-if="item.document.document_id == user.document_id"
                    color="success"
                    >mdi-exclamation-thick</v-icon
                  ></span
                >
              </template>

              <!-- Applicant Last Name -->
              <template v-slot:item.last_name="{ item }">
                <span>{{ item.applicant.last_name }}</span>
              </template>

              <!-- Applicant Middle Name -->
              <template v-slot:item.middle_name="{ item }">
                <span>{{ item.applicant.middle_name }}</span>
              </template>

              <template v-slot:item.date_of_birth="{ item }">
                <span>{{ item.applicant.date_of_birth }}</span>
              </template>

              <!-- Facility Name -->
              <template v-slot:item.facility_id="{ item }">
                <span>{{ item.applicant.facility_name }}</span>
              </template>
              <!-- Inmate Number -->
              <template v-slot:item.inmate_number="{ item }">
                <span>{{ item.applicant.inmate_number }}</span>
              </template>

              <!-- Document Name -->
              <template v-slot:item.document_name="{ item }">
                <span>{{ item.document.document_name }}</span>
              </template>

              <!-- Document Type -->
              <template v-slot:item.type="{ item }">
                <span>{{ item.document.type }}</span>
              </template>

              <template
                v-slot:item.data-table-expand="{
                  internalItem,
                  isExpanded,
                  toggleExpand,
                }"
              >
                <v-btn
                  :append-icon="
                    isExpanded(internalItem)
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                  :text="isExpanded(internalItem) ? 'Collapse' : 'More info'"
                  class="text-none"
                  color="medium-emphasis"
                  size="small"
                  variant="text"
                  border
                  slim
                  @click="toggleExpand(internalItem)"
                ></v-btn>
              </template>

              <template v-slot:expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length" class="py-2">
                    <v-sheet rounded="lg" border>
                       <v-tabs v-model="tab" background-color="primary" dark>
                      <v-tab value="pdf">Document</v-tab>
                      <v-tab value="image">Bubble Sheet</v-tab>
                    </v-tabs>
                    <v-tabs-window v-model="tab">
                      <v-tabs-window-item value="pdf">
                        <iframe
                          :src="`https://drive.google.com/file/d/${item.document.document_id}/preview`"
                          width="100%"
                          height="800"
                          frameborder="0"
                          allowfullscreen
                        ></iframe>
                      </v-tabs-window-item>

                      <!-- Image Tab -->
                      <v-tabs-window-item value="image">
                        <div v-if="imageIDS[item.document.document_id]">
                          <iframe
                            :src="`https://drive.google.com/file/d/${imageIDS[item.document.document_id]}/preview`"
                            width="100%"
                            height="800"
                            frameborder="0"
                            allowfullscreen
                          ></iframe>
                        </div>
                        <div v-else>
                          <p>No image available. {{ imageIDS[item.document.document_id] }} </p>
                        </div>
                      </v-tabs-window-item>
                    </v-tabs-window>
                    </v-sheet>
                  </td>
                </tr>
              </template>
            </v-data-table>
            <v-divider></v-divider>
          </div>
          <div v-else>
            <p>No documents available.</p>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>

  <v-dialog v-model="deleteDialog" max-width="500px">
    <v-card style="justify-content: center">
      <v-card-title class="headline">Delete Document</v-card-title>
      <v-card-text>
        Are you sure you want to delete this document?
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="deleteDialog = false">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="deleteDocumentFunction">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <template>
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      multi-line
      rounded="pill"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="red" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </template>
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
      headers: [
        { title: "First Name", key: "first_name" },
        { title: "Last Name", key: "last_name" },
        { title: "Middle Name", key: "middle_name" },
        { title: "Date of Birth", key: "date_of_birth" },
        { title: "Facility Name", key: "facility_id" },
        { title: "Inmate Number", key: "inmate_number" },
        { title: "Document Name", key: "document_name" },
        { title: "Type", key: "type" },
      ],
      selectedItems: [],
      // Items will be populated dynamically
      items: [],
      expandedIndex: null, // Tracks which document's iframe is expanded
      tab: "pdf", // Default tab to show,
      selectedDocument: null, // Stores the selected document for deletion
      deleteDialog: false, // Controls the visibility of the delete confirmation dialog
      facilityOptions: [], // Stores facility names for the autocomplete
      snackbar: false, // Controls the snackbar visibility
      snackbarColor: "success", // Snackbar color
      snackbarText: "", // Snackbar text message
      selected: [],
      selectedApplicant: {},
      applicantOptions: [], // Options for the applicant autocomplete
      searchQuery: null,
      loading: false,
      searchTimeout: null,
      selectedApplicantId: null, // New property for autocomplete binding
      imageIDS:{}
    };
  },
  props: {
    user: {
      type: Object,
    },
  },
  computed: {
    isFormValid() {
      // Check if required fields are present
      return (
        this.selectedApplicant &&
        ((this.selectedApplicant.first_name &&
          this.selectedApplicant.first_name.trim() !== "") ||
          (this.selectedApplicant.last_name &&
            this.selectedApplicant.last_name.trim() !== "")) &&
        this.selectedApplicant.inmate_number &&
        this.selectedApplicant.facility_id
      );
    },

    isNewUser() {
      // Check if this is a new user (no ID)
      return !this.selectedApplicant.id;
    },
  },
  watch: {
    "selectedApplicant.id": {
      handler(newVal) {
        if (newVal) {
          this.onApplicantSelected();
        }
      },
    },
  },
  methods: {
    async loadDocumentFiles(documentId) {
      try {
        const res = await api.post("/get-document-image", {
          document_id: documentId
        });
        this.imageIDS[documentId] = res.data.image_document_id;
      } catch (err) {
        console.error(err);
      } finally {
      }
    },



    updateMailingAddress() {
      const selectedFacility = this.facilityOptions.find(
        (facility) =>
          facility.facility_id === this.selectedApplicant.facility_id
      );
      console.log("Selected Facility:", selectedFacility);
      // Update mailing address based on selected facility
      if (selectedFacility) {
        this.selectedApplicant.mailing_address =
          selectedFacility.facility_address;
        this.selectedApplicant.facility_name = selectedFacility.facility_name; // Update facility name as well
      } else {
        this.selectedApplicant.mailing_address = "";
      }
    },
    filterFacilityByName(item, queryText, itemText) {
      const name = item.facility_name?.toLowerCase() || "";
      const address = item.facility_address?.toLowerCase() || "";
      const q = queryText.toLowerCase();
      return name.includes(q) || address.includes(q);
    },

    async getFacilities() {
      try {
        const res = await api.get("/get-facilities"); // Replace with your actual endpoint

        this.facilityOptions = res.data.map((facility) => ({
          facility_id: facility.facility_id,
          facility_name: facility.facility_name,
          facility_address: facility.location.line1,
        }));
        this.updateMailingAddress(); // Update mailing address based on selected facility
        console.log("Facilities fetched:", this.facilityOptions);
      } catch (err) {
        console.error("Error fetching facilities:", err);
      }
    },

    async searchApplicants(val) {
      console.log("Search triggered with value:", val);
      // Clear previous timeout to implement debounce
      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      // If search query is empty, clear results
      if (!val || val.length < 2) {
        this.applicantOptions = [];
        return;
      }

      // Set loading state
      this.loading = true;

      // Debounce the search to prevent too many requests
      this.searchTimeout = setTimeout(async () => {
        try {
          console.log("Making API request for:", val);
          const res = await api.get("/search-applicants", {
            params: {
              query: val,
              limit: 20, // Limit to 20 results
            },
          });

          console.log("API response:", res.data);
          this.applicantOptions = res.data;

          // If we have results and one exactly matches, select it
          if (
            this.applicantOptions.length === 1 &&
            (this.applicantOptions[0].inmate_number === val ||
              this.applicantOptions[0].full_name.toLowerCase() ===
                val.toLowerCase())
          ) {
            this.selectedApplicant = this.applicantOptions[0];
            this.getApplicants();
          }
        } catch (err) {
          console.error("Error searching applicants:", err);
          this.snackbarText = "Error searching for applicants";
          this.snackbarColor = "error";
          this.snackbar = true;
        } finally {
          this.loading = false;
        }
      }, 300); // Wait 300ms after user stops typing
    },

    getFacilityName(facility_id) {
      const facility = this.facilityOptions.find(
        (f) => f.facility_id === facility_id
      );
      return facility ? facility.facility_name : "";
    },

    closeDialog() {
      this.$emit("closeDialog");
    },
    deleteDocuentDialog(item) {
      this.selectedDocument = item;
      this.deleteDialog = true; // Open the delete confirmation dialog
    },
    async deleteDocumentFunction() {
      try {
        const res = await api.post("/delete-document", {
          document_id: this.selectedDocument.document.document_id,
          image_id: this.selectedDocument.image.image_id,
        });
        if (res.status === 200) {
          this.deleteDialog = false; // Close the dialog
          this.getApplicants(); // Refresh the document details
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getApplicants() {
      try {
        const res = await api.get("/get-applicant-details", {
          params: {
            first_name: this.selectedApplicant.first_name,
            last_name: this.selectedApplicant.last_name,
            inmate_number: this.selectedApplicant.inmate_number,
          },
        });
        this.items = res.data;
        // First get all other documents
        this.items = res.data.filter(
          (item) => item.document.document_id !== this.user.document_id
        );

        // Then add the current user's document to the items array if it exists
        if (this.user && this.user.document_id) {
          // Create an entry for the current user that matches the structure of other items
          const userEntry = {
            document: {
              document_id: this.user.document_id,
              document_name: this.user.document_name || "",
              type: this.user.type || "",
            },
            applicant: {
              first_name: this.user.first_name || "",
              last_name: this.user.last_name || "",
              middle_name: this.user.middle_name || "",
              date_of_birth: this.user.date_of_birth || "",
              facility_name: this.user.facility_name || "",
              inmate_number: this.user.inmate_number || "",
            },
            // Add other properties that might be needed
            image: {
              image_id: this.user.image_id || "",
            },
          };

          // Add the user entry to the beginning of the items array to highlight it
          this.items.unshift(userEntry);


          this.items.forEach((item) => {
            if (item.document && item.document.document_id) {
              this.loadDocumentFiles(item.document.document_id);
            }
          });

        }
      } catch (err) {
        console.error(err);
      }
    },
    async getSelectedApplicant() {
      try {
        const formData = new FormData();
        formData.append("user", JSON.stringify(this.user));
        const res = await api.post("/get-selected-applicant", formData);
        this.selectedApplicant = res.data;
        console.log("Selected Applicant:", this.selectedApplicant);
        this.getApplicants();
      } catch (err) {
        console.error(err);
      }
    },
    async saveChanges() {
      try {
        // Create a payload with the selected applicant data and document items
        const payload = {
          // Applicant information
          ...this.selectedApplicant,

          // Add documents from items array
          items: this.items.map((item) => ({
            document: {
              document_id: item.document.document_id,
              document_name: item.document.document_name,
              type: item.document.type,
              status: item.document.status || "active",
              date_created: item.document.date_created,
            },
            applicant: {
              ...item.applicant,
            },
          })),
        };

        console.log("Saving changes with payload:", payload);

        const res = await api.post("/update-applicant", payload);
        if (res.status === 200) {
          // Update the user object with new values from selectedApplicant
          // Directly update this.user with selectedApplicant fields
          this.user.first_name = this.selectedApplicant.first_name;
          this.user.last_name = this.selectedApplicant.last_name;
          this.user.middle_name = this.selectedApplicant.middle_name;
          this.user.inmate_number = this.selectedApplicant.inmate_number;
          this.user.date_of_birth = this.selectedApplicant.date_of_birth;
          this.user.facility_name = this.selectedApplicant.facility_name;
          this.user.facility_id = this.selectedApplicant.facility_id;
          this.user.mailing_address = this.selectedApplicant.mailing_address;
          const updatedUser = this.user;
          // Emit event to update the parent component
          // this.$emit("update-user", updatedUser);

          this.getApplicants(); // Refresh the document details
          this.snackbarText = "Changes saved successfully!";
          this.snackbarColor = "success";
          this.snackbar = true; // Show snackbar notification
        }
      } catch (err) {
        console.error("Error saving changes:", err);
        this.snackbarText = "Error saving changes";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
    toggleIframe(index) {
      // Toggle the iframe visibility for the clicked document
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
    onApplicantSelected() {
      if (this.selectedApplicant && this.selectedApplicant.id) {
        // Populate the form with selected applicant data
        this.getApplicants();
      }
    },
    clearSelection() {
      this.selectedApplicant = {};
      this.items = [];
      this.searchQuery = null;
    },
    async addUser() {
      try {
        // Create a payload with the new applicant data
        const payload = {
          // Applicant information
          ...this.selectedApplicant,
          // No items for a new user
        };

        console.log("Adding new user with payload:", payload);

        const res = await api.post("/add-applicant", payload);
        if (res.status === 200) {
          // Update the local user object with the newly created user
          this.selectedApplicant = res.data;
          this.user = { ...res.data };

          // Refresh the data
          this.getApplicants();
          this.snackbarText = "New applicant added successfully!";
          this.snackbarColor = "success";
          this.snackbar = true;
        }
      } catch (err) {
        console.error("Error adding new user:", err);
        this.snackbarText = "Error adding new applicant";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
    clearApplicant() {
      this.selectedApplicant = {
        first_name: "",
        last_name: "",
        middle_name: "",
        inmate_number: "",
        date_of_birth: null,
        facility_id: null,
        facility_name: "",
        mailing_address: "",
      };
      this.selectedApplicantId = null; // Clear the autocomplete selection
    },
    handleApplicantSelection(id) {
      // Find the selected applicant in the options
      if (id) {
        const selectedOption = this.applicantOptions.find(
          (option) => option.id === id
        );
        if (selectedOption) {
          // Update the selectedApplicant with the selected option
          this.selectedApplicant = { ...selectedOption };
          this.getApplicants();
        }
      }
    },
  },
  mounted() {
    this.getSelectedApplicant();
    this.getFacilities();

    // Reset search state
    this.searchQuery = null;
    this.applicantOptions = [];
  },
};
</script>

<style scoped>
.iframe-container {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}
</style>
