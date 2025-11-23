<template>
  <v-card>
    <v-card-title>{{ bot.name }}</v-card-title>
    
    <v-card-subtitle>{{ bot.pair }}</v-card-subtitle>
    
    <v-card-text>
      <div class="mb-2">
        <BotDirection :desired-direction="bot.desired_direction" />
      </div>
      
      <div class="mb-2">
        <CurrentDirection :pair="bot.pair" />
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
        color="primary"
        variant="text"
        @click="showEditDialog = true"
      >
        <v-icon left>mdi-pencil</v-icon>
        Edit
      </v-btn>
      
      <v-btn
        color="error"
        variant="text"
        @click="handleDelete()"
      >
        <v-icon left>mdi-delete</v-icon>
        Delete
      </v-btn>
      
      <v-spacer></v-spacer>
      
    </v-card-actions>

    <v-divider></v-divider>

    <v-card-text>
      <BotLogs :bot-id="bot.id" />
    </v-card-text>

    <!-- Edit Dialog -->
    <BotEditDialog
      v-model="showEditDialog"
      :bot="bot"
      @update="handleUpdate"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Bot } from '../../shared/types/index'
import BotEditDialog from './BotEditDialog.vue'
import BotDirection from './BotDirection.vue'
import CurrentDirection from './CurrentDirection.vue'
import { useDeleteBot } from '../composables/useBots'
import BotLogs from './BotLogs.vue'

interface Props {
  bot: Bot
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [id: string]
  update: [bot: Partial<Bot> & { id: string }]
}>()

const showEditDialog = ref(false)


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const deleteBotMutation = useDeleteBot()

const handleUpdate = (updatedBot: Partial<Bot> & { id: string }) => {
  // Update the bot with the new data
  Object.assign(props.bot, updatedBot)
  emit('update', updatedBot)
}

const handleDelete = async () => {
  await deleteBotMutation.mutateAsync(props.bot.id)
  emit('delete', props.bot.id)
}

</script>
