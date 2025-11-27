<template>
  <v-container class="fill-height">
    <v-responsive class="align-center fill-height mx-auto">
      <v-card>
        <v-card-title> Applicants </v-card-title>
        <v-card-text>
          <v-row no-gutters>
          
            <v-col>
              <v-text-field
                v-model="search"
                label="Search by First and Last Name"
                outlined
                @input="onSearch"
              ></v-text-field>
            </v-col>
          </v-row>
                 <v-row>
            <v-data-table-server
              :headers="headers"
              :items="items"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :search="search"
              :total-items="totalItems"
              :items-length="totalItems"
              item-value="id"
              v-model="selected"
              return-object
              show-select
              @update:page="onPageChange"
              @update:items-per-page="onItemsPerPageChange"
            >
            
            </v-data-table-server>
          </v-row>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>

</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";
import ApplicationCard from "./ApplicantCard.vue";
import MergeApplicants from "./MergeApplicants.vue";

export default {
  components: {
    ApplicationCard,
    MergeApplicants,
  },
  props: {
    refresh: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogMerge: false,
      questionTypes: ["All"],
      headers: [
        { title: "First Name", key: "first_name" },
        { title: "Last Name", key: "last_name" },
        { title: "Middle Name", key: "middle_name" },
        { title: "Full Name", key: "full_name" },
        { title: "Date of Birth", key: "date_of_birth" },
        { title: "DOC Number", key: "doc_number" },
        { title: "Facility", key: "facility_name" },
        { title: "Mailing Address", key: "mailing_address" },
        { title: "", key: "action" },
      ],
      items: [],
      selectedDocument: null,
      dialog: false,
      loading: [],
      expandedDocumentId: null,
      expanded: [],
      search: "",
      selected: [],
      page: 1,
      itemsPerPage: 20,
      totalItems: 0,
      debounceTimeout: null, // Timeout reference for debounce
    };
  },
  watch: {
    refresh(newValue) {
      if (newValue) {
        this.getApplicants();
      }
    },
  },
  mounted() {
    this.getApplicants();
  },
  methods: {
    mergeSelected() {
      this.dialogMerge = true;
    },

    closeDialog() {
      this.dialog = false;
    },
    onRowClick(item) {
      this.selectedDocument = item; // Example: Set the selected document ID
      this.dialog = true; // Example: Open a dialog
    },
    async getApplicants() {
      try {
        const res = await api.post("/get-new-applicants", {
          page: this.page,
          itemsPerPage: this.itemsPerPage,
          search: this.search,
        });
        this.items = res.data.items;
        this.totalItems = res.data.totalItems;
      } catch (err) {
        console.error(err);
      }
    },
    onSearch() {
      // Custom debounce implementation
      clearTimeout(this.debounceTimeout); // Clear the previous timeout
      this.debounceTimeout = setTimeout(() => {
        this.page = 1; // Reset to the first page when searching
        this.getApplicants();
      }, 500); // Debounce with a delay of 500ms
    },
    onPageChange(newPage) {
      this.page = newPage;
      this.getApplicants();
    },
    onItemsPerPageChange(newItemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.getApplicants();
    },
  },
};
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
}
</style>
