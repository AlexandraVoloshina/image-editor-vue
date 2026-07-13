export type FilterName = 'none' | 'grayscale' | 'sepia'

export interface Adjustments {
  brightness: number  // -100 to +100
  contrast: number    // -100 to +100
  saturation: number  // -100 to +100
  filter: FilterName
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export interface ExportOperationManifest {
  type: 'crop' | 'adjustments'
  rectangle?: CropData
  brightness?: number
  contrast?: number
  saturation?: number
  filter?: FilterName
}

export interface ExportManifest {
  version: 1
  sourceImage: string | null
  operations: ExportOperationManifest[]
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  filter: 'none',
}
