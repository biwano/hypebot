<template>
  <v-card>
    <v-card-title>{{ bot.name }}</v-card-title>
    
    <v-card-subtitle>{{ bot.pair }}</v-card-subtitle>
    
    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-icon 
          :color="directionColor" 
          class="mr-2"
        >
          {{ directionIcon }}
        </v-icon>
        <span class="text-body-1">
          {{ directionText }}
        </span>
      </div>
      
      <div class="text-caption text-grey">
        Created: {{ formatDate(bot.created_at) }}
      </div>
      
      <div class="text-caption text-grey">
        Updated: {{ formatDate(bot.updated_at) }}
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-btn
        color="error"
        variant="text"
        @click="$emit('delete', bot.id)"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn
        v-if="bot.desired_direction !== 0"
        color="warning"
        variant="text"
        @click="exitBot"
        :loading="exiting"
      >
        <v-icon left>mdi-exit-to-app</v-icon>
        Exit
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Bot } from '../../shared/types'

interface Props {
  bot: Bot
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const exiting = ref(false)

const directionColor = computed(() => {
  if (props.bot.desired_direction > 0) return 'success'
  if (props.bot.desired_direction < 0) return 'error'
  return 'grey'
})

const directionIcon = computed(() => {
  if (props.bot.desired_direction > 0) return 'mdi-trending-up'
  if (props.bot.desired_direction < 0) return 'mdi-trending-down'
  return 'mdi-pause'
})

const directionText = computed(() => {
  if (props.bot.desired_direction > 0) return `Long ${Math.abs(props.bot.desired_direction)}x`
  if (props.bot.desired_direction < 0) return `Short ${Math.abs(props.bot.desired_direction)}x`
  return 'No Position'
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const exitBot = async () => {
  exiting.value = true
  try {
    const response = await fetch(`/api/bots/${props.bot.id}/exit`, {
      method: 'POST'
    })

    const result = await response.json()

    if (result.error) {
      console.error('Error exiting bot:', result.error)
    } else {
      // Update the bot's desired_direction to 0
      props.bot.desired_direction = 0
    }
  } catch (error) {
    console.error('Error exiting bot:', error)
  } finally {
    exiting.value = false
  }
}
</script>
