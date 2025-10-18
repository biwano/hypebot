<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4">Trading Bots</h1>
            <div class="d-flex align-center mt-2">
              <v-icon color="primary" class="mr-2">mdi-wallet</v-icon>
              <span class="text-h6">
                USDC Balance: 
                <span v-if="balanceLoading" class="text-grey">Loading...</span>
                <span v-else class="text-primary font-weight-bold">
                  ${{ usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </span>
              <v-btn
                icon
                size="small"
                @click="fetchBalance"
                :loading="balanceLoading"
                class="ml-2"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
          </div>
          <v-btn
            color="primary"
            @click="showCreateDialog = true"
          >
            <v-icon left>mdi-plus</v-icon>
            Create Bot
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

    <v-row v-else-if="bots.length === 0">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey">mdi-robot</v-icon>
            <h3 class="text-h6 mt-4">No bots yet</h3>
            <p class="text-body-1">Create your first trading bot to get started.</p>
            <v-btn
              color="primary"
              @click="showCreateDialog = true"
              class="mt-4"
            >
              Create Bot
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="bot in bots"
        :key="bot.id"
        cols="12"
        md="6"
        lg="4"
      >
        <BotCard
          :bot="bot"
          @delete="deleteBot"
        />
      </v-col>
    </v-row>

    <!-- Create Bot Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create New Bot</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createBot">
            <v-text-field
              v-model="newBot.name"
              label="Bot Name"
              required
              :error-messages="nameErrors"
            ></v-text-field>
            
            <v-text-field
              v-model="newBot.pair"
              label="Trading Pair (e.g., BTC-USD)"
              required
              :error-messages="pairErrors"
            ></v-text-field>
            
            <v-alert
              v-if="createError"
              type="error"
              class="mb-4"
            >
              {{ createError }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="showCreateDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createBot"
            :loading="creating"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Bot, ApiResponse } from '../../shared/types'
import BotCard from './BotCard.vue'

const showCreateDialog = ref(false)
const creating = ref(false)
const createError = ref('')
const loading = ref(true)
const balanceLoading = ref(false)

const newBot = ref({
  name: '',
  pair: ''
})

const nameErrors = ref<string[]>([])
const pairErrors = ref<string[]>([])

const bots = ref<Bot[]>([])
const usdcBalance = ref(0)

// Fetch bots
const fetchBots = async () => {
  try {
    const response = await fetch('/api/bots')
    const result: ApiResponse<Bot[]> = await response.json()
    
    if (result.error) {
      console.error('Error fetching bots:', result.error)
    } else {
      bots.value = result.data || []
    }
  } catch (error) {
    console.error('Error fetching bots:', error)
  } finally {
    loading.value = false
  }
}

// Fetch account balance
const fetchBalance = async () => {
  balanceLoading.value = true
  try {
    const response = await fetch('/api/account')
    const result: ApiResponse<{ usdcBalance: number }> = await response.json()
    
    if (result.error) {
      console.error('Error fetching balance:', result.error)
    } else {
      usdcBalance.value = result.data?.usdcBalance || 0
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
  } finally {
    balanceLoading.value = false
  }
}

const createBot = async () => {
  creating.value = true
  createError.value = ''
  nameErrors.value = []
  pairErrors.value = []

  if (!newBot.value.name.trim()) {
    nameErrors.value = ['Name is required']
    creating.value = false
    return
  }

  if (!newBot.value.pair.trim()) {
    pairErrors.value = ['Trading pair is required']
    creating.value = false
    return
  }

  try {
    const response = await fetch('/api/bots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBot.value)
    })

    const result: ApiResponse<Bot> = await response.json()

    if (result.error) {
      createError.value = result.error
    } else {
      bots.value.unshift(result.data!)
      showCreateDialog.value = false
      newBot.value = { name: '', pair: '' }
    }
  } catch (error) {
    createError.value = 'Failed to create bot'
  } finally {
    creating.value = false
  }
}

const deleteBot = async (botId: string) => {
  if (confirm('Are you sure you want to delete this bot?')) {
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<{ success: boolean }> = await response.json()

      if (result.error) {
        console.error('Error deleting bot:', result.error)
      } else {
        bots.value = bots.value.filter(bot => bot.id !== botId)
      }
    } catch (error) {
      console.error('Error deleting bot:', error)
    }
  }
}

// Auto-refresh balance every 30 seconds
let balanceInterval: NodeJS.Timeout

onMounted(() => {
  fetchBots()
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
