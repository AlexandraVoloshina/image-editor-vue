<script setup lang="ts">
import { ref } from 'vue'
import { useImageStore } from '../stores/imageStore'
import { useCropStore } from '../stores/cropStore'
import { useAdjustmentsStore } from '../stores/adjustmentsStore'
import { useHistoryStore } from '../stores/historyStore'

const imageStore = useImageStore()
const cropStore = useCropStore()
const adjustmentsStore = useAdjustmentsStore()
const historyStore = useHistoryStore()

const isDragging = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function validate(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return `Unsupported format "${file.type}". Use JPEG, PNG, WebP, or GIF.`
  if (file.size > 50 * 1024 * 1024) return 'File exceeds the 50 MB limit.'
  return null
}

function handleFile(file: File) {
  error.value = validate(file)
  if (!error.value) {
    imageStore.loadFile(file)
    cropStore.clearCrop()
    adjustmentsStore.reset()
    historyStore.clear()
  }
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) handleFile(file)
  target.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{ 'upload-zone--dragging': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
    role="button"
    tabindex="0"
    @keydown.enter="fileInput?.click()"
    aria-label="Upload image"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPTED.join(',')"
      class="d-none"
      @change="onInputChange"
    />

    <div class="upload-icon-tile mb-4">
      <v-icon size="40" color="white">mdi-image-plus-outline</v-icon>
    </div>
    <p class="text-h6 font-weight-bold text-secondary mb-1">Drop an image here</p>
    <p class="text-body-2 text-medium-emphasis mb-4">or click to browse</p>
    <v-chip variant="outlined" size="small" color="success">JPEG · PNG · WebP · GIF · max 50 MB</v-chip>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      density="compact"
      @click.stop
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<style scoped>
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  border: 2px dashed rgba(56, 59, 77, 0.25);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  padding: 40px;
  user-select: none;
}
.upload-zone:hover,
.upload-zone--dragging {
  border-color: rgba(62, 207, 113, 0.65);
  background: rgba(62, 207, 113, 0.06);
}
.upload-icon-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 20px;
  background: #383B4D;
}
</style>
