<template>
  <div>
    <div class="d-flex align-center mb-2">
      <v-icon color="primary" class="mr-2">mdi-wallet</v-icon>
      <span class="text-h6">
        USDC Balance:
        <span v-if="accountQuery.isLoading.value" class="text-grey">Loading...</span>
        <span v-else-if="accountQuery.isError.value" class="text-error">Error</span>
        <span v-else class="text-primary font-weight-bold">
          ${{ (accountQuery.data.value?.balance?.USDC?.free || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </span>
      </span>
    </div>

    <!-- Current Positions -->
    <CurrentPositions
      :positions="accountQuery.data.value?.positions || null"
      :is-loading="accountQuery.isLoading.value"
      :is-error="accountQuery.isError.value"
      :error-message="accountQuery.error.value?.message"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { ApiResponse } from '../../shared/types/index'
import type { Balances, Position } from 'ccxt'
import CurrentPositions from './CurrentPositions.vue'

// Fetch account data using TanStack Query
const accountQuery = useQuery({
  queryKey: ['account'],
  queryFn: async (): Promise<{ balance: Balances; positions: Position[] }> => {
    const response = await fetch('/api/account')
    const result: ApiResponse<{ balance: Balances; positions: Position[] }> = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    return result.data!
  },
  refetchInterval: 300000, // Auto-refresh every 5 minutes
  retry: 3,
  retryDelay: 1000
})
</script>
