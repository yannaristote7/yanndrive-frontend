<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
    error.value = ''
    loading.value = true
    try {
        const res = await api.post('/api/login', { email: email.value, password: password.value })
        localStorage.setItem('token', res.data.token)
        const userRes = await api.get('/api/user')
        const userData = userRes.data
        localStorage.setItem('user', JSON.stringify(userData))
        if (userData.role?.name === 'admin') router.push('/admin')
        else router.push('/dashboard')
    } catch (e) {
        error.value = e.response?.data?.message || 'Erreur de connexion'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}
</script>

<template>
<div class="min-h-screen bg-[#09090f] flex items-center justify-center px-4 py-8"
     style="background-image: radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%)">
    <div class="w-full max-w-sm sm:max-w-md">
        <div class="bg-[#111118] border border-[#222230] rounded-2xl p-6 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

            <div class="flex items-baseline gap-1 mb-8">
                <span class="font-black text-2xl sm:text-3xl tracking-tight" style="font-family:'Syne',sans-serif">
                    <span class="text-[#FFB400]">Y</span>ANN
                </span>
                <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-white mb-7" style="font-family:'Syne',sans-serif">Connexion</h2>

            <div v-if="error" class="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{{ error }}</div>

            <div class="mb-4">
                <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Email professionnel</label>
                <input v-model="email" type="email" placeholder="vous@yamslogistics.com" @keyup.enter="login"
                    class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
            </div>

            <div class="mb-7">
                <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Mot de passe</label>
                <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="login"
                    class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
            </div>

            <button @click="login" :disabled="loading"
                class="w-full bg-[#FFB400] hover:bg-[#ffc933] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg py-3.5 text-sm flex items-center justify-center gap-2 transition-colors"
                style="font-family:'Syne',sans-serif">
                <span v-if="loading" class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                <span v-else>Se connecter</span>
            </button>

            <p class="text-center mt-5 text-sm text-[#555]">
                Pas encore de compte ?
                <router-link to="/register" class="text-[#FFB400] font-medium hover:underline">S'inscrire</router-link>
            </p>
        </div>
    </div>
</div>
</template>