<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useImageStore } from './stores/imageStore'
import UploadZone from './components/UploadZone.vue'
import ImagePreview from './components/ImagePreview.vue'
import EditorPanel from './components/EditorPanel.vue'

const imageStore = useImageStore()
const { smAndDown } = useDisplay()
</script>

<template>
  <v-app>
    <!-- Top bar -->
    <v-app-bar flat border="b" height="56" color="white">
      <template #prepend>
        <v-icon color="success" class="ml-3" size="26">mdi-image-edit-outline</v-icon>
      </template>
      <v-app-bar-title class="font-weight-bold text-secondary" style="font-size: 16px">
        Image Editor (Candidate: Olexandra Voloshina-Burunova)
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <!-- ── Upload state ─────────────────────────────────────────────── -->
      <div v-if="!imageStore.hasImage" class="upload-view">
        <div class="upload-inner">
         <UploadZone />
        </div>
      </div>

      <!-- ── Editor state ─────────────────────────────────────────────── -->
      <div v-else class="editor-view" :class="{ 'editor-view--mobile': smAndDown }">
        <!-- Preview pane -->
        <div class="preview-pane">
          <ImagePreview />
        </div>

        <!-- Sidebar (permanent drawer on desktop, stacked panel on mobile) -->
        <v-navigation-drawer
          v-if="!smAndDown"
          permanent
          location="right"
          :width="300"
          style="top: 56px"
        >
          <div class="pa-4" style="height: 100%">
            <EditorPanel />
          </div>
        </v-navigation-drawer>

        <div v-else class="mobile-panel pa-4">
          <EditorPanel />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Inter', sans-serif; }

.upload-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  padding: 24px;
}
.upload-inner {
  width: 100%;
  max-width: 560px;
}

.editor-view {
  display: flex;
  height: calc(100vh - 56px);
}
.preview-pane {
  flex: 1;
  overflow: auto;
  padding: 24px;
  /* padding-right: calc(300px + 24px); */
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.editor-view--mobile {
  flex-direction: column;
  height: auto;
  min-height: calc(100vh - 56px);
}
.editor-view--mobile .preview-pane {
  padding: 16px;
  padding-right: 16px;
}
.mobile-panel {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
