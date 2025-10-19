<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>Edit Bot</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="updateBot">
          <v-text-field
            v-model="form.name"
            :rules="nameRules"
            label="Bot Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="form.pair"
            :rules="pairRules"
            label="Trading Pair (e.g., BTC-USD)"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="form.desired_direction"
            :rules="directionRules"
            label="Desired Direction"
            type="number"
            hint="1 = Long, -1 = Short, 0 = Exit"
          ></v-text-field>

          <v-alert
            v-if="error"
            type="error"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="dialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="updateBot"
          :loading="loading"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Bot, ApiResponse } from '../../shared/types'

interface Props {
  modelValue: boolean
  bot: Bot
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update': [bot: Bot]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const error = ref('')
const formRef = ref()

const form = ref({
  name: '',
  pair: '',
  desired_direction: 0
})

// Validation rules
const nameRules = [
  (value: string) => {
    if (value && value.trim()) return true
    return 'Name is required'
  }
]

const pairRules = [
  (value: string) => {
    if (value && value.trim()) return true
    return 'Trading pair is required'
  }
]

const directionRules = [
  (value: number) => {
    if (value >= -5 || value <= 5) return true
    return 'Direction must be between -5 and 5'
  }
]

// Watch dialog changes to initialize form and handle cleanup
watch(dialog, (newVal) => {
  if (newVal) {
    // Initialize form when dialog opens
    form.value = {
      name: props.bot.name,
      pair: props.bot.pair,
      desired_direction: props.bot.desired_direction
    }
    error.value = ''
    // Reset form validation
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  }
})

const updateBot = async () => {
  // Validate form using Vuetify rules
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`/api/bots/${props.bot.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const result: ApiResponse<Bot> = await response.json()

    if (result.error) {
      error.value = result.error
    } else {
      emit('update', result.data!)
      dialog.value = false
    }
  } catch (err: any) {
    error.value = 'Failed to update bot'
    console.error('Error updating bot:', err)
  } finally {
    loading.value = false
  }
}
</script>
