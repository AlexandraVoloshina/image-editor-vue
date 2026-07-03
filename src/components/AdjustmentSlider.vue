<script setup lang="ts">
import type { Adjustments } from '../types/editor'

const props = defineProps<{
  label: string
  icon: string
  adjustmentKey: keyof Adjustments
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  start: []
}>()

function onInput(value: number | string) {
  emit('update:modelValue', Number(value))
}
</script>

<template>
  <div class="adjustment-row">
    <div class="adjustment-label">
      <v-icon size="18" class="mr-2 text-medium-emphasis">{{ icon }}</v-icon>
      <span class="text-body-2">{{ label }}</span>
      <v-spacer />
      <span
        class="value-chip"
        :class="modelValue !== 0 ? 'value-chip--active' : ''"
      >{{ modelValue > 0 ? '+' : '' }}{{ modelValue }}</span>
    </div>

    <v-slider
      :model-value="modelValue"
      @update:model-value="onInput"
      @start="emit('start')"
      min="-100"
      max="100"
      step="1"
      color="primary"
      track-color="rgba(56,59,77,0.12)"
      hide-details
      density="compact"
      class="mt-1"
    />
  </div>
</template>

<style scoped>
.adjustment-row {
  margin-bottom: 4px;
}
.adjustment-label {
  display: flex;
  align-items: center;
}
.value-chip {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgba(56, 59, 77, 0.4);
  min-width: 36px;
  text-align: right;
  transition: color 0.15s;
}
.value-chip--active {
  color: #3ECF71;
  font-weight: 600;
}
</style>
