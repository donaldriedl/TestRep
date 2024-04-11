import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#284B63',
          secondary: '#3C6E71',
          background: '#F2EFEA',
        },
      },
    },
  },
})
