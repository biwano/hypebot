<template>
  <div class="d-flex align-center">
    <v-icon 
      :color="directionColor" 
      class="mr-2"
      :size="iconSize"
    >
      {{ directionIcon }}
    </v-icon>
    <span :class="textClass">
      {{ label ? `${label}: ` : '' }}{{ directionText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // Direction is a number: positive = long, negative = short, 0 = none
  direction: number
  label?: string
  iconSize?: string
  textClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 'default',
  textClass: 'text-body-1'
})

// Normalize direction to 'long', 'short', or null
const normalizedDirection = computed<'long' | 'short' | null>(() => {
  if (props.direction > 0) return 'long'
  if (props.direction < 0) return 'short'
  return null
})

const directionColor = computed(() => {
  const dir = normalizedDirection.value
  if (dir === 'long') return 'success'
  if (dir === 'short') return 'error'
  return 'grey'
})

const directionIcon = computed(() => {
  const dir = normalizedDirection.value
  if (dir === 'long') return 'mdi-trending-up'
  if (dir === 'short') return 'mdi-trending-down'
  return 'mdi-pause'
})

const directionText = computed(() => {
  const dir = normalizedDirection.value
  if (!dir) return 'No Position'
  
  const side = dir === 'long' ? 'Long' : 'Short'
  
  // If leverage is provided, use it
  const leverageStr = Math.abs(props.direction).toFixed(2) + 'x'
  return `${side} ${leverageStr}`
})
</script>

