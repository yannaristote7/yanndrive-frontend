<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'
import { formatDate, apiError } from '@/utils/format'
import AdminPagination from '@/components/admin/AdminPagination.vue'

const toast = useToast()
const logs = ref([])
const stats = ref(null)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const status = ref('')
const loading = ref(true)

const fetchLogs = async (p = page.value) => {
    loading.value = true
    try {
        const { data } = await api.get('/api/admin/logs', { params: { page: p, search: search.value || undefined, success: status.value || undefined } })
        logs.value = data.data
        page.value = data.current_page
        lastPage.value = data.last_page
        total.value = data.total
    } catch (e) { toast.error(apiError(e, 'Erreur lors du chargement des logs')) }
    finally { loading.value = false }
}

let searchTimer
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchLogs(1), 300) })
watch(status, () => fetchLogs(1))

onMounted(async () => {
    api.get('/api/admin/logs/stats').then(r => { stats.value = r.data }).catch(() => {})
    await fetchLogs(1)
})
</script>

<template>
<div>
    <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Logs d'activité</h1>
        <p class="text-xs text-[#555]">Traçabilité des actions sur la plateforme</p>
    </div>

    <div v-if="stats" class="grid grid-cols-3 gap-3 mb-6">
        <button @click="status = ''" :class="['text-left bg-[#111118] border rounded-xl p-4 transition-all', status === '' ? 'border-[#FFB400]/40' : 'border-[#1e1e2e]']">
            <div class="text-2xl font-black text-white" style="font-family:'Syne',sans-serif">{{ stats.total_logs }}</div>
            <div class="text-[11px] text-[#555]">Total</div>
        </button>
        <button @click="status = '1'" :class="['text-left bg-[#111118] border rounded-xl p-4 transition-all', status === '1' ? 'border-green-500/50' : 'border-green-500/15']">
            <div class="text-2xl font-black text-green-400" style="font-family:'Syne',sans-serif">{{ stats.success_logs }}</div>
            <div class="text-[11px] text-[#555]">Réussies</div>
        </button>
        <button @click="status = '0'" :class="['text-left bg-[#111118] border rounded-xl p-4 transition-all', status === '0' ? 'border-red-500/50' : 'border-red-500/15']">
            <div class="text-2xl font-black text-red-400" style="font-family:'Syne',sans-serif">{{ stats.failed_logs }}</div>
            <div class="text-[11px] text-[#555]">Échouées</div>
        </button>
    </div>

    <input v-model="search" type="search" placeholder="Rechercher par action, description ou utilisateur…"
        class="w-full mb-4 bg-[#111118] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd] placeholder-[#444]">

    <div v-if="loading && !logs.length" class="text-[#444] text-sm py-6">Chargement...</div>
    <div v-else-if="!logs.length" class="text-[#444] text-sm py-6">Aucun log.</div>

    <div v-else :class="['bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-x-auto transition-opacity', loading && 'opacity-50']">
        <table class="w-full text-[13px]">
            <thead class="border-b border-[#1e1e2e]">
                <tr class="text-left text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">
                    <th class="px-4 py-3">Statut</th>
                    <th class="px-4 py-3">Action</th>
                    <th class="px-4 py-3">Utilisateur</th>
                    <th class="px-4 py-3 hidden md:table-cell">Description</th>
                    <th class="px-4 py-3 hidden lg:table-cell">IP</th>
                    <th class="px-4 py-3">Date</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in logs" :key="log.id" class="border-b border-[#141420] last:border-0 hover:bg-white/[0.01]">
                    <td class="px-4 py-3">
                        <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">{{ log.success ? '✓' : '✗' }}</span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono whitespace-nowrap">{{ log.action }}</span>
                    </td>
                    <td class="px-4 py-3 text-xs text-[#ccc] truncate max-w-[140px]">{{ log.user?.name || 'Système' }}</td>
                    <td class="px-4 py-3 hidden md:table-cell text-xs text-[#666] max-w-[280px] truncate" :title="log.description">{{ log.description || '—' }}</td>
                    <td class="px-4 py-3 hidden lg:table-cell font-mono text-[11px] text-[#555]">{{ log.ip_address || '—' }}</td>
                    <td class="px-4 py-3 text-[11px] text-[#555] whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <AdminPagination :page="page" :last-page="lastPage" :total="total" @change="fetchLogs" />
</div>
</template>
