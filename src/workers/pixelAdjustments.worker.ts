import type { Adjustments, FilterName } from '../types/editor'

export interface AdjustmentsWorkerRequest {
  data: Uint8ClampedArray<ArrayBuffer>
  adjustments: Adjustments
}

export interface AdjustmentsWorkerResponse {
  data: Uint8ClampedArray<ArrayBuffer>
}

function clamp(value: number): number {
  return Math.min(255, Math.max(0, value))
}

function applyBrightness(value: number, factor: number): number {
  return value * factor
}

function applyContrast(value: number, factor: number): number {
  return (value - 127.5) * factor + 127.5
}

/** Mirrors the CSS saturate() matrix so exported pixels match the live preview. */
function applySaturation(r: number, g: number, b: number, factor: number): [number, number, number] {
  return [
    (0.213 + 0.787 * factor) * r + (0.715 - 0.715 * factor) * g + (0.072 - 0.072 * factor) * b,
    (0.213 - 0.213 * factor) * r + (0.715 + 0.285 * factor) * g + (0.072 - 0.072 * factor) * b,
    (0.213 - 0.213 * factor) * r + (0.715 - 0.715 * factor) * g + (0.072 + 0.928 * factor) * b,
  ]
}

function applyFilter(r: number, g: number, b: number, filterName: FilterName): [number, number, number] {
  switch (filterName) {
    case 'grayscale': {
      const average = (r + g + b) / 3
      return [average, average, average]
    }
    case 'sepia': {
      return [
        clamp(r * 0.393 + g * 0.769 + b * 0.189),
        clamp(r * 0.349 + g * 0.686 + b * 0.168),
        clamp(r * 0.272 + g * 0.534 + b * 0.131),
      ]
    }
    default:
      return [r, g, b]
  }
}

// `self` here is the worker's own global scope. Typed as `Worker` (rather than pulling in
// the "webworker" lib, which conflicts with the "DOM" lib already used by the rest of the
// app) since DedicatedWorkerGlobalScope's postMessage/onmessage shape matches Worker's.
const ctx = self as unknown as Worker

ctx.onmessage = (event: MessageEvent<AdjustmentsWorkerRequest>) => {
  const { data, adjustments } = event.data
  const brightnessFactor = 1 + adjustments.brightness / 100
  const contrastFactor = 1 + adjustments.contrast / 100
  const saturationFactor = 1 + adjustments.saturation / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = applyContrast(applyBrightness(data[i], brightnessFactor), contrastFactor)
    let g = applyContrast(applyBrightness(data[i + 1], brightnessFactor), contrastFactor)
    let b = applyContrast(applyBrightness(data[i + 2], brightnessFactor), contrastFactor)
    ;[r, g, b] = applySaturation(r, g, b, saturationFactor)
    ;[r, g, b] = applyFilter(r, g, b, adjustments.filter)

    data[i] = clamp(r)
    data[i + 1] = clamp(g)
    data[i + 2] = clamp(b)
  }

  const response: AdjustmentsWorkerResponse = { data }
  ctx.postMessage(response, [data.buffer])
}
