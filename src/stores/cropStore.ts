import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CropData } from '../types/editor'

export const useCropStore = defineStore('crop', () => {
  /** Crop rectangle in original-image pixel coordinates. null = full image. */
  const cropData = ref<CropData | null>(null)
  /** Object URL of the cropped canvas (derived, not stored as source) */
  const croppedDataUrl = ref<string | null>(null)

  function applyCrop(data: CropData, dataUrl: string): void {
    cropData.value = data
    croppedDataUrl.value = dataUrl
  }

  function clearCrop(): void {
    cropData.value = null
    croppedDataUrl.value = null
  }

  return {
    cropData,
    croppedDataUrl,
    applyCrop,
    clearCrop,
  }
})
