<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'
import { formatDate, apiError } from '@/utils/format'

const toast = useToast()
const domains = ref([])
const newDomain = ref('')
const loading = ref(true)
const adding = ref(false)

const fetchDomains = async () => {
    try { domains.value = (await api.get('/api/admin/domains')).data }
    catch (e) { toast.error(apiError(e)) }
    finally { loading.value = false }
}

const add = async () => {
    adding.value = true
    try {
        await api.post('/api/admin/domains', { domain: newDomain.value })
        toast.success(`Domaine ${newDomain.value.trim().toLowerCase()} autorisé`)
        newDomain.value = ''
        await fetchDomains()
    } catch (e) { toast.error(apiError(e)) }
    finally { adding.value = false }
}

const remove = async (d) => {
    if (!confirm(`Retirer ${d.domain} ?\nLes nouvelles inscriptions avec ce domaine seront refusées (les comptes existants ne sont pas touchés).`)) return
    try {
        await api.delete(`/api/admin/domains/${d.id}`)
        toast.success('Domaine retiré')
        await fetchDomains()
    } catch (e) { toast.error(apiError(e)) }
}

onMounted(fetchDomains)
</script>

<template>
<div class="max-w-2xl">
    <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Domaines autorisés</h1>
        <p class="text-xs text-[#555]">Seules les adresses email de ces domaines peuvent créer un compte.</p>
    </div>

    <form @submit.prevent="add" class="flex gap-2 mb-5">
        <div class="flex-1 flex items-center bg-[#111118] border border-[#1e1e2e] focus-within:border-[#FFB400]/50 rounded-lg px-3">
            <span class="text-[#444] text-sm">@</span>
            <input v-model="newDomain" required placeholder="exemple.com"
                class="flex-1 bg-transparent outline-none py-2 px-1 text-sm text-[#ddd] placeholder-[#444]">
        </div>
        <button type="submit" :disabled="adding" class="bg-[#FFB400] hover:bg-[#ffc433] text-black font-semibold text-sm rounded-lg px-4 transition-all disabled:opacity-50">Ajouter</button>
    </form>

    <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
    <div v-else-if="!domains.length" class="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-xs text-red-300">
        Aucun domaine autorisé : plus personne ne peut s'inscrire.
    </div>

    <div v-else class="bg-[#111118] border border-[#1e1e2e] rounded-xl">
        <div v-for="d in domains" :key="d.id" class="flex items-center justify-between px-4 py-3 border-b border-[#141420] last:border-0">
            <div>
                <div class="text-sm text-[#ddd] font-mono">@{{ d.domain }}</div>
                <div class="text-[10px] text-[#444]">Ajouté le {{ formatDate(d.created_at) }}</div>
            </div>
            <button @click="remove(d)" title="Retirer" class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded px-2 py-1 text-xs transition-all">🗑</button>
        </div>
    </div>
</div>
</template>
