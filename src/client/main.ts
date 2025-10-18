import "./style.css";

import { createApp } from "vue";
import { createVuetify } from 'vuetify/dist/vuetify.js'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from "./App.vue";

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light'
  },

  icons: {
    defaultSet: 'mdi'
  }
})

const app = createApp(App)
vuetify.install(app)
app.mount("#app");
