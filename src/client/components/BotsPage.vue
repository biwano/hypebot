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

    <v-row v-if="botsQuery.isLoading.value">
      <v-col cols="12">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="botsQuery.isError.value">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <h3 class="text-h6 mt-4">Error loading bots</h3>
            <p class="text-body-1">{{ botsQuery.error.value?.message }}</p>
            <v-btn
              color="primary"
              @click="botsQuery.refetch()"
              class="mt-4"
            >
              Retry
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="botsQuery.data.value?.length === 0">
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
        v-for="bot in botsQuery.data.value"
        :key="bot.id"
        cols="12"
        md="6"
        lg="4"
      >
        <BotCard
          :bot="bot"
          @delete="botsQuery.refetch()"
          @update="botsQuery.refetch()"
        />
      </v-col>
    </v-row>

    <!-- Create Bot Dialog -->
    <BotCreateDialog
      v-model="showCreateDialog"
      @create="botsQuery.refetch()"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BotCard from './BotCard.vue'
import BotCreateDialog from './BotCreateDialog.vue'
import USDCBalance from './USDCBalance.vue'
import { useBots } from '../composables/useBots'

const showCreateDialog = ref(false)

// Use TanStack Query hooks
const botsQuery = useBots()

</script>

