import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from './api'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.config.globalProperties.$api = api  // ← accessible via this.$api partout

app.mount('#app')