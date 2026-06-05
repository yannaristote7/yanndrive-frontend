<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
    error.value = ''
    loading.value = true
    try {
        const res = await api.post('/api/register', {
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        })
        localStorage.setItem('token', res.data.token)
        const userRes = await api.get('/api/user')
        localStorage.setItem('user', JSON.stringify(userRes.data))
        router.push('/dashboard')
    } catch (e) {
        const errors = e.response?.data?.errors
        if (errors) {
            error.value = Object.values(errors).flat().join(' — ')
        } else {
            error.value = e.response?.data?.message || "Erreur lors de l'inscription"
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
<div class="min-h-screen bg-[#09090f] flex items-center justify-center px-4 py-10"
     style="background-image: radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%)">

    <div class="w-full max-w-md">
        <div class="bg-[#111118] border border-[#222230] rounded-2xl p-12 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

            <!-- LOGO -->
            <div class="flex items-baseline gap-1 mb-8">
                <span class="font-black text-3xl tracking-tight" style="font-family:'Syne',sans-serif">
                    <span class="text-[#FFB400]">Y</span>AMS
                </span>
                <span class="text-xs text-[#555] ml-1 tracking-[3px] uppercase font-light">Drive</span>
            </div>

            <h2 class="text-2xl font-bold text-white mb-2" style="font-family:'Syne',sans-serif">Créer un compte</h2>
            <p class="text-xs text-[#444] mb-7 leading-relaxed">
                Domaines autorisés : yamslogistics.com, yamsgroup.com, yamscorporate.com
            </p>

            <!-- ERROR -->
            <div v-if="error" class="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {{ error }}
            </div>

            <!-- FIELDS -->
            <div class="space-y-4 mb-7">
                <div>
                    <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Nom complet</label>
                    <input v-model="name" type="text" placeholder="Jean Dupont"
                        class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Email professionnel</label>
                    <input v-model="email" type="email" placeholder="vous@yamslogistics.com"
                        class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Mot de passe</label>
                    <input v-model="password" type="password" placeholder="8 caractères minimum"
                        class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-[#888] uppercase tracking-[1px] mb-2">Confirmer le mot de passe</label>
                    <input v-model="passwordConfirmation" type="password" placeholder="••••••••" @keyup.enter="register"
                        class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
                </div>
            </div>

            <button @click="register" :disabled="loading"
                class="w-full bg-[#FFB400] hover:bg-[#ffc933] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg py-4 text-sm flex items-center justify-center gap-2 transition-colors"
                style="font-family:'Syne',sans-serif">
                <span v-if="loading" class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                <span v-else>Créer le compte</span>
            </button>

            <p class="text-center mt-6 text-sm text-[#555]">
                Déjà un compte ?
                <router-link to="/login" class="text-[#FFB400] font-medium hover:underline">Se connecter</router-link>
            </p>

        </div>
    </div>
</div>
</template>