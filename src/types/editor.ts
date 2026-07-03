export interface Adjustments {
  brightness: number  // -100 to +100
  contrast: number    // -100 to +100
  saturation: number  // -100 to +100
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
}
