<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ bot.name }}</span>
      <v-chip
        :color="getDirectionColor(bot.desired_direction)"
        size="small"
      >
        {{ getDirectionText(bot.desired_direction) }}
      </v-chip>
    </v-card-title>
    
    <v-card-text>
      <div class="mb-2">
        <strong>Pair:</strong> {{ bot.pair }}
      </div>
      <div class="mb-2">
        <strong>Direction:</strong> {{ bot.desired_direction }}
      </div>
      <div class="mb-2">
        <strong>Created:</strong> {{ formatDate(bot.created_at) }}
      </div>
      <div v-if="bot.updated_at !== bot.created_at">
        <strong>Updated:</strong> {{ formatDate(bot.updated_at) }}
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-btn
        color="warning"
        variant="text"
        @click="$emit('exit', bot.id)"
        :disabled="bot.desired_direction === 0"
      >
        <v-icon left>mdi-exit-to-app</v-icon>
        Exit
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn
        color="error"
        variant="text"
        @click="$emit('delete', bot.id)"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Bot } from '#shared/types'

interface Props {
  bot: Bot
}

defineProps<Props>()

defineEmits<{
  delete: [botId: string]
  exit: [botId: string]
}>()

const getDirectionColor = (direction: number) => {
  if (direction === 0) return 'grey'
  if (direction > 0) return 'green'
  return 'red'
}

const getDirectionText = (direction: number) => {
  if (direction === 0) return 'Exit'
  if (direction > 0) return `Long ${Math.abs(direction)}x`
  return `Short ${Math.abs(direction)}x`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

