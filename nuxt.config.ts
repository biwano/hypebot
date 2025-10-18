// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'vuetify-nuxt-module'
  ],
  vuetify: {
    moduleOptions: {
      /* Vuetify module options */
    },
    vuetifyOptions: {
      /* Vuetify options */
    }
  },
  typescript: {
    typeCheck: true,
  },
  sourcemap: {
    server: true,
    client: true
  }
})
