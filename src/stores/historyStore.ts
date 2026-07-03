import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Adjustments, CropData } from '../types/editor'
import { useCropStore } from './cropStore'
import { useAdjustmentsStore } from './adjustmentsStore'

interface Snapshot {
  cropData: CropData | null
  croppedDataUrl: string | null
  adjustments: Adjustments
}

export const useHistoryStore = defineStore('history', () => {
  const past = ref<Snapshot[]>([])
  const future = ref<Snapshot[]>([])

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function snapshot(): Snapshot {
    const cropStore = useCropStore()
    const adjustmentsStore = useAdjustmentsStore()
    return {
      cropData: cropStore.cropData,
      croppedDataUrl: cropStore.croppedDataUrl,
      adjustments: { ...adjustmentsStore.adjustments },
    }
  }

  function restore(snap: Snapshot): void {
    const cropStore = useCropStore()
    const adjustmentsStore = useAdjustmentsStore()
    cropStore.cropData = snap.cropData
    cropStore.croppedDataUrl = snap.croppedDataUrl
    adjustmentsStore.adjustments = { ...snap.adjustments }
  }

  /** Record the current state before a mutation, so it can be undone. */
  function commit(): void {
    past.value.push(snapshot())
    future.value = []
  }

  function undo(): void {
    if (!canUndo.value) return
    future.value.push(snapshot())
    restore(past.value.pop()!)
  }

  function redo(): void {
    if (!canRedo.value) return
    past.value.push(snapshot())
    restore(future.value.pop()!)
  }

  /** Called when a new image is loaded/unloaded — history from the previous image is meaningless. */
  function clear(): void {
    past.value = []
    future.value = []
  }

  return {
    canUndo,
    canRedo,
    commit,
    undo,
    redo,
    clear,
  }
})
