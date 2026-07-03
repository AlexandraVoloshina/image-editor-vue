<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useImageStore } from '../stores/imageStore'
import { useCropStore } from '../stores/cropStore'
import { useAdjustmentsStore } from '../stores/adjustmentsStore'

const imageStore = useImageStore()
const cropStore = useCropStore()
const adjustmentsStore = useAdjustmentsStore()

const showOriginal = ref(false)
const imageLoaded = ref(false)

const previewSrc = computed(() =>
  cropStore.croppedDataUrl ?? imageStore.originalUrl ?? '',
)

watch(previewSrc, () => {
  imageLoaded.value = false
})
</script>

<template>
  <div class="preview-wrap">
    <!-- Image -->
    <div class="img-stage">
      <v-skeleton-loader
        v-if="!imageLoaded"
        type="image"
        class="preview-skeleton"
      />
      <img
        v-show="imageLoaded"
        :src="showOriginal ? (imageStore.originalUrl ?? '') : previewSrc"
        :style="showOriginal ? undefined : { filter: adjustmentsStore.filterString }"
        alt="Preview"
        class="preview-img"
        @load="imageLoaded = true"
        @error="imageLoaded = true"
      />

      <!-- Original overlay badge -->
      <v-chip
        v-if="showOriginal"
        color="warning"
        size="small"
        class="original-badge"
        prepend-icon="mdi-eye-outline"
      >
        Original
      </v-chip>
    </div>

    <!-- View-original toggle -->
    <div class="preview-toolbar mt-2">
      <v-btn
        :color="showOriginal ? 'warning' : 'default'"
        :variant="showOriginal ? 'flat' : 'tonal'"
        size="small"
        :prepend-icon="showOriginal ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        @mousedown="showOriginal = true"
        @mouseup="showOriginal = false"
        @mouseleave="showOriginal = false"
        @touchstart.prevent="showOriginal = true"
        @touchend.prevent="showOriginal = false"
      >
        Hold to compare
      </v-btn>

      <v-chip
        v-if="cropStore.cropData"
        size="small"
        variant="tonal"
        color="success"
        prepend-icon="mdi-crop"
      >
        Cropped
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.preview-wrap {
  width: 100%;
}
.img-stage {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(56, 59, 77, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
.preview-img {
  max-width: 100%;
  max-height: 520px;
  object-fit: contain;
  display: block;
  transition: filter 0.05s linear;
}
.preview-skeleton {
  width: 100%;
}
.preview-skeleton :deep(.v-skeleton-loader__image) {
  height: 320px;
}
.original-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}
.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
