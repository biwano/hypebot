<template>
  <div class="d-flex align-center">
    <v-icon 
      :color="directionColor" 
      class="mr-2"
    >
      {{ directionIcon }}
    </v-icon>
    <span class="text-body-1">
      {{ directionText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  desiredDirection: number
}

const props = defineProps<Props>()

const directionColor = computed(() => {
  if (props.desiredDirection > 0) return 'success'
  if (props.desiredDirection < 0) return 'error'
  return 'grey'
})

const directionIcon = computed(() => {
  if (props.desiredDirection > 0) return 'mdi-trending-up'
  if (props.desiredDirection < 0) return 'mdi-trending-down'
  return 'mdi-pause'
})


const directionText = computed(() => {
  const absoluteDirection = (Math.abs(props.desiredDirection) * 5).toFixed(2)

  if (props.desiredDirection > 0) return `Long ${absoluteDirection}x`
  if (props.desiredDirection < 0) return `Short ${absoluteDirection}x`
  return 'No Position'
})
</script>
