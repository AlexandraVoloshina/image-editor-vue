<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useImageStore } from '../stores/imageStore'
import { useCropStore } from '../stores/cropStore'
import { useAdjustmentsStore } from '../stores/adjustmentsStore'
import { useHistoryStore } from '../stores/historyStore'
import { useExport } from '../composables/useExport'
import AdjustmentSlider from './AdjustmentSlider.vue'

type NumericAdjustmentKey = 'brightness' | 'contrast' | 'saturation'

// vue-advanced-cropper is a heavy dependency — only fetch it once the user opens the crop dialog.
const CropModal = defineAsyncComponent(() => import('./CropModal.vue'))

const imageStore = useImageStore()
const cropStore = useCropStore()
const adjustmentsStore = useAdjustmentsStore()
const historyStore = useHistoryStore()
const { exportImage } = useExport()

const cropOpen = ref(false)
const cropModalLoaded = ref(false)
const exporting = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')

const isDirty = computed(() => adjustmentsStore.isDirty || cropStore.cropData !== null)

const sliders: { label: string; icon: string; key: NumericAdjustmentKey }[] = [
  { label: 'Brightness', icon: 'mdi-brightness-6', key: 'brightness' },
  { label: 'Contrast',   icon: 'mdi-contrast-circle', key: 'contrast' },
  { label: 'Saturation', icon: 'mdi-palette-outline', key: 'saturation' },
]

const filterOptions = [
  { title: 'None', value: 'none' },
  { title: 'Grayscale', value: 'grayscale' },
  { title: 'Sepia', value: 'sepia' },
]

function unloadImage() {
  imageStore.unload()
  cropStore.clearCrop()
  adjustmentsStore.reset()
  historyStore.clear()
}

function resetAll() {
  historyStore.commit()
  cropStore.clearCrop()
  adjustmentsStore.reset()
}

function openCrop() {
  cropModalLoaded.value = true
  cropOpen.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey)) return
  if (event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    historyStore.undo()
  } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
    event.preventDefault()
    historyStore.redo()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

async function handleExport() {
  exporting.value = true
  try {
    await exportImage()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Something went wrong while exporting the image.'
    errorSnackbar.value = true
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="editor-panel">
    <!-- File info -->
    <div class="panel-section">
      <div class="d-flex align-center gap-2 mb-3">
        <v-icon color="secondary" size="20">mdi-file-image-outline</v-icon>
        <span class="text-body-2 text-truncate font-weight-medium">
          {{ imageStore.originalFile?.name }}
        </span>
      </div>
      <v-btn
        block
        variant="tonal"
        color="default"
        prepend-icon="mdi-image-plus-outline"
        @click="unloadImage"
      >
        Load another image
      </v-btn>
    </div>

    <v-divider class="my-4" />

    <!-- Crop -->
    <div class="panel-section">
      <p class="overline text-medium-emphasis mb-3">Crop</p>
      <v-btn
        block
        variant="tonal"
        color="primary"
        prepend-icon="mdi-crop"
        @click="openCrop"
      >
        {{ cropStore.cropData ? 'Edit crop' : 'Crop image' }}
      </v-btn>
    </div>

    <v-divider class="my-4" />

    <!-- Adjustments -->
    <div class="panel-section">
      <p class="overline text-medium-emphasis mb-3">Adjustments</p>
      <AdjustmentSlider
        v-for="s in sliders"
        :key="s.key"
        :label="s.label"
        :icon="s.icon"
        :adjustment-key="s.key"
        :model-value="adjustmentsStore.adjustments[s.key]"
        @update:model-value="adjustmentsStore.setAdjustment(s.key, $event)"
        @start="historyStore.commit()"
      />

      <v-select
        class="mt-3"
        label="Filter"
        :model-value="adjustmentsStore.adjustments.filter"
        :items="filterOptions"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="comfortable"
        hide-details
        @update:model-value="historyStore.commit(); adjustmentsStore.setFilter($event)"
      />
    </div>

    <v-divider class="my-4" />

    <!-- Actions -->
    <div class="panel-section d-flex flex-column gap-2">
      <div class="d-flex gap-2">
        <v-btn
          icon="mdi-undo"
          variant="tonal"
          :disabled="!historyStore.canUndo"
          @click="historyStore.undo()"
        />
        <v-btn
          icon="mdi-redo"
          variant="tonal"
          :disabled="!historyStore.canRedo"
          @click="historyStore.redo()"
        />
      </div>

      <v-btn
        block
        variant="tonal"
        color="warning"
        prepend-icon="mdi-restore"
        :disabled="!isDirty"
        @click="resetAll"
      >
        Reset all edits
      </v-btn>

      <v-btn
        block
        variant="flat"
        color="primary"
        prepend-icon="mdi-download-outline"
        :loading="exporting"
        @click="handleExport"
      >
        Download result
      </v-btn>
    </div>
  </div>

  <CropModal v-if="cropModalLoaded" v-model:open="cropOpen" />

  <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
    {{ errorMessage }}
    <template #actions>
      <v-btn variant="text" @click="errorSnackbar = false">Dismiss</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}
.panel-section {
  padding: 0 2px;
}
.overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
