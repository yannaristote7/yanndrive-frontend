import './assets/main.css'


import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'
axios.defaults.baseURL = "http://localhost:8000"
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true


const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')


