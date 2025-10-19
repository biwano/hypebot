<template>
  <v-app>
    <v-app-bar
      color="primary"
      dark
      prominent
    >
      <v-app-bar-title>HypeBot</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        :to="$route.name === 'debug' ? '/' : '/debug'"
        variant="text"
        color="white"
      >
        <v-icon left>{{ $route.name === 'debug' ? 'mdi-arrow-left' : 'mdi-bug' }}</v-icon>
        {{ $route.name === 'debug' ? 'Back to Bots' : 'Debug' }}
      </v-btn>
    </v-app-bar>

    <v-main class="mt-16">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { VMain } from 'vuetify/lib/components/index.js'
</script>
