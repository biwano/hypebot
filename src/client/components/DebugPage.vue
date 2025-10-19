<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4">Debug - Hyperliquid Trading Pairs</h1>
            <p class="text-body-1 text-grey">
              View all available trading pairs on Hyperliquid exchange
            </p>
          </div>
          <v-btn
            color="primary"
            @click="fetchPairs"
            :loading="loading"
          >
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          prominent
        >
          <v-row align="center">
            <v-col class="grow">
              <div class="text-h6">Error loading trading pairs</div>
              <div>{{ error }}</div>
            </v-col>
            <v-col class="shrink">
              <v-btn
                color="white"
                variant="text"
                @click="fetchPairs"
              >
                Retry
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Trading Pairs ({{ pairs.length }})</span>
            <v-chip
              :color="pairs.length > 0 ? 'success' : 'grey'"
              label
            >
              {{ pairs.length > 0 ? 'Loaded' : 'No data' }}
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="pairs"
              :items-per-page="50"
              class="elevation-1"
              :search="search"
            >
              <template v-slot:top>
                <v-text-field
                  v-model="search"
                  label="Search pairs..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  single-line
                ></v-text-field>
              </template>

              <template v-slot:item.symbol="{ item }">
                <v-chip
                  :color="item.active ? 'success' : 'grey'"
                  label
                  small
                >
                  {{ item.symbol }}
                </v-chip>
              </template>

              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getTypeColor(item.type)"
                  label
                  small
                >
                  {{ item.type }}
                </v-chip>
              </template>

              <template v-slot:item.active="{ item }">
                <v-icon
                  :color="item.active ? 'success' : 'grey'"
                >
                  {{ item.active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </template>

              <template v-slot:item.fees="{ item }">
                <div>
                  <div>Taker: {{ (item.taker * 100).toFixed(4) }}%</div>
                  <div>Maker: {{ (item.maker * 100).toFixed(4) }}%</div>
                </div>
              </template>

              <template v-slot:item.limits="{ item }">
                <div v-if="item.limits">
                  <div>Min: {{ item.limits.amount?.min || 'N/A' }}</div>
                  <div>Max: {{ item.limits.amount?.max || 'N/A' }}</div>
                </div>
                <span v-else>N/A</span>
              </template>

              <template v-slot:item.contract="{ item }">
                <v-icon
                  :color="item.contract ? 'primary' : 'grey'"
                >
                  {{ item.contract ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>

              <template v-slot:item.linear="{ item }">
                <v-icon
                  :color="item.linear ? 'success' : 'grey'"
                >
                  {{ item.linear ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>

              <template v-slot:item.inverse="{ item }">
                <v-icon
                  :color="item.inverse ? 'warning' : 'grey'"
                >
                  {{ item.inverse ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '../../shared/types/index'

interface TradingPair {
  symbol: string
  base: string
  quote: string
  active: boolean
  type: string
  spot: boolean
  margin: boolean
  future: boolean
  option: boolean
  contract: boolean
  settle?: string
  settleId?: string
  contractSize?: number
  linear: boolean
  inverse: boolean
  taker: number
  maker: number
  limits?: {
    amount?: {
      min?: number
      max?: number
    }
  }
  info: any
}

const loading = ref(false)
const error = ref('')
const pairs = ref<TradingPair[]>([])
const search = ref('')

const headers = [
  { title: 'Symbol', key: 'symbol', sortable: true },
  { title: 'Base', key: 'base', sortable: true },
  { title: 'Quote', key: 'quote', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Active', key: 'active', sortable: true },
  { title: 'Fees', key: 'fees', sortable: false },
  { title: 'Limits', key: 'limits', sortable: false },
  { title: 'Contract', key: 'contract', sortable: true },
  { title: 'Linear', key: 'linear', sortable: true },
  { title: 'Inverse', key: 'inverse', sortable: true }
]

const getTypeColor = (type: string) => {
  switch (type) {
    case 'spot': return 'primary'
    case 'future': return 'success'
    case 'option': return 'warning'
    case 'swap': return 'info'
    default: return 'grey'
  }
}

const fetchPairs = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/debug/pairs')
    const result: ApiResponse<TradingPair[]> = await response.json()
    
    if (result.error) {
      error.value = result.error
      pairs.value = []
    } else {
      pairs.value = result.data || []
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch trading pairs'
    pairs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPairs()
})
</script>
