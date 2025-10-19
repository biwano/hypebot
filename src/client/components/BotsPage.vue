<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4">Trading Bots</h1>
            <div class="mt-2">
              <USDCBalance />
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
          @update="updateBot"
        />
      </v-col>
    </v-row>

    <!-- Create Bot Dialog -->
    <BotCreateDialog
      v-model="showCreateDialog"
      @create="handleCreate"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Bot, ApiResponse } from '../../shared/types'
import BotCard from './BotCard.vue'
import BotCreateDialog from './BotCreateDialog.vue'
import USDCBalance from './USDCBalance.vue'

const showCreateDialog = ref(false)
const loading = ref(true)

const bots = ref<Bot[]>([])

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


const handleCreate = (newBot: Bot) => {
  // Add the new bot to the list
  bots.value.unshift(newBot)
}

const updateBot = (updatedBot: Bot) => {
  // Find and update the bot in the list
  const index = bots.value.findIndex(bot => bot.id === updatedBot.id)
  if (index !== -1) {
    bots.value[index] = updatedBot
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

onMounted(() => {
  fetchBots()
})
</script>
