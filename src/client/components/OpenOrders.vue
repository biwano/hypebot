<template>
  <div>
    <!-- Open Orders -->
    <div v-if="!isLoading && !isError && orders && orders.length > 0" class="mt-2">
      <div class="text-caption text-grey mb-1">Open Orders:</div>
      <div v-for="order in orders" :key="order.id" class="d-flex align-center mb-1">
        <v-icon
          :color="order.side === 'buy' ? 'success' : 'error'"
          size="small"
          class="mr-2"
        >
          {{ order.side === 'buy' ? 'mdi-trending-up' : 'mdi-trending-down' }}
        </v-icon>
        <span class="text-body-2">
          {{ order.symbol }}: {{ order.side === 'buy' ? 'Buy' : 'Sell' }} {{ (order.amount || 0).toFixed(4) }}
          @ ${{ (order.price || 0).toFixed(2) }}
          <span class="text-grey text-caption ml-1">
            ({{ order.status || 'open' }})
          </span>
        </span>
      </div>
    </div>

    <div v-else-if="!isLoading && !isError && (!orders || orders.length === 0)" class="mt-2">
      <div class="text-caption text-grey">No open orders</div>
    </div>

    <div v-if="isError" class="mt-2">
      <div class="text-caption text-error">Error loading orders: {{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  orders: any[] | null
  isLoading: boolean
  isError: boolean
  errorMessage?: string
}

defineProps<Props>()
</script>
