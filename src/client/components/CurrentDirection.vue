<template>
  <DirectionDisplay
    :direction="direction"
    :leverage="leverage"
    label="Current"
    icon-size="small"
    text-class="text-body-2"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { ApiResponse, AccountData } from '../../shared/types/index'
import type { Position } from 'ccxt'
import DirectionDisplay from './DirectionDisplay.vue'

interface Props {
  pair: string
}

const props = defineProps<Props>()

// Fetch account data to get positions
const accountQuery = useQuery({
  queryKey: ['account'],
  queryFn: async (): Promise<AccountData> => {
    const response = await fetch('/api/account')
    const result: ApiResponse<AccountData> = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result.data!
  },
  refetchInterval: 30000, // Refresh every 30 seconds
  retry: 3,
  retryDelay: 1000
})

const currentPosition = computed<Position | null>(() => {
  if (!accountQuery.data.value?.positions) return null
  return accountQuery.data.value.positions.find(p => p.symbol === props.pair) || null
})

const direction = computed<number>(() => {
  if (!currentPosition.value || !currentPosition.value.percentage) {
    return 0
  }
  return (currentPosition.value.percentage / 100) * (currentPosition.value.side === 'long' ? 1 : -1)
})

const leverage = computed<number | undefined>(() => {
  return currentPosition.value?.leverage
})
</script>

