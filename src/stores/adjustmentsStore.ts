import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Adjustments, FilterName } from '../types/editor'
import { DEFAULT_ADJUSTMENTS } from '../types/editor'

export const useAdjustmentsStore = defineStore('adjustments', () => {
  const adjustments = ref<Adjustments>({ ...DEFAULT_ADJUSTMENTS })

  const isDirty = computed(() =>
    adjustments.value.brightness !== 0 ||
    adjustments.value.contrast !== 0 ||
    adjustments.value.saturation !== 0 ||
    adjustments.value.filter !== 'none',
  )

  /** CSS filter string applied to the preview */
  const filterString = computed(() => {
    const { brightness, contrast, saturation, filter } = adjustments.value
    const b = 1 + brightness / 100          // 0 → 2
    const c = 1 + contrast / 100            // 0 → 2
    const s = 1 + saturation / 100          // 0 → 2
    const extraFilter = filter === 'grayscale'
      ? ' grayscale(100%)'
      : filter === 'sepia'
        ? ' sepia(100%)'
        : ''

    return `brightness(${b}) contrast(${c}) saturate(${s})${extraFilter}`
  })

  function setAdjustment<K extends keyof Adjustments>(key: K, value: Adjustments[K]): void {
    adjustments.value[key] = value
  }

  function setFilter(filter: FilterName): void {
    adjustments.value.filter = filter
  }

  function reset(): void {
    adjustments.value = { ...DEFAULT_ADJUSTMENTS }
  }

  return {
    adjustments,
    isDirty,
    filterString,
    setAdjustment,
    setFilter,
    reset,
  }
})
