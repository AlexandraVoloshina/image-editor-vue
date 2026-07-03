# Image Editor — Test Assignment

A single-page image editor built with **Vue 3 · Vuetify 3 · Pinia · TypeScript**.

## Quick start

```bash
npm i && npm run dev
```

## Features

| Feature | Notes |
|---|---|
| Upload | Drag-and-drop or file picker. Validates type and size (≤ 50 MB). |
| Crop | Opens a full-screen `vue-advanced-cropper` modal, lazy-loaded on first use; crop is stored as a derived canvas data-URL, not replacing the original. |
| Brightness / Contrast / Saturation | Live sliders (−100 → +100). Applied as CSS `filter` for instant preview; re-applied pixel-by-pixel at export time. |
| Non-destructive | `originalUrl` is an Object URL of the untouched `File`. All derived state lives separately. "Hold to compare" button shows the original. |
| Undo / Redo | Crop and adjustment changes are undoable (buttons + Ctrl/Cmd+Z, Ctrl+Y). History resets on load/unload. |
| Reset | Single button restores all sliders to 0 and removes the crop. |
| Export | Runs brightness/contrast/saturation on the pixel data in a Web Worker (off the main thread), draws onto an offscreen `<canvas>`, downloads as PNG. Failures surface via a snackbar. |
| Loading state | Preview shows a skeleton placeholder until the image finishes loading. |
| Responsive | Sidebar collapses into a stacked panel below the preview on small screens. |

## Architecture

```
src/
  stores/
    imageStore.ts       — original file/URL, load/unload
    cropStore.ts        — crop rectangle + cropped data-URL
    adjustmentsStore.ts — brightness/contrast/saturation + CSS filter string
    historyStore.ts     — undo/redo snapshot stack over crop + adjustments
  workers/
    pixelAdjustments.worker.ts — brightness/contrast/saturation pixel math, off the main thread
  composables/
    useExport.ts     — canvas rendering, worker orchestration, download logic
  components/
    UploadZone.vue    — drag-and-drop upload with validation
    CropModal.vue     — Vuetify dialog wrapping vue-advanced-cropper, lazy-loaded
    AdjustmentSlider.vue — single labelled slider row
    ImagePreview.vue  — live preview with filter applied; compare toggle; loading skeleton
    EditorPanel.vue   — right-sidebar assembling all controls, undo/redo, error snackbar
  types/
    editor.ts         — shared TypeScript interfaces
```

Stores are split by concern rather than one shared store; cross-cutting actions (loading a new
file resets crop + adjustments + history) are orchestrated at the component level
(`UploadZone.vue`, `EditorPanel.vue`) instead of stores depending on each other.

## Design decisions

- **CSS `filter` for preview** — zero-latency; no pixel copy on every slider tick.
- **Pixel-level processing at export** — the canvas `filter` API isn't reliably consistent
  across browsers/color spaces, so export re-applies brightness/contrast/saturation manually via
  `ImageData`, using the same math as the CSS filter spec so the result matches the preview.
- **Web Worker for export** — the pixel loop runs off the main thread so large images don't
  block the UI during download.
- **Crop stored as data-URL** — avoids a second Object URL lifecycle and is safe to pass directly
  as `<img src>`.
- **Lazy-loaded crop dialog** — `vue-advanced-cropper` is only fetched once the user opens the
  crop modal, keeping the initial bundle smaller.
