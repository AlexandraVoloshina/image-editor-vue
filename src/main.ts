import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'liveart',
    themes: {
      liveart: {
        dark: false,
        colors: {
          primary: '#F5A623',
          secondary: '#383B4D',
          success: '#3ECF71',
          surface: '#FFFFFF',
          background: '#FFFFFF',
          'on-surface': '#232630',
        },
      },
    },
  },
})

const pinia = createPinia()

createApp(App).use(pinia).use(vuetify).mount('#app')
