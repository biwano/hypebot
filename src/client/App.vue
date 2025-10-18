<template>
  <v-app>
    <v-app-bar
      color="primary"
      dark
      prominent
    >
      <v-app-bar-title>HypeBot</v-app-bar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <BotsPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import BotsPage from './components/BotsPage.vue'
import { VMain } from 'vuetify/lib/components/index.js'
</script>
