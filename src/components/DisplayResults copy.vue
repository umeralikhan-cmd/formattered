<template>
  <v-card class="flex-container fill-height mx-auto">
    <!-- Fixed card title -->
    <v-card-title >
      <v-row>
        <v-col>Results</v-col>
        <v-col class="text-right">
          <v-btn @click="openExportResultsDialog" color="primary" variant="text">
            Export <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <!-- Scrollable card text -->
    <v-card-text class="scrollable-content">
      <v-row no-gutters>
        <v-col>
          <v-select
            v-model="selectedQuestionType"
            :items="questionTypes"
            label="Select Document Type"
            outlined
            @update:modelValue="getResults"
          ></v-select>
        </v-col>
        <v-col>
          <v-autocomplete
            label="Facility Name"
            v-model="selectedFacility"
            :items="facilityOptions"
            item-value="facility_id"
            item-title="facility_name"
            dense
            outlined
            clearable
            @update:model-value="getResults"
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
        </v-col>
        <v-col>
          <v-text-field
            v-model="search"
            label="Search by First and Last Name"
            outlined
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div style="max-height: 80vh; overflow-y: auto">
            <v-data-table
            v-model="selectedIDS"
              :headers="headers"
              :items="items"
              :items-per-page="20"
              show-expand
              item-value="document_id"
              v-model:expanded="expanded"
              :search="search"
               show-select
              :custom-filter="firstAndLastNameFilter"
            >
              <!-- Display First Name -->
              <template v-slot:item.first_name="{ item }">
                <span>{{ item.first_name }}</span>
              </template>

              <!-- Display Last Name -->
              <template v-slot:item.last_name="{ item }">
                <span>{{ item.last_name }}</span>
              </template>

              <!-- Display Middle Name -->
              <template v-slot:item.middle_name="{ item }">
                <span>{{ item.middle_name }}</span>
              </template>

              <!-- Display Facility Name -->
              <template v-slot:item.facility_name="{ item }">
                <span>{{ item.facility_name }}</span>
              </template>

              <!-- Display Inmate Number -->
              <template v-slot:item.inmate_number="{ item }">
                <span>{{ item.inmate_number }}</span>
              </template>

              <template v-slot:item.mark="{ item }">
                {{
                  Array.isArray(item.marks)
                    ? item.marks.find((mark) => mark.variant === "Mandatory")
                        ?.score ?? "N/A"
                    : "N/A"
                }}
              </template>
              <template #item.date_created="{ item }">
                {{ formatToLocal(item.date_created) }}
              </template>
              <template v-slot:item.mailing_address="{ item }">
                <span style="white-space: pre-line; word-break: break-word; max-width: 200px; display: inline-block;">
                  {{ item.mailing_address }}
                </span>
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
                  variant="text"
                  size="small"
                  @click="toggleExpand(internalItem)"
                ></v-btn>
              </template>

              <template v-slot:expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length">
                    <v-sheet rounded="lg" border>
                      <resultsDetails
                        :documentId="item.document_id"
                        :user="item"
                        :marks="item.marks"
                        @documentDeleted="documentDeleted"
                        @documentRegraded="documentRegraded"
                      />
                    </v-sheet>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

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

  <v-dialog v-model="ExportResultsDialog">
    <Exports :applicants="selectedItems" @close="ExportResultsDialog = false" :questionType="selectedQuestionType"
    @documentDeleted="documentDeletedBulk"/>

  </v-dialog>

</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";
import resultsDetails from "./resultsDetails.vue";
import Exports from "./Exports.vue";
export default {
  components: {
    resultsDetails,
    Exports,
  },
  props: {
    refresh: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedFacility: null,
      facilityOptions: [],
      snackbar: false,
      snackbarColor: "success",
      snackbarText: "",
      selectedQuestionType: "All",
      questionTypes: ["All"],
      headers: [
        { title: "First Name", key: "first_name", width: "10%" },
        { title: "Middle Name", key: "middle_name", width: "10%" },
        { title: "Last Name", key: "last_name", width: "10%" },
        { title: "Document", key: "document_name", width: "10%" },
        { title: "Type", key: "type", width: "8%" },
        { title: "Mark", key: "mark", width: "7%" },
        { title: "Date Created", key: "date_created", width: "10%" },
        { title: "Date of Birth", key: "date_of_birth", width: "10%" },
        { title: "Inmate Number", key: "inmate_number", width: "8%" },
        { title: "Facility Name", key: "facility_name", width: "10%" },
        { title: "Mailing Address", key: "mailing_address", width: "7%" },
      ],
      items: [],
      selectedDocumentId: null,
      dialog: false,
      loading: [],
      expandedDocumentId: null,
      expanded: [],
      search: "",
      ExportResultsDialog: false,
      selectedIDS: [],
    };
  },
  watch: {
    refresh(newValue) {
      if (newValue) {
        this.getResults();
      }
    },
  },

  computed: {
    filteredItems() {
      if (!this.search) return this.items;

      return this.items.filter((item) =>
        this.firstAndLastNameFilter(
          null, // Vuetify's 'value' param isn't used here
          this.search,
          { columns: item } // because your filter expects item.columns.first_name
        )
      );
    },
    selectedItems() {
      return this.items.filter((item) =>
        this.selectedIDS.includes(item.document_id)
      );
    },
  },
  mounted() {
    this.getQuestionTypes();
    this.getResults();
    this.getFacilities();
  },
  methods: {
    documentDeletedBulk(item) {
      // item is an array of document_ids to delete
      this.items = this.items.filter((i) => !item.includes(i.document_id));
      this.ExportResultsDialog = false;
      this.snackbarText = `${item.length} document(s) deleted successfully`;
      this.snackbar = true;
    },

    
    async getFacilities() {
      try {
        const res = await api.get("/get-facilities"); // Replace with your actual endpoint

        this.facilityOptions = res.data.map((facility) => ({
          facility_id: facility.facility_id,
          facility_name: facility.facility_name,
          facility_address: facility.location.line1,
        }));
      } catch (err) {
        console.error("Error fetching facilities:", err);
      }
    },
    documentDeleted(item) {
      console.log("Document deleted:", item);
      //remove from items where document_id = item
      this.items = this.items.filter((i) => i.document_id !== item);
      this.selectedDocumentId = null;
      this.snackbarText = "Document deleted successfully";
      this.snackbar = true;
    },
    documentRegraded(item) {
      this.getResults();
    },

    formatToLocal(dateString) {
      if (!dateString) return "";

      const options = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };

      const date = new Date(dateString);
      return new Intl.DateTimeFormat(undefined, options).format(date);
    },
    firstAndLastNameFilter(value, query, item) {
      if (!query) return true;

      const fullName =
        `${item.columns.first_name} ${item.columns.last_name}`.toLowerCase();
      const reversedFullName =
        `${item.columns.last_name} ${item.columns.first_name}`.toLowerCase();
      const lowerQuery = query.toLowerCase();

      return (
        fullName.includes(lowerQuery) || reversedFullName.includes(lowerQuery)
      );
    },


    openExportResultsDialog(){
      this.ExportResultsDialog = true
    },


    async exportResults() {
      const cleanData = JSON.parse(JSON.stringify(this.filteredItems));

      const headers = [
        "First Name",
        "Middle Name",
        "Last Name",
        "Date of Birth",
        "Inmate Number",
        "Facility Name",
        "URL",
        "Mailing Address",
        "Scanned Date",
        "Score",
        "Survey",
      ];

      const rows = cleanData.map((item) => {
        const score =
          item.marks?.find((m) => m.variant === "Mandatory")?.score ?? "N/A";
        const survey =
          item.marks?.find((m) => m.variant === "Survey")?.score ?? "N/A";

        return [
          item.first_name ?? "",
          item.middle_name ?? "",
          item.last_name ?? "",
          item.date_of_birth ?? "",
          item.inmate_number ?? "",
          item.facility_name ?? "",
          `https://drive.google.com/file/d/${item.document_id}/view` ?? "",
          item.mailing_address ?? "",
          item.date_created ?? "",
          score,
          survey,
        ];
      });

      const csv = [
        headers.join(","),
        ...rows.map((r) => r.map((val) => `"${val}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "filtered_results.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    async getQuestionTypes() {
      try {
        const res = await api.post("/get-question-types");
        for (let i = 0; i < res.data.length; i++) {
          this.questionTypes.push(res.data[i]);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async getResults() {
      try {
        const res = await api.post("/get-results", {
          question_type: this.selectedQuestionType,
          facility_id: this.selectedFacility,
        });
        this.items = res.data;
        console.log("Response:", res.data);
      } catch (err) {
        console.error(err);
      }
    },
    onRowClick(item) {
      this.selectedDocumentId = item.document_id;
      this.dialog = true;
      // Handle row click event here
    },
    async onIconClick(item, index) {
      this.loading[index] = true;
      try {
        const res = await api.post("/grade-document", {
          document_id: item.document_id,
        });
        this.loading[index] = false;
        this.getResults();
      } catch (err) {
        console.error(err);
      }
      console.log("Icon clicked for item:", item);
    },
    async openDocument(item, index) {
      this.loading[index] = true;
      try {
        const res = await api.post(
          "/get-document",
          { document_id: item.document_id },
          { responseType: "blob" }
        );

        const fileURL = URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        window.open(fileURL, "_blank"); // <-- open new window
      } catch (err) {
        console.error(err);
      } finally {
        this.loading[index] = false;
      }
      console.log("Open document clicked for item:", item);
    },
  },
};
</script>

<style scoped>
.fixed-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white; /* Ensure the title has a background */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Optional shadow for separation */
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
}

.scrollable-content {
  flex: 1; /* Take the remaining space */
  overflow-y: auto; /* Enable vertical scrolling */
  padding: 16px; /* Optional padding */
}
</style>
