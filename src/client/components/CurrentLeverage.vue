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
import type { ApiResponse } from '../../shared/types/index'
import type { Position, Balances } from 'ccxt'

interface Props {
  botId: string
  pair: string
}

const props = defineProps<Props>()

const position = ref<Position | null>(null)
const loading = ref(false)

const leverageColor = computed(() => {
  if (!position.value || !position.value.contracts || position.value.contracts === 0) return 'grey'
  return position.value.side === 'long' ? 'success' : 'error'
})

const leverageIcon = computed(() => {
  if (!position.value || !position.value.contracts || position.value.contracts === 0) return 'mdi-pause'
  return position.value.side === 'long' ? 'mdi-trending-up' : 'mdi-trending-down'
})

const leverageText = computed(() => {
  if (!position.value || !position.value.contracts || position.value.contracts === 0) {
    return 'No Position'
  }
  
  const side = position.value.side === 'long' ? 'Long' : 'Short'
  const contracts = position.value.contracts.toFixed(4)
  const entryPrice = (position.value.entryPrice || 0).toFixed(2)
  const pnl = (position.value.unrealizedPnl || 0).toFixed(2)
  
  return `${side} ${contracts} @ $${entryPrice} (PnL: $${pnl})`
})

const fetchPosition = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/account')
    const result: ApiResponse<{ balance: Balances; positions: Position[] }> = await response.json()
    
    if (result.error) {
      console.error('Error fetching position:', result.error)
      position.value = null
    } else {
      // Find position for this bot's pair
      const botPosition = result.data?.positions?.find(p => p.symbol === props.pair) || null
      position.value = botPosition
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
