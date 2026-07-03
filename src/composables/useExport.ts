import { useImageStore } from '../stores/imageStore'
import { useCropStore } from '../stores/cropStore'
import { useAdjustmentsStore } from '../stores/adjustmentsStore'
import type { Adjustments } from '../types/editor'
import AdjustmentsWorker from '../workers/pixelAdjustments.worker?worker'
import type { AdjustmentsWorkerRequest, AdjustmentsWorkerResponse } from '../workers/pixelAdjustments.worker'

/**
 * Runs the brightness/contrast/saturation pixel math in a Web Worker instead of on the
 * canvas `filter` API (unreliable across browsers) or the main thread (would jank the UI
 * on large images). The ImageData's underlying buffer is transferred, not copied.
 */
function processInWorker(imageData: ImageData, adjustments: Adjustments): Promise<ImageData> {
  const { width, height } = imageData
  return new Promise((resolve, reject) => {
    const worker = new AdjustmentsWorker()

    worker.onmessage = (event: MessageEvent<AdjustmentsWorkerResponse>) => {
      worker.terminate()
      resolve(new ImageData(event.data.data, width, height))
    }
    worker.onerror = () => {
      worker.terminate()
      reject(new Error('Failed to process image adjustments.'))
    }

    // Spread into a plain object — the store's `adjustments` is a reactive Proxy,
    // which structured clone (used by postMessage) cannot clone.
    const request: AdjustmentsWorkerRequest = { data: imageData.data, adjustments: { ...adjustments } }
    worker.postMessage(request, [imageData.data.buffer])
  })
}

export function useExport() {
  const imageStore = useImageStore()
  const cropStore = useCropStore()
  const adjustmentsStore = useAdjustmentsStore()

  async function exportImage(): Promise<void> {
    const src = cropStore.croppedDataUrl ?? imageStore.originalUrl
    if (!src) throw new Error('No image to export.')

    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not load the image for export.'))
      img.src = src
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Your browser does not support the canvas features needed to export this image.')

    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const processed = await processInWorker(imageData, adjustmentsStore.adjustments)
    ctx.putImageData(processed, 0, 0)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to generate the exported image.'))),
        'image/png',
      )
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFilename(imageStore.originalFile?.name ?? 'image.png')
    a.click()
    URL.revokeObjectURL(url)
  }

  function buildFilename(original: string): string {
    const dot = original.lastIndexOf('.')
    const base = dot > -1 ? original.slice(0, dot) : original
    return `${base}-edited.png`
  }

  return { exportImage }
}
