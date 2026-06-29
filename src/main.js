import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from './api'
import './assets/main.css'

import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)

app.use(router)
app.config.globalProperties.$api = api

AOS.init({
    duration: 1000,
    once: true
})

app.mount('#app')