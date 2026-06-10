<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const state = ref('loading')
const errorMsg = ref('')
const password = ref('')
const loading = ref(false)

const buildUrl = (pwd = null) => {
    const base = `http://localhost:8000/api/public/share/${route.params.token}`
    const params = new URLSearchParams()
    if (route.query.expires)   params.append('expires', route.query.expires)
    if (route.query.signature) params.append('signature', route.query.signature)
    if (pwd)                   params.append('password', pwd)
    return `${base}?${params.toString()}`
}

const tryAccess = async (pwd = null) => {
    loading.value = true
    try {
        const res = await fetch(buildUrl(pwd))
        if (res.status === 403) {
            const data = await res.json()
            if (data.message === 'Password incorrect') {
                state.value = 'password'
                if (pwd) errorMsg.value = 'Mot de passe incorrect, réessayez.'
            } else if (data.message === 'Link expired') {
                state.value = 'error'
                errorMsg.value = 'Ce lien a expiré.'
            } else {
                state.value = 'error'
                errorMsg.value = data.message || 'Accès refusé.'
            }
            return
        }
        if (res.status === 404) { state.value = 'error'; errorMsg.value = 'Lien invalide ou introuvable.'; return }
        if (!res.ok) { state.value = 'error'; errorMsg.value = 'Une erreur est survenue.'; return }

        state.value = 'downloading'
        const blob = await res.blob()
        const cd = res.headers.get('Content-Disposition')
        let filename = 'document'
        if (cd) { const m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/); if (m) filename = m[1].replace(/['"]/g, '') }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        window.URL.revokeObjectURL(url)
    } catch (e) {
        state.value = 'error'; errorMsg.value = 'Impossible de contacter le serveur.'
    } finally {
        loading.value = false
    }
}

const submitPassword = () => {
    if (!password.value) return
    errorMsg.value = ''
    tryAccess(password.value)
}

onMounted(() => tryAccess())
</script>

<template>
<div class="min-h-screen bg-[#09090f] flex items-center justify-center px-4"
     style="background-image: radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%)">

    <div class="w-full max-w-md">
        <div class="bg-[#111118] border border-[#222230] rounded-2xl p-12 shadow-[0_32px_80px_rgba(0,0,0,0.5)] text-center">

            <!-- LOGO -->
            <div class="flex items-baseline justify-center gap-1 mb-10">
                <span class="font-black text-2xl tracking-tight text-white" style="font-family:'Syne',sans-serif">
                    <span class="text-[#FFB400]">Y</span>AMS
                </span>
                <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
            </div>

            <!-- LOADING -->
            <div v-if="state === 'loading'" class="flex flex-col items-center gap-4">
                <div class="w-12 h-12 border-[3px] border-[#1e1e2e] border-t-[#FFB400] rounded-full animate-spin"></div>
                <p class="text-[#555] text-sm">Vérification du lien...</p>
            </div>

            <!-- PASSWORD -->
            <div v-else-if="state === 'password'" class="flex flex-col items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.2)] flex items-center justify-center text-2xl">🔒</div>
                <h2 class="text-xl font-bold text-white" style="font-family:'Syne',sans-serif">Document protégé</h2>
                <p class="text-[#555] text-sm">Ce document est protégé par un mot de passe.</p>

                <div v-if="errorMsg" class="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-left">
                    {{ errorMsg }}
                </div>

                <div class="w-full text-left">
                    <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Mot de passe</label>
                    <input v-model="password" type="password" placeholder="Entrez le mot de passe" @keyup.enter="submitPassword" autofocus
                        class="w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-4 py-3 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors" />
                </div>

                <button @click="submitPassword" :disabled="loading || !password"
                    class="w-full bg-[#FFB400] hover:bg-[#ffc933] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg py-4 text-sm flex items-center justify-center gap-2 transition-colors"
                    style="font-family:'Syne',sans-serif">
                    <span v-if="loading" class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    <span v-else>Accéder au document</span>
                </button>
            </div>

            <!-- SUCCESS -->
            <div v-else-if="state === 'downloading'" class="flex flex-col items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-2xl font-bold">✓</div>
                <h2 class="text-xl font-bold text-white" style="font-family:'Syne',sans-serif">Téléchargement lancé !</h2>
                <p class="text-[#555] text-sm">Votre document est en cours de téléchargement.</p>
            </div>

            <!-- ERROR -->
            <div v-else-if="state === 'error'" class="flex flex-col items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl font-bold">✕</div>
                <h2 class="text-xl font-bold text-white" style="font-family:'Syne',sans-serif">Accès impossible</h2>
                <p class="text-[#555] text-sm">{{ errorMsg }}</p>
            </div>

            <p class="mt-10 text-xs text-[#333]">Partagé via <strong class="text-[#444]">YANN Drive</strong></p>

        </div>
    </div>
</div>
</template>