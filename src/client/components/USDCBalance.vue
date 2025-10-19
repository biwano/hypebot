<template>
  <div class="d-flex align-center">
    <v-icon color="primary" class="mr-2">mdi-wallet</v-icon>
    <span class="text-h6">
      USDC Balance:
      <span v-if="loading" class="text-grey">Loading...</span>
      <span v-else class="text-primary font-weight-bold">
        ${{ balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
      </span>
    </span>
    <v-btn
      icon
      size="small"
      @click="fetchBalance"
      :loading="loading"
      class="ml-2"
    >
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ApiResponse } from '../../shared/types'

const balance = ref(0)
const loading = ref(true)

// Fetch account balance
const fetchBalance = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/account')
    const result: ApiResponse<{ usdcBalance: number }> = await response.json()
    
    if (result.error) {
      console.error('Error fetching balance:', result.error)
      balance.value = 0
    } else {
      balance.value = result.data?.usdcBalance || 0
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
    balance.value = 0
  } finally {
    loading.value = false
  }
}

// Auto-refresh balance every 30 seconds
let balanceInterval: NodeJS.Timeout

onMounted(() => {
  fetchBalance()
  balanceInterval = setInterval(() => {
    fetchBalance()
  }, 30000) // 30 seconds
})

onUnmounted(() => {
  if (balanceInterval) {
    clearInterval(balanceInterval)
  }
})
</script>
