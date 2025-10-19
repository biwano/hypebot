<template>
  <div class="d-flex align-center">
    <v-icon
      :color="leverageColor"
      class="mr-2"
    >
      {{ leverageIcon }}
    </v-icon>
    <span class="text-body-2">
      Current: {{ leverageText }}
    </span>
    <v-btn
      icon
      size="x-small"
      @click="fetchPosition"
      :loading="loading"
      class="ml-1"
    >
      <v-icon size="small">mdi-refresh</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ExchangePosition, ApiResponse } from '../../shared/types'

interface Props {
  botId: string
}

const props = defineProps<Props>()

const position = ref<ExchangePosition | null>(null)
const loading = ref(false)

const leverageColor = computed(() => {
  if (!position.value || position.value.size === 0) return 'grey'
  return position.value.side === 'long' ? 'success' : 'error'
})

const leverageIcon = computed(() => {
  if (!position.value || position.value.size === 0) return 'mdi-pause'
  return position.value.side === 'long' ? 'mdi-trending-up' : 'mdi-trending-down'
})

const leverageText = computed(() => {
  if (!position.value || position.value.size === 0) {
    return 'No Position'
  }
  
  const side = position.value.side === 'long' ? 'Long' : 'Short'
  const size = position.value.size.toFixed(4)
  const entryPrice = position.value.entryPrice.toFixed(2)
  const pnl = position.value.unrealizedPnl.toFixed(2)
  
  return `${side} ${size} @ $${entryPrice} (PnL: $${pnl})`
})

const fetchPosition = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/bots/${props.botId}/position`)
    const result: ApiResponse<ExchangePosition> = await response.json()
    
    if (result.error) {
      console.error('Error fetching position:', result.error)
      position.value = null
    } else {
      position.value = result.data
    }
  } catch (error) {
    console.error('Error fetching position:', error)
    position.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPosition()
})
</script>
