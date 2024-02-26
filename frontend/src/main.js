
import App from './App.vue'
import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import store from './store';

const app = createApp(App).use(store);

registerPlugins(app)

app.mount('#app')
