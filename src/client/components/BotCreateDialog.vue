<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>Create New Bot</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="createBot">
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
          @click="createBot"
          :loading="loading"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Bot, ApiResponse } from '../../shared/types/index'
import { useCreateBot } from '../composables/useBots';

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'create': [bot: Bot]
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
  pair: ''
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

// Watch dialog changes to reset form when opened
watch(dialog, (newVal) => {
  if (newVal) {
    // Reset form when dialog opens
    form.value = { name: '', pair: '' }
    error.value = ''
    // Reset form validation
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  }
})

const createBotMutation = useCreateBot()


const createBot = async () => {
  const newBot = await createBotMutation.mutateAsync({
    ...form.value,
    desired_direction: 0
})
  emit('create', newBot)
  dialog.value = false
}
</script>
