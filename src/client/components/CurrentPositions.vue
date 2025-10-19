<template>
  <div>
    <!-- Current Positions -->
    <div v-if="!isLoading && !isError && positions && positions.length > 0" class="mt-2">
      <div class="text-caption text-grey mb-1">Current Positions:</div>
      <div v-for="position in positions" :key="position.symbol" class="d-flex align-center mb-1">
        <v-icon
          :color="position.side === 'long' ? 'success' : 'error'"
          size="small"
          class="mr-2"
        >
          {{ position.side === 'long' ? 'mdi-trending-up' : 'mdi-trending-down' }}
        </v-icon>
        <span class="text-body-2">
          {{ position.symbol }}: {{ position.side === 'long' ? 'Long' : 'Short' }} {{ (position.contracts || 0).toFixed(4) }}
          @ ${{ (position.entryPrice || 0).toFixed(2) }}
          <span :class="(position.unrealizedPnl || 0) >= 0 ? 'text-success' : 'text-error'">
            ({{ (position.unrealizedPnl || 0) >= 0 ? '+' : '' }}${{ (position.unrealizedPnl || 0).toFixed(2) }})
          </span>
        </span>
      </div>
    </div>

    <div v-else-if="!isLoading && !isError && (!positions || positions.length === 0)" class="mt-2">
      <div class="text-caption text-grey">No active positions</div>
    </div>

    <div v-if="isError" class="mt-2">
      <div class="text-caption text-error">Error loading positions: {{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Position } from 'ccxt'

interface Props {
  positions: Position[] | null
  isLoading: boolean
  isError: boolean
  errorMessage?: string
}

defineProps<Props>()
</script>
