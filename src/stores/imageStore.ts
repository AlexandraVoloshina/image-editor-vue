import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImageStore = defineStore('image', () => {
  /** The original File object — never mutated */
  const originalFile = ref<File | null>(null)
  /** Object URL for the original file */
  const originalUrl = ref<string | null>(null)

  const hasImage = computed(() => originalUrl.value !== null)

  function loadFile(file: File): void {
    if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
    originalFile.value = file
    originalUrl.value = URL.createObjectURL(file)
  }

  function unload(): void {
    if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
    originalFile.value = null
    originalUrl.value = null
  }

  return {
    originalFile,
    originalUrl,
    hasImage,
    loadFile,
    unload,
  }
})
