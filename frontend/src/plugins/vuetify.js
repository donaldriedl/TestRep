import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#376787',
          secondary: '#72838d',
          background: '#f5f5f5',
        },
      },
      dark: {
        colors: {
          primary: '#376787',
          secondary: '#52636d',
          background: '#252525',
        },
      },
    },
  },
})
