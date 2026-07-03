<script setup lang="ts">
import { ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useImageStore } from '../stores/imageStore'
import { useCropStore } from '../stores/cropStore'
import { useHistoryStore } from '../stores/historyStore'

const imageStore = useImageStore()
const cropStore = useCropStore()
const historyStore = useHistoryStore()

const open = defineModel<boolean>('open', { default: false })

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

function applyCrop() {
  if (!cropperRef.value) return

  const { coordinates, canvas } = cropperRef.value.getResult()
  if (!canvas) return

  historyStore.commit()
  cropStore.applyCrop(
    { x: coordinates.left, y: coordinates.top, width: coordinates.width, height: coordinates.height },
    canvas.toDataURL('image/png'),
  )
  open.value = false
}

function resetCrop() {
  historyStore.commit()
  cropStore.clearCrop()
  open.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="900" persistent>
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon start>mdi-crop</v-icon>
        Crop image
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="open = false" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <div class="crop-wrapper">
          <Cropper
            v-if="open && imageStore.originalUrl"
            ref="cropperRef"
            class="cropper"
            :src="imageStore.originalUrl"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 gap-2">
        <v-btn variant="text" color="error" prepend-icon="mdi-crop-free" @click="resetCrop">
          Remove crop
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-check" @click="applyCrop">
          Apply crop
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crop-wrapper {
  height: 520px;
  overflow: hidden;
}
.cropper {
  height: 100%;
  width: 100%;
}
</style>
