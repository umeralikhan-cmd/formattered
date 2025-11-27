<template>
  <div class="mail-page">
    <div class="content-wrapper">
    

      <!-- Actions & Filters Section -->
      <div class="actions-filters-section">
        <!-- Actions -->
        <div class="actions-content">
          <div class="actions-left">
                <template v-if="$vuetify.display.mdAndUp">
                  <v-btn
                color="primary"
                    prepend-icon="mdi-folder-search"
                    @click="scanForNewMail"
                    :loading="scanning"
                    :disabled="processingAll"
                class="action-btn"
                  >
                    Scan Folder
                  </v-btn>
                  <v-btn
                color="primary"
                    prepend-icon="mdi-upload"
                    @click="uploadDialog = true"
                    :disabled="processingAll"
                variant="outlined"
                class="action-btn"
                  >
                    Upload
                  </v-btn>
                  <v-btn
                    v-if="showPending && selectedItems.length > 0"
                    color="success"
                    prepend-icon="mdi-play-circle-outline"
                    @click="confirmProcessSelected"
                    :loading="processingAll"
                class="action-btn"
                  >
                    Process Selected ({{ selectedItems.length }})
                  </v-btn>
                  <v-btn
                    v-if="showPending && pendingCount > 0"
                    color="success"
                    prepend-icon="mdi-play-circle"
                    @click="confirmProcessAll"
                    :loading="processingAll"
                class="action-btn"
                  >
                    Process All ({{ pendingCount }})
                  </v-btn>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-refresh"
                    @click="fetchRegularMail"
                    :loading="tableLoading"
                    :disabled="processingAll"
                variant="text"
                class="action-btn refresh-action-btn"
                  >
                    Refresh
                  </v-btn>
                </template>

                <template v-else-if="$vuetify.display.sm">
                  <v-btn
              color="primary"
                    icon="mdi-folder-search"
                    @click="scanForNewMail"
                    :loading="scanning"
                    :disabled="processingAll"
                    size="small"
                    variant="tonal"
                  />
                  <v-btn
              color="primary"
                    icon="mdi-upload"
                    @click="uploadDialog = true"
                    :disabled="processingAll"
                    size="small"
                    variant="tonal"
                  />
                  <v-btn
                    v-if="showPending && selectedItems.length > 0"
                    color="success"
                    @click="confirmProcessSelected"
                    :loading="processingAll"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-play-circle-outline</v-icon>
                    {{ selectedItems.length }}
                  </v-btn>
                  <v-btn
                    v-if="showPending && pendingCount > 0"
                    color="success"
                    @click="confirmProcessAll"
                    :loading="processingAll"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-play-circle</v-icon>
                    All
                  </v-btn>
                  <v-btn
                    color="primary"
                    icon="mdi-refresh"
                    @click="fetchRegularMail"
                    :loading="tableLoading"
                    :disabled="processingAll"
                    size="small"
                    variant="tonal"
                  />
                </template>

                <template v-else>

                  <v-btn
                    color="primary"
                    icon="mdi-refresh"
                    @click="fetchRegularMail"
                    :loading="tableLoading"
                    :disabled="processingAll"
                    size="small"
                  />
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="primary"
                        icon="mdi-dots-vertical"
                        v-bind="props"
                        :disabled="processingAll"
                        size="small"
                      />
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="scanForNewMail" :disabled="scanning || processingAll">
                        <template v-slot:prepend>
                          <v-icon>mdi-folder-search</v-icon>
                        </template>
                        <v-list-item-title>Scan Folder</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="uploadDialog = true" :disabled="processingAll">
                        <template v-slot:prepend>
                          <v-icon>mdi-upload</v-icon>
                        </template>
                        <v-list-item-title>Upload Files</v-list-item-title>
                      </v-list-item>
                      <v-divider v-if="showPending && (selectedItems.length > 0 || pendingCount > 0)" />
                      <v-list-item 
                        v-if="showPending && selectedItems.length > 0"
                        @click="confirmProcessSelected"
                        :disabled="processingAll"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-play-circle-outline</v-icon>
                        </template>
                        <v-list-item-title>Process Selected ({{ selectedItems.length }})</v-list-item-title>
                      </v-list-item>
                      <v-list-item 
                        v-if="showPending && pendingCount > 0"
                        @click="confirmProcessAll"
                        :disabled="processingAll"
                      >
                        <template v-slot:prepend>
                          <v-icon>mdi-play-circle</v-icon>
                        </template>
                        <v-list-item-title>Process All ({{ pendingCount }})</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </div>
          
          <div class="actions-right">
            <v-chip :color="statusColor" size="small" class="stats-chip">
              <v-icon start size="small">mdi-email-multiple</v-icon>
              {{ mailRecords.length }} {{ showPending ? 'Pending' : 'Processed' }}
            </v-chip>
          </div>
        </div>

        <!-- Divider -->
        <v-divider class="section-divider"></v-divider>

        <!-- Filters -->
        <div class="filters-content">
          <div class="filter-group">
              <v-select
                v-model="filterStatus"
                :items="statusOptions"
                label="Filter by Status"
                clearable
                variant="outlined"
                :disabled="showPending"
                density="compact"
                hide-details
                @update:model-value="fetchRegularMail"
              class="filter-select"
              ></v-select>
          </div>
          <div class="filter-group switch-group">
              <v-switch
                v-model="showArchived"
                label="Show Archived"
                color="primary"
                :disabled="showPending"
                density="compact"
                hide-details
                @update:model-value="fetchRegularMail"
              ></v-switch>
          </div>
          <div class="filter-group switch-group">
              <v-switch
                v-model="showPending"
                :label="showPending ? 'Unprocessed' : 'Processed'"
                color="primary"
                density="compact"
                hide-details
                @update:model-value="onTogglePending"
              ></v-switch>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section" v-if="$vuetify.display.smAndUp">
        <div class="table-header">
          <div class="table-stats">
            <v-icon class="stats-icon">mdi-format-list-bulleted</v-icon>
            <span class="stats-text">{{ mailRecords.length }} Total Records</span>
            <v-progress-circular
              v-if="tableLoading"
              indeterminate
              color="primary"
              size="20"
              width="2"
              class="ml-2"
            />
          </div>
        </div>

        <div class="table-content">
          <div class="table-wrapper">
            <v-data-table
              :headers="computedHeaders"
              :items="mailRecords"
              :loading="tableLoading"
              v-model="selectedItems"
              :show-select="showPending"
              return-object
              :items-per-page="25"
              density="comfortable"
              fixed-header
              height="600"
              class="mail-table"
              @click:row="viewDetails"
            >
            <template v-slot:item.full_name="{ item }">
              <span v-if="item.full_name">{{ item.full_name }}</span>
              <span v-else class="text-grey">-</span>
            </template>

            <template v-slot:item.doc_number="{ item }">
              <span v-if="item.doc_number">{{ item.doc_number }}</span>
              <span v-else class="text-grey">-</span>
            </template>

            <template v-slot:item.facility_name="{ item }">
              <span v-if="item.facility_name">{{ item.facility_name }}</span>
              <span v-else class="text-grey">-</span>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <div class="action-buttons">
                <div v-if="item.status === 'Pending' || !item.status">
                  <v-progress-circular
                    v-if="itemLoading[index]"
                    color="success"
                    indeterminate
                    size="20"
                  ></v-progress-circular>
                  <v-tooltip v-else text="Process" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        @click.stop="processFile(item, index)"
                        style="cursor: pointer"
                        color="primary"
                        size="small"
                      >
                        mdi-send
                      </v-icon>
                    </template>
                  </v-tooltip>
                </div>
                <div v-else-if="item.status === 'Failed'" class="d-flex align-center ga-1">
                  <v-tooltip :text="item.failed_reason || 'Processing failed'" location="top">
                    <template v-slot:activator="{ props }">
                      <v-chip v-bind="props" size="x-small" color="error" class="status-chip">
                        Failed ({{ item.retry_count || 0 }})
                      </v-chip>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Retry" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-refresh"
                        size="x-small"
                        variant="text"
                        color="warning"
                        @click.stop="retryProcessing(item, index)"
                        :loading="itemLoading[index]"
                        class="action-btn"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </div>
               

                <v-tooltip text="View Details" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-eye"
                      size="x-small"
                      variant="text"
                      color="info"
                      @click.stop="viewDetails(null, { item })"
                      class="action-btn"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:loading>
              <div class="loader-container">
                <v-progress-circular indeterminate color="primary" size="48" />
                <p class="loader-text">Loading mail records...</p>
              </div>
            </template>
          </v-data-table>
          </div>
        </div>
      </div>

      <!-- Mobile View -->
      <div class="mobile-cards" v-else>
          <div v-if="tableLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <div class="text-caption mt-2">Loading...</div>
          </div>

          <div v-else-if="mailRecords.length === 0" class="text-center py-8 text-body-2 text-grey">
            No {{ showPending ? 'pending' : 'processed' }} mail found
          </div>

          <div v-else>
            <v-card
              v-for="(item, index) in mailRecords"
              :key="item.id"
              class="mb-2"
              variant="outlined"
              @click="viewDetails(null, { item })"
            >
              <v-card-text class="pa-3">
                <v-row dense>
                  <v-col cols="12" v-if="showPending" class="d-flex align-center justify-space-between mb-2">
                    <v-checkbox
                      v-model="selectedItems"
                      :value="item"
                      density="compact"
                      hide-details
                      @click.stop
                    >
                      <template v-slot:label>
                        <span class="text-caption">Select</span>
                      </template>
                    </v-checkbox>
                    <v-chip size="x-small" color="grey">ID: {{ item.id }}</v-chip>
                  </v-col>

                  <v-col cols="12" class="mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">mdi-file-document</v-icon>
                      <div class="text-body-2 font-weight-medium text-truncate">
                        {{ item.original_file_name || item.document_name || 'N/A' }}
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <v-row dense>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Name</div>
                        <div class="text-body-2">{{ item.full_name || '-' }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-caption text-grey">DOC#</div>
                        <div class="text-body-2">{{ item.doc_number || '-' }}</div>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12">
                    <div class="text-caption text-grey">Facility</div>
                    <div class="text-body-2">{{ item.facility_name || '-' }}</div>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <div v-if="item.status === 'Pending' || !item.status">
                          <v-progress-circular
                            v-if="itemLoading[index]"
                            color="success"
                            indeterminate
                            size="20"
                          ></v-progress-circular>
                          <v-chip v-else size="small" color="warning">Pending</v-chip>
                        </div>
                        <div v-else-if="item.status === 'Failed'" class="d-flex align-center ga-1">
                          <v-chip size="small" color="error">
                            Failed ({{ item.retry_count || 0 }})
                          </v-chip>
                        </div>
                        <v-chip v-else size="small" :color="item.status === 'Completed' ? 'success' : 'info'">
                          {{ item.status }}
                        </v-chip>
                      </div>

                      <div class="d-flex ga-1">
                        <v-btn
                          v-if="item.status === 'Pending' || !item.status"
                          icon="mdi-send"
                          size="small"
                          color="success"
                          variant="tonal"
                          @click.stop="processFile(item, index)"
                          :loading="itemLoading[index]"
                        />
                        <v-btn
                          v-if="item.status === 'Failed'"
                          icon="mdi-refresh"
                          size="small"
                          color="warning"
                          variant="tonal"
                          @click.stop="retryProcessing(item, index)"
                          :loading="itemLoading[index]"
                        />
                        <v-btn
                          icon="mdi-eye"
                          size="small"
                          color="info"
                          variant="tonal"
                          @click.stop="viewDetails(null, { item })"
                        />
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" class="mt-1">
                    <div class="text-caption text-grey">
                      <v-icon size="x-small">mdi-clock-outline</v-icon>
                      {{ formatDate(item.date_created) }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div v-if="mailRecords.length > 10" class="text-center mt-2">
              <v-chip size="small">{{ mailRecords.length }} items</v-chip>
            </div>
          </div>
      </div>
    </div>

    <!-- Upload Dialog -->
      <v-dialog 
        v-model="uploadDialog" 
        :max-width="$vuetify.display.xs ? '95%' : $vuetify.display.sm ? '600' : '700'"
        :fullscreen="$vuetify.display.xs"
      >
      <v-card class="modern-dialog">
        <div class="modern-dialog-header">
          <div class="dialog-header-content">
            <v-icon class="dialog-header-icon">mdi-upload</v-icon>
            <span class="dialog-header-title">Upload Regular Mail</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="uploadDialog = false" color="white"></v-btn>
        </div>

          <v-card-text :class="$vuetify.display.xs ? 'pa-2' : ''" class="dialog-content">
            <div
              class="drop-zone"
              :class="{ 'drag-over': isDragging }"
              @drop.prevent="onDrop"
              @dragover.prevent="onDragOver"
              @dragenter.prevent="onDragEnter"
              @dragleave.prevent="onDragLeave"
              @click="triggerFileInput"
            >
              <div class="drop-zone-content">
                <v-icon :size="$vuetify.display.xs ? '60' : '80'" color="grey-lighten-1" class="mb-4">
                  mdi-cloud-upload-outline
                </v-icon>
                <h3 :class="$vuetify.display.xs ? 'text-subtitle-1' : 'text-h6'" class="mb-2">
                  Drag and drop files here
                </h3>
                <p class="text-grey mb-4">or</p>
                <v-btn
                  variant="tonal"
                  color="black"
                  :size="$vuetify.display.xs ? 'default' : 'large'"
                  prepend-icon="mdi-file-document"
                  @click.stop="triggerFileInput"
                >
                  BROWSE FILES
                </v-btn>
                <p :class="$vuetify.display.xs ? 'text-caption' : 'text-caption'" class="text-grey mt-4">
                  Supported formats: Images (JPG, PNG, GIF, WebP) and PDF
                </p>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,application/pdf"
              style="display: none"
              @change="onFileSelect"
            />

            <v-list v-if="uploadFiles.length > 0" class="mt-4">
              <v-list-subheader class="d-flex align-center">
                <v-icon start size="small">mdi-file-multiple</v-icon>
                Selected Files ({{ uploadFiles.length }})
                <v-spacer></v-spacer>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="uploadFiles = []"
                >
                  Clear All
                </v-btn>
              </v-list-subheader>
              <v-divider></v-divider>
              <v-list-item
                v-for="(file, index) in uploadFiles"
                :key="index"
                class="px-2"
              >
                <template v-slot:prepend>
                  <v-icon :color="getFileIcon(file.type).color">
                    {{ getFileIcon(file.type).icon }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ file.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatFileSize(file.size) }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click="removeFile(index)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions :class="$vuetify.display.xs ? 'flex-column-reverse ga-2' : ''" class="dialog-actions">
            <v-btn 
              @click="uploadDialog = false" 
              :disabled="uploading"
              :block="$vuetify.display.xs"
              variant="text"
            >
              Cancel
            </v-btn>
            <v-spacer v-if="!$vuetify.display.xs"></v-spacer>
            <v-btn 
              color="primary" 
              @click="uploadToGoogleDrive" 
              :loading="uploading"
              :disabled="uploadFiles.length === 0"
              :block="$vuetify.display.xs"
              variant="flat"
            >
              Upload
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <!-- Confirm Dialog -->
      <v-dialog 
        v-model="confirmDialog" 
        :max-width="$vuetify.display.xs ? '90%' : '500'"
      >
      <v-card class="modern-dialog">
        <div class="modern-dialog-header" style="background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%) !important;">
          <div class="dialog-header-content">
            <v-icon class="dialog-header-icon">mdi-alert-circle-outline</v-icon>
            <span class="dialog-header-title">Confirm Action</span>
          </div>
        </div>

          <v-card-text class="py-6 dialog-content">
            <p class="text-body-1">{{ confirmMessage }}</p>
            <p v-if="confirmType === 'batch'" class="text-body-2 mt-4 text-grey">
              <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
              This will process documents in parallel for faster completion.
            </p>
          </v-card-text>

          <v-card-actions :class="$vuetify.display.xs ? 'flex-column-reverse ga-2 pa-3' : ''" class="dialog-actions">
            <v-btn
              @click="confirmDialog = false"
              :disabled="processingAll"
              :block="$vuetify.display.xs"
              variant="text"
            >
              Cancel
            </v-btn>
            <v-spacer v-if="!$vuetify.display.xs"></v-spacer>
            <v-btn
              color="success"
              variant="flat"
              @click="handleConfirm"
              :loading="processingAll"
              :block="$vuetify.display.xs"
            >
              Proceed
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


    <!-- Progress Dialog -->
      <v-dialog 
        v-model="progressDialog" 
        :max-width="$vuetify.display.xs ? '95%' : '600'"
        :fullscreen="$vuetify.display.xs"
      >
      <v-card class="modern-dialog">
        <div class="modern-dialog-header">
          <div class="dialog-header-content">
            <v-icon class="dialog-header-icon">mdi-progress-clock</v-icon>
            <span class="dialog-header-title">Processing Documents</span>
          </div>
        </div>

          <v-card-text class="py-6 dialog-content">
            <v-progress-linear
              v-model="batchProgress.progressPercent"
              height="25"
              color="success"
              striped
            >
              <template v-slot:default>
                <strong>{{ Math.round(batchProgress.progressPercent) }}%</strong>
              </template>
            </v-progress-linear>

            <v-row class="mt-4">
              <v-col cols="4">
                <v-card variant="tonal" color="info">
                  <v-card-text class="text-center" :class="$vuetify.display.xs ? 'pa-2' : ''">
                    <div :class="$vuetify.display.xs ? 'text-h6' : 'text-h4'">{{ batchProgress.completed }}</div>
                    <div class="text-caption">Completed</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="tonal" color="success">
                  <v-card-text class="text-center" :class="$vuetify.display.xs ? 'pa-2' : ''">
                    <div :class="$vuetify.display.xs ? 'text-h6' : 'text-h4'">{{ batchProgress.successful }}</div>
                    <div class="text-caption">Successful</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="tonal" color="error">
                  <v-card-text class="text-center" :class="$vuetify.display.xs ? 'pa-2' : ''">
                    <div :class="$vuetify.display.xs ? 'text-h6' : 'text-h4'">{{ batchProgress.failed }}</div>
                    <div class="text-caption">Failed</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card variant="outlined" class="mt-4">
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon start color="primary">mdi-file-document-outline</v-icon>
                  <span class="text-body-2">
                    Processing {{ batchProgress.completed }} of {{ batchProgress.total }} documents
                  </span>
                </div>
                
                <div v-if="batchProgress.estimatedRemainingSeconds" class="d-flex align-center">
                  <v-icon start size="small">mdi-timer-sand</v-icon>
                  <span class="text-caption">
                    Estimated time remaining: {{ formatDuration(batchProgress.estimatedRemainingSeconds) }}
                  </span>
                </div>

                <div class="d-flex align-center mt-1">
                  <v-icon start size="small">mdi-clock-outline</v-icon>
                  <span class="text-caption">
                    Elapsed: {{ formatDuration(batchProgress.elapsedSeconds) }}
                  </span>
                </div>
              </v-card-text>
            </v-card>

            <p v-if="batchProgress.errors && batchProgress.errors.length > 0" class="text-body-2 mt-4 text-warning">
              <v-icon size="small" class="mr-1">mdi-alert</v-icon>
              {{ batchProgress.errors.length }} document(s) failed. Details will be available after completion.
            </p>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="closeProgressDialog"
              :block="$vuetify.display.xs"
              variant="flat"
            >
              <v-icon start>{{ batchProgress.status === 'completed' ? 'mdi-close' : 'mdi-window-minimize' }}</v-icon>
              {{ batchProgress.status === 'completed' ? 'Close' : 'Minimize' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <!-- Details Dialog -->
      <v-dialog 
        v-model="detailsDialog" 
        :max-width="$vuetify.display.xs ? '100%' : $vuetify.display.sm ? '700' : '900'"
        :fullscreen="$vuetify.display.xs"
        scrollable
      >
      <v-card v-if="selectedMail" class="modern-dialog">
        <div class="modern-dialog-header" :class="$vuetify.display.xs ? 'text-subtitle-1 pa-3' : ''">
          <div class="dialog-header-content">
            <v-icon class="dialog-header-icon">mdi-email-open-outline</v-icon>
            <span class="dialog-header-title text-truncate">
              Mail Details{{ $vuetify.display.xs ? '' : ' - ' }}{{ $vuetify.display.xs ? '' : (selectedMail.full_name || 'Unknown') }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false" color="white"></v-btn>
        </div>

          <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-6'" class="dialog-content">
            <!-- Info Cards Grid -->
            <div class="info-cards-grid">
              <v-sheet class="info-card" elevation="0">
                <div class="info-card-header">
                  <v-icon color="primary" size="20">mdi-account</v-icon>
                  <span class="info-card-title">Basic Information</span>
                </div>
                <div class="info-card-content">
                  <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">
                      {{ selectedMail.full_name || 'N/A' }}
                      <span v-if="selectedMail.middle_name" class="text-caption text-grey">
                        ({{ selectedMail.first_name }} {{ selectedMail.middle_name }} {{ selectedMail.last_name }})
                      </span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">DOC Number</span>
                    <span class="info-value">{{ selectedMail.doc_number || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Facility</span>
                    <span class="info-value">{{ selectedMail.facility_name || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">File Name</span>
                    <span class="info-value">{{ selectedMail.original_file_name || selectedMail.document_name || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Source PDF</span>
                    <v-btn 
                      variant="text" 
                      color="primary" 
                      size="small"
                      class="pa-0 info-link-btn"
                      @click="openPdfInNewTab(selectedMail.document_id)"
                    >
                      View Document
                      <v-icon end size="small">mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Status</span>
                    <v-chip size="small" :color="selectedMail.status === 'Completed' ? 'success' : 'info'" class="font-weight-bold">
                        {{ selectedMail.status || 'Pending' }}
                      </v-chip>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date Created</span>
                    <span class="info-value date-text">{{ formatDate(selectedMail.date_created) }}</span>
                  </div>
                </div>
              </v-sheet>

              <v-sheet class="info-card" elevation="0">
                <div class="info-card-header">
                  <v-icon color="purple" size="20">mdi-robot-outline</v-icon>
                  <span class="info-card-title">AI Analysis</span>
                </div>
                <div class="info-card-content">
                  <div class="info-item" v-if="selectedMail.sentiment">
                    <span class="info-label">Sentiment</span>
                      <v-chip 
                        size="small" 
                        :color="getSentimentColor(selectedMail.sentiment)"
                      class="font-weight-bold"
                      >
                        {{ selectedMail.sentiment }}
                      </v-chip>
                  </div>
                  <div class="info-item" v-if="selectedMail.maverick_profile_id">
                    <span class="info-label">Maverick Match</span>
                    <v-chip size="small" color="success" class="font-weight-bold">
                        Matched ({{ selectedMail.match_confidence }}% confidence)
                      </v-chip>
                  </div>
                  <div class="info-item" v-if="selectedMail.key_topics && selectedMail.key_topics.length">
                    <span class="info-label mb-2">Key Topics</span>
                    <div class="topics-wrapper">
                      <v-chip 
                        v-for="(topic, idx) in selectedMail.key_topics" 
                        :key="idx"
                        size="small"
                        color="info"
                        variant="tonal"
                        class="mr-2 mb-2"
                      >
                        {{ topic }}
                      </v-chip>
                    </div>
                  </div>
                  <div v-if="!selectedMail.sentiment && !selectedMail.maverick_profile_id && (!selectedMail.key_topics || selectedMail.key_topics.length === 0)" class="empty-state-text">
                    No AI analysis data available
                  </div>
                </div>
              </v-sheet>
            </div>

            <!-- Summary Card -->
            <v-sheet v-if="selectedMail.summary" class="content-card" elevation="0">
              <div class="content-card-header">
                <v-icon color="indigo" size="20">mdi-note-text</v-icon>
                <span class="content-card-title">Summary</span>
              </div>
              <div class="content-card-body">
                  {{ selectedMail.summary }}
            </div>
            </v-sheet>

            <!-- Letter Content Card -->
            <v-sheet v-if="selectedMail.letter_body" class="content-card" elevation="0">
              <div class="content-card-header">
                <v-icon color="teal" size="20">mdi-email-open-outline</v-icon>
                <span class="content-card-title">Letter Content</span>
              </div>
              <div class="content-card-body letter-content">
                  {{ selectedMail.letter_body }}
            </div>
            </v-sheet>

            <!-- OCR Text Expansion -->
            <v-expansion-panels v-if="selectedMail.extracted_text" class="ocr-panels">
              <v-expansion-panel>
                <v-expansion-panel-title class="ocr-panel-title">
                  <v-icon start color="grey-darken-1">mdi-text-recognition</v-icon>
                  Raw OCR Text
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="ocr-text-content">
                    {{ selectedMail.extracted_text }}
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>

          <v-card-actions :class="$vuetify.display.xs ? 'flex-column ga-2 pa-3' : ''" class="dialog-actions">
            <v-spacer v-if="!$vuetify.display.xs"></v-spacer>
            <v-btn
              v-if="selectedMail.status !== 'Completed'"
              color="success"
              @click="markAsCompleted"
              :block="$vuetify.display.xs"
              prepend-icon="mdi-check-circle"
              class="action-dialog-btn"
            >
              Mark as Completed
            </v-btn>
            <v-btn
              v-if="!selectedMail.archived"
              color="warning"
              @click="archiveMail"
              :block="$vuetify.display.xs"
              prepend-icon="mdi-archive"
              class="action-dialog-btn"
            >
              Archive
            </v-btn>
            <v-btn 
              variant="outlined" 
              @click="detailsDialog = false"
              :block="$vuetify.display.xs"
              class="action-dialog-btn"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

  <!-- Batch Status Button -->
  <v-btn
    v-if="processingAll && currentTaskId"
    color="primary"
    class="batch-status-btn"
    :size="$vuetify.display.xs ? 'default' : 'large'"
    elevation="8"
    @click="openProgressDialog"
  >
    <v-icon :start="$vuetify.display.smAndUp">mdi-cog</v-icon>
    <span v-if="$vuetify.display.smAndUp">
      Processing {{ batchProgress.completed }}/{{ batchProgress.total }}
    </span>
    <span v-else>
      {{ batchProgress.completed }}/{{ batchProgress.total }}
    </span>
    <v-progress-circular
      v-if="batchProgress.status === 'processing'"
      indeterminate
      :size="$vuetify.display.xs ? '16' : '20'"
      width="2"
      class="ml-2"
    ></v-progress-circular>
    <v-icon v-else class="ml-2" :size="$vuetify.display.xs ? 'small' : 'default'">mdi-check-circle</v-icon>
  </v-btn>

  <!-- Mobile FAB -->
  <v-speed-dial
    v-if="$vuetify.display.xs && showPending && pendingCount > 0 && !processingAll"
    location="bottom end"
    transition="slide-y-reverse-transition"
    class="mobile-fab"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        color="success"
        icon="mdi-play-circle"
        size="large"
        elevation="8"
      />
    </template>

    <v-btn
      v-if="selectedItems.length > 0"
      color="success"
      @click="confirmProcessSelected"
      size="small"
    >
      Process {{ selectedItems.length }}
      <v-icon end>mdi-play-circle-outline</v-icon>
    </v-btn>

    <v-btn
      color="success"
      @click="confirmProcessAll"
      size="small"
    >
      Process All {{ pendingCount }}
      <v-icon end>mdi-play-circle</v-icon>
    </v-btn>
  </v-speed-dial>
  </div>
</template>

<script>
import api from "@/plugins/axios";

const MAIN_FOLDER = "Regular Mail Inbox";
const STATUS_PENDING = "Pending";
const STATUS_PROCESSED = "Processed";
const STATUS_COMPLETED = "Completed";
const STATUS_FAILED = "Failed";

export default {
  name: "RegularMail",

  data() {
    return {
      tableLoading: false,
      scanning: false,
      uploading: false,
      processingAll: false,
      isDragging: false,
      itemLoading: {},

      mailRecords: [],
      selectedItems: [],
      selectedMail: null,
      uploadFiles: [],
      scannedFiles: [],

      filterStatus: null,
      showArchived: false,
      showPending: false,

      detailsDialog: false,
      uploadDialog: false,
      confirmDialog: false,
      progressDialog: false,

      confirmMessage: "",
      confirmType: "",
      confirmAction: null,

      currentTaskId: null,
      statusCheckInterval: null,
      batchProgress: {
        status: "processing",
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        progressPercent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: null,
        errors: []
      },


      mainFolder: MAIN_FOLDER,

      statusOptions: [
        STATUS_PENDING,
        STATUS_PROCESSED,
        STATUS_COMPLETED,
        STATUS_FAILED,
        "Archived"
      ],

      headers: [
        { title: "ID", key: "id", width: "80px", align: "start" },
        { title: "File Name", key: "original_file_name", minWidth: "200px" },
        { title: "Name", key: "full_name", minWidth: "150px" },
        { title: "DOC#", key: "doc_number", width: "130px" },
        { title: "Facility", key: "facility_name", minWidth: "180px" },
        { title: "Status", key: "status", width: "130px", align: "center" },
        { title: "Date", key: "date_created", width: "180px" },
        { title: "Actions", key: "actions", sortable: false, width: "150px", align: "center" }
      ]
    };
  },

  computed: {
    statusColor() {
      return this.mailRecords.length > 0 ? "primary" : "grey";
    },

    pendingCount() {
      return this.mailRecords.filter(item => 
        item.status === STATUS_PENDING || !item.status
      ).length;
    },

    validSelectedItems() {
      return this.selectedItems.filter(item => item.document_id);
    },

    computedHeaders() {
      const isTablet = this.$vuetify.display.sm;
      const isMedium = this.$vuetify.display.md;
      
      if (isTablet) {
        return [
          { title: "ID", key: "id", width: "70px", align: "start" },
          { title: "File Name", key: "original_file_name", minWidth: "180px" },
          { title: "Name", key: "full_name", minWidth: "140px" },
          { title: "DOC#", key: "doc_number", width: "110px" },
          { title: "Actions", key: "actions", sortable: false, width: "130px", align: "center" }
        ];
      } else if (isMedium) {
        return [
          { title: "ID", key: "id", width: "80px", align: "start" },
          { title: "File Name", key: "original_file_name", minWidth: "200px" },
          { title: "Name", key: "full_name", minWidth: "150px" },
          { title: "DOC#", key: "doc_number", width: "120px" },
          { title: "Status", key: "status", width: "120px", align: "center" },
          { title: "Date", key: "date_created", width: "170px" },
          { title: "Actions", key: "actions", sortable: false, width: "140px", align: "center" }
        ];
      } else {
        return this.headers;
      }
    }
  },

  mounted() {
    this.fetchRegularMail();
  },

  beforeUnmount() {
    this.stopStatusPolling();
  },

  methods: {
    confirmProcessSelected() {
      if (this.selectedItems.length === 0) {
        return;
      }

      this.confirmMessage = `Process ${this.selectedItems.length} selected file(s)?`;
      this.confirmType = "batch";
      this.confirmAction = this.processSelected;
      this.confirmDialog = true;
    },

    getPdfUrl(documentId) {
      if (!documentId) return null;
      return `https://drive.google.com/file/d/${documentId}/view`;
    },

    openPdfInNewTab(documentId) {
      const url = this.getPdfUrl(documentId);
      if (url) {
        window.open(url, '_blank');
      }
    },

    confirmProcessAll() {
      this.confirmMessage = `Process all ${this.pendingCount} pending files?`;
      this.confirmType = "batch";
      this.confirmAction = this.processAll;
      this.confirmDialog = true;
    },

    handleConfirm() {
      if (this.confirmAction) {
        this.confirmDialog = false;
        this.confirmAction();
        this.confirmAction = null;
      }
    },

    async fetchRegularMail() {
      this.tableLoading = true;
      try {
        const [unprocessedResponse, processedResponse] = await Promise.all([
          api.post("/get-google-documents", { status: "unprocessed" }),
          api.get("/regular-mail", { 
            params: {
              archived: this.showArchived,
              ...(this.filterStatus && { status: this.filterStatus })
            }
          })
        ]);
        
        const unprocessedFiles = this.mapUnprocessedFiles(unprocessedResponse.data || []);
        
        const mappedScannedFiles = this.mapUnprocessedFiles(this.scannedFiles.map(file => ({
          document_id: file.id,
          document_name: file.name,
          type: "unknown",
          status: "scanned",
          date_created: new Date().toISOString()
        })));
        
        const allUnprocessedFiles = [...unprocessedFiles];
        const unprocessedIds = new Set(unprocessedFiles.map(f => f.document_id));
        mappedScannedFiles.forEach(file => {
          if (!unprocessedIds.has(file.document_id)) {
            allUnprocessedFiles.push(file);
          }
        });
        
        const processedFiles = processedResponse.data || [];
        
        this.mailRecords = this.showPending 
          ? this.filterAndSortFiles(allUnprocessedFiles, processedFiles, true)
          : this.filterAndSortFiles(allUnprocessedFiles, processedFiles, false);
        
      } catch (error) {
        console.error("Error fetching regular mail:", error);
      } finally {
        this.tableLoading = false;
      }
    },

    mapUnprocessedFiles(files) {
      return files
        .filter(file => file.type === this.mainFolder || file.type === "unknown")
        .map(file => ({
          ...file,
          status: STATUS_PENDING,
          original_file_name: file.document_name || file.name,
          full_name: '',
          doc_number: '',
          facility_name: ''
        }));
    },

    filterAndSortFiles(unprocessedFiles, processedFiles, showPending) {
      if (showPending) {
        const processedIds = new Set(processedFiles.map(f => f.document_id));
        return unprocessedFiles
          .filter(f => !processedIds.has(f.document_id))
          .sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
      }
      return processedFiles.sort((a, b) => 
        new Date(b.date_created) - new Date(a.date_created)
      );
    },

    async processFile(item, index) {
      this.itemLoading[index] = true;

      try {
        const response = await api.post(`/process-regular-mail/${item.document_id}`);
        
        if (response.data.status === "success") {
          item.status = STATUS_PROCESSED;
          await this.fetchRegularMail();
        }
      } catch (error) {
        console.error("Error processing:", error);
        );
        await this.fetchRegularMail();
      } finally {
        this.itemLoading[index] = false;
      }
    },

    async processSelected() {
      const documentIds = this.selectedItems
        .map(item => item.document_id)
        .filter(id => id);
      
      if (documentIds.length === 0) {
        return;
      }

      await this.startBatchProcessing(documentIds);
    },

    async processAll() {
      const pendingFiles = this.mailRecords.filter(item => 
        item.status === STATUS_PENDING || !item.status
      );
      
      const documentIds = pendingFiles.map(f => f.document_id);
      
      if (documentIds.length === 0) {
        return;
      }

      await this.startBatchProcessing(documentIds);
    },

    async startBatchProcessing(documentIds) {
      this.processingAll = true;
      this.progressDialog = false;
      
      this.batchProgress = {
        status: "processing",
        total: documentIds.length,
        completed: 0,
        successful: 0,
        failed: 0,
        progressPercent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: null,
        errors: []
      };
      );

      try {
        const response = await api.post('/process-regular-mail-batch', {
          document_ids: documentIds
        });
        
        this.currentTaskId = response.data.task_id;
        
        if (this.currentTaskId) {
          this.startStatusPolling();
        } else {
          this.handleBatchComplete(response.data);
        }
      } catch (error) {
        console.error("Error starting batch processing:", error);
        );
        this.progressDialog = false;
        this.processingAll = false;
      }
    },

    startStatusPolling() {
      this.statusCheckInterval = setInterval(async () => {
        try {
          await this.checkBatchStatus();
        } catch (error) {
          console.error("Error checking batch status:", error);
        }
      }, 1000);
    },

    async checkBatchStatus() {
      if (!this.currentTaskId) return;

      try {
        const response = await api.get(`/batch-task-status/${this.currentTaskId}`);
        const status = response.data;

        this.batchProgress = {
          status: status.status,
          total: status.total,
          completed: status.completed,
          successful: status.successful,
          failed: status.failed,
          progressPercent: status.progress_percent,
          elapsedSeconds: status.elapsed_seconds,
          estimatedRemainingSeconds: status.estimated_remaining_seconds,
          errors: status.errors || []
        };

        if (status.status === "completed") {
          this.stopStatusPolling();
          await this.handleBatchComplete(status);
        }
      } catch (error) {
        console.error("Error fetching batch status:", error);
      }
    },

    stopStatusPolling() {
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
        this.statusCheckInterval = null;
      }
    },

    async handleBatchComplete(data) {
      const { total, successful, failed } = data;
      this.stopStatusPolling();
      
      this.selectedItems = [];
      await this.fetchRegularMail();
      
      this.progressDialog = false;
      this.processingAll = false;
      this.currentTaskId = null;
    },

    closeProgressDialog() {
      this.progressDialog = false;
    },

    openProgressDialog() {
      this.progressDialog = true;
    },

    buildBatchResultMessage(total, success, failed) {
      let message = `Processed ${total} files: ${success} successful`;
      if (failed > 0) {
        message += `, ${failed} failed`;
      }
      return message;
    },

    async retryProcessing(item, index) {
      this.itemLoading[index] = true;

      try {
        const response = await api.post(`/process-regular-mail/${item.document_id}`);
        
        if (response.data.status === "success") {
          await this.fetchRegularMail();
        }
      } catch (error) {
        console.error("Error retrying file:", error);
        );
        await this.fetchRegularMail();
      } finally {
        this.itemLoading[index] = false;
      }
    },

    viewDetails(event, { item }) {
      this.selectedMail = item;
      this.detailsDialog = true;
    },

    async markAsCompleted() {
      try {
        await api.patch(`/regular-mail/${this.selectedMail.id}`, {
          status: STATUS_COMPLETED,
          completed_at: new Date().toISOString()
        });
        
        this.selectedMail.status = STATUS_COMPLETED;
        await this.fetchRegularMail();
      } catch (error) {
        console.error("Error marking as completed:", error);
      }
    },

    async archiveMail() {
      try {
        await api.patch(`/regular-mail/${this.selectedMail.id}`, {
          archived: true
        });
        
        this.detailsDialog = false;
        await this.fetchRegularMail();
      } catch (error) {
        console.error("Error archiving:", error);
      }
    },

    onTogglePending(value) {
      if (value) {
        this.filterStatus = null;
        this.showArchived = false;
      }
      this.selectedItems = [];
      this.fetchRegularMail();
    },

    async scanForNewMail() {
      this.scanning = true;

      try{
        const scanResponse = await api.post("/scan-google-drive", null, {
          params: { is_regular_mail: true }
        });
        
        const totalFound = scanResponse.data.total_found || 0;
        const files = scanResponse.data.files || [];
        
        this.scannedFiles = files;

        if (totalFound > 0) {
          try {
            await api.post("/check-google-drive", {
              question_type: this.mainFolder
            });
          } catch (checkError) {
            console.warn("Error creating MarkedSheet entries:", checkError);
          }
        }
        
        const message = totalFound > 0 
          ? `Scanned folder: ${totalFound} file(s) found`
          : "No files found in folder";
        
        await this.fetchRegularMail();
      } catch (error) {
        console.error("Scan error:", error);
        );
      } finally {
        this.scanning = false;
      }
    },

    async uploadToGoogleDrive() {
      if (this.uploadFiles.length === 0) {
        return;
      }

      this.uploading = true;

      try {
        const formData = new FormData();
        formData.append("question_type", this.mainFolder);
        
        this.uploadFiles.forEach(file => formData.append("files", file));
        
        await api.post("/upload-to-google-drive", formData);
        );
        
        this.uploadDialog = false;
        this.uploadFiles = [];
        await this.fetchRegularMail();
      } catch (error) {
        console.error("Upload error:", error);
        );
      } finally {
        this.uploading = false;
      }
    },

    addFiles(files) {
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (validFiles.length !== files.length) {
        console.warn(
          `${files.length - validFiles.length} file(s) skipped (invalid type)`
        );
      }

      this.uploadFiles = [...this.uploadFiles, ...validFiles];
    },

    removeFile(index) {
      this.uploadFiles.splice(index, 1);
    },

    onDragOver(e) {
      e.preventDefault();
      this.isDragging = true;
    },

    onDragEnter(e) {
      e.preventDefault();
      this.isDragging = true;
    },

    onDragLeave(e) {
      e.preventDefault();
      this.isDragging = false;
    },

    onDrop(e) {
      e.preventDefault();
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files);
      this.addFiles(files);
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onFileSelect(e) {
      const files = Array.from(e.target.files);
      this.addFiles(files);
      e.target.value = '';
    },


    getSentimentColor(sentiment) {
      const colors = {
        Positive: 'success',
        Negative: 'error',
        Neutral: 'info',
        Mixed: 'warning'
      };
      return colors[sentiment] || 'grey';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },

    getFileIcon(fileType) {
      if (fileType === 'application/pdf') {
        return { icon: 'mdi-file-pdf-box', color: 'red' };
      }
      if (fileType.startsWith('image/')) {
        return { icon: 'mdi-file-image', color: 'blue' };
      }
      return { icon: 'mdi-file', color: 'grey' };
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
    },

    formatDuration(seconds) {
      if (!seconds || seconds < 0) return '0s';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
      
      return parts.join(' ');
    }
  }
};
</script>

<style scoped>
/* Page Container */
.mail-page {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mail-page :deep(*) {
  scrollbar-width: none;
}

.mail-page :deep(*::-webkit-scrollbar) {
  display: none;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Section */
.header-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.header-section:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
}

.v-theme--dark .header-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .header-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #475569;
}

.header-content {
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: #3B82F6 !important;
  opacity: 0.9;
}

.v-theme--dark .header-icon {
  color: #60A5FA !important;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.v-theme--dark .header-title {
  color: #F9FAFB;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 4px 0 0 0;
}

.v-theme--dark .header-subtitle {
  color: #9CA3AF;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-chip {
  font-weight: 700 !important;
  letter-spacing: 0.02em !important;
  padding: 8px 16px !important;
  height: auto !important;
  font-size: 0.875rem !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.v-theme--dark .stats-chip {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Actions & Filters Combined Section */
.actions-filters-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
}

.actions-filters-section:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
}

.v-theme--dark .actions-filters-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .actions-filters-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #475569;
}

/* Section Divider */
.section-divider {
  margin: 0 !important;
  opacity: 1 !important;
}

.actions-content {
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 42px !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
}

.refresh-action-btn {
  color: #6B7280 !important;
}

.v-theme--dark .refresh-action-btn {
  color: #9CA3AF !important;
}

.filters-content {
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 250px;
}

.switch-group {
  flex: 0 0 auto;
  min-width: 160px;
}

/* Table Section */
.table-section {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.v-theme--dark .table-section {
  background: #1E293B;
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.table-section:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: #C7D2FE;
}

.v-theme--dark .table-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #475569;
}

.table-header {
  padding: 24px 28px;
  border-bottom: 1px solid #E2E8F0;
  background: linear-gradient(to bottom, #FAFBFC, #F8FAFC);
}

.v-theme--dark .table-header {
  border-bottom-color: #334155;
  background: linear-gradient(to bottom, #1A2332, #151E2E);
}

.table-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  color: #6366F1 !important;
  opacity: 0.7;
}

.v-theme--dark .stats-icon {
  color: #818CF8 !important;
  opacity: 0.8;
}

.stats-text {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.v-theme--dark .stats-text {
  color: #F9FAFB;
}

.table-content {
  padding: 28px;
  background: #FAFBFC;
}

.v-theme--dark .table-content {
  background: #151E2E;
}

/* Table Wrapper */
.table-wrapper {
  width: 100%;
  max-width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  z-index: 1;
  contain: layout style;
}

.v-theme--dark .table-wrapper {
  background: #1E293B;
  border-color: #334155;
}

/* The data-table wrapper - handles scrolling */
.table-wrapper :deep(.v-data-table__wrapper) {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
  touch-action: pan-y pan-x;
  will-change: scroll-position;
  position: relative;
  z-index: 1;
}

/* Scrollbar styling for webkit browsers */
.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: #1E293B;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: #475569;
}

.v-theme--dark .table-wrapper :deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: #64748B;
}

/* Fixed header - Vuetify handles this with fixed-header prop */
.table-wrapper :deep(thead th) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

.table-wrapper :deep(.v-table) {
  width: auto;
  min-width: 100%;
  table-layout: auto;
}

.table-wrapper :deep(.v-table tbody) {
  width: auto;
}

.table-wrapper :deep(.v-table th),
.table-wrapper :deep(.v-table td) {
  min-width: 120px;
}

/* Data Table Styling */
:deep(.mail-table) {
  background: transparent !important;
  isolation: isolate;
}

:deep(.mail-table tbody tr) {
  position: relative;
  isolation: isolate;
  cursor: default;
}

:deep(.mail-table__tr--clickable) {
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
  color: #64748B !important;
  background: #F9FAFB !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  white-space: nowrap !important;
  padding: 14px 16px !important;
  vertical-align: middle !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
  line-height: 1.3 !important;
}

:deep(.v-theme--dark .v-data-table__th) {
  color: #94A3B8 !important;
  background: #0F172A !important;
}

:deep(.v-data-table__td) {
  color: #1E293B !important;
  border-bottom: 1px solid #E5E7EB !important;
  font-size: 0.875rem !important;
  white-space: nowrap !important;
  padding: 12px 16px !important;
  vertical-align: middle !important;
  line-height: 1.5 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.v-theme--dark .v-data-table__td) {
  color: #F9FAFB !important;
  border-bottom-color: #334155 !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}

:deep(.v-theme--dark .v-data-table__tr:hover) {
  background: rgba(99, 102, 241, 0.08) !important;
}

/* Date Text */
.date-text {
  font-size: 0.8125rem;
  color: #6B7280;
  font-weight: 400;
  white-space: nowrap;
}

.v-theme--dark .date-text {
  color: #9CA3AF;
}

/* Status Chips */
.status-chip {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.02em !important;
  text-transform: uppercase !important;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  box-shadow: none !important;
  transition: all 0.2s ease;
  cursor: pointer !important;
}

/* Pagination Footer Styling */
:deep(.v-data-table__footer) {
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 12px 16px;
}

:deep(.v-theme--dark .v-data-table__footer) {
  border-top-color: #334155;
  background: #0F172A;
}

/* Mobile Cards */
.mobile-cards {
  padding: 20px;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  background-color: #F8FAFC;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: #3B82F6;
  background-color: #EEF2FF;
}

.v-theme--dark .drop-zone {
  background-color: #1E293B;
  border-color: #475569;
}

.v-theme--dark .drop-zone:hover {
  border-color: #60A5FA;
  background-color: #1F2937;
}

.drop-zone.drag-over {
  border-color: #3B82F6;
  background-color: #EEF2FF;
  border-style: solid;
  transform: scale(1.02);
}

.v-theme--dark .drop-zone.drag-over {
  border-color: #60A5FA;
  background-color: #1F2937;
}

.drop-zone-content {
  pointer-events: none;
}

/* Modern Dialog */
.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.modern-dialog-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 24px !important;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%) !important;
  color: white !important;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-header-icon {
  color: white !important;
}

.dialog-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.dialog-content {
  padding: 24px !important;
  font-size: 1rem;
  color: #374151;
}

.v-theme--dark .dialog-content {
  color: #D1D5DB;
}

.dialog-actions {
  padding: 20px 24px !important;
  border-top: 1px solid #E2E8F0;
  gap: 12px;
}

.v-theme--dark .dialog-actions {
  border-top-color: #334155;
}

.action-dialog-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-height: 42px !important;
  border-radius: 10px !important;
}

/* Mail Details Dialog Styling */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.2s ease;
}

.info-card:hover {
  border-color: #C7D2FE !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
}

.v-theme--dark .info-card {
  background: #0F172A !important;
  border-color: #334155 !important;
}

.v-theme--dark .info-card:hover {
  border-color: #475569 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(to bottom, #FFFFFF, #FAFBFC);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .info-card-header {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom-color: #334155;
}

.info-card-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.v-theme--dark .info-card-title {
  color: #F9FAFB;
}

.info-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-theme--dark .info-label {
  color: #9CA3AF;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
  word-wrap: break-word;
}

.v-theme--dark .info-value {
  color: #F3F4F6;
}

.info-link-btn {
  justify-content: flex-start !important;
  font-weight: 600 !important;
}

.topics-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state-text {
  color: #9CA3AF;
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.v-theme--dark .empty-state-text {
  color: #6B7280;
}

/* Content Cards */
.content-card {
  background: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.content-card:hover {
  border-color: #C7D2FE !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
}

.v-theme--dark .content-card {
  background: #0F172A !important;
  border-color: #334155 !important;
}

.v-theme--dark .content-card:hover {
  border-color: #475569 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.content-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: linear-gradient(to bottom, #FFFFFF, #FAFBFC);
  border-bottom: 1px solid #E2E8F0;
}

.v-theme--dark .content-card-header {
  background: linear-gradient(to bottom, #1E293B, #1A2332);
  border-bottom-color: #334155;
}

.content-card-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.v-theme--dark .content-card-title {
  color: #F9FAFB;
}

.content-card-body {
  padding: 20px;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.v-theme--dark .content-card-body {
  color: #D1D5DB;
}

.letter-content {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F3F4F6;
}

.letter-content::-webkit-scrollbar {
  width: 8px;
}

.letter-content::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.letter-content::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.v-theme--dark .letter-content {
  scrollbar-color: #475569 #1E293B;
}

.v-theme--dark .letter-content::-webkit-scrollbar-track {
  background: #1E293B;
}

.v-theme--dark .letter-content::-webkit-scrollbar-thumb {
  background: #475569;
}

/* OCR Panels */
.ocr-panels {
  margin-top: 20px;
}

.ocr-panel-title {
  font-weight: 600 !important;
  font-size: 0.9375rem !important;
}

.ocr-text-content {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #4B5563;
  background: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F3F4F6;
}

.v-theme--dark .ocr-text-content {
  background: #0F172A;
  color: #9CA3AF;
  scrollbar-color: #475569 #1E293B;
}

.ocr-text-content::-webkit-scrollbar {
  width: 8px;
}

.ocr-text-content::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.ocr-text-content::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.v-theme--dark .ocr-text-content::-webkit-scrollbar-track {
  background: #1E293B;
}

.v-theme--dark .ocr-text-content::-webkit-scrollbar-thumb {
  background: #475569;
}

/* Floating Buttons */
.batch-status-btn {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  animation: pulse 2s ease-in-out infinite;
}

.mobile-fab {
  position: fixed !important;
  bottom: 16px;
  right: 16px;
  z-index: 999;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
  }
}

/* Utility */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .actions-content,
  .filters-content,
  .table-header,
  .table-content {
    padding: 16px;
  }

  .actions-content {
    flex-direction: column;
    align-items: stretch;
  }

  .actions-left {
    width: 100%;
    justify-content: center;
  }

  .actions-right {
    width: 100%;
    justify-content: center;
  }

  .filter-group {
    min-width: 100%;
  }

  .switch-group {
    min-width: 100%;
  }

  .drop-zone {
    padding: 40px 15px;
    min-height: 250px;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .info-card-header,
  .content-card-header {
    padding: 12px 16px;
  }

  .info-card-content,
  .content-card-body {
    padding: 16px;
  }

  .info-card-title,
  .content-card-title {
    font-size: 0.875rem;
  }

  .loader-container {
    padding: 60px 20px;
  }

  .loader-text {
    font-size: 0.875rem;
    margin-top: 12px;
  }
}

/* Loader Container */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  padding: 40px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.v-theme--dark .loader-container {
  background: #1E293B;
  border-color: #334155;
}

.loader-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}

.v-theme--dark .loader-text {
  color: #9CA3AF;
}
</style>

