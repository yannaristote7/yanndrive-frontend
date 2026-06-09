<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const logs = ref([])
const stats = ref(null)
const loading = ref(true)
const sidebarOpen = ref(false)

const fetchLogs = async () => {
    try {
        const [logsRes, statsRes] = await Promise.all([api.get('/api/admin/logs'), api.get('/api/admin/logs/stats')])
        logs.value = logsRes.data.data || []
        stats.value = statsRes.data
    } catch (e) {
        console.error(e.response?.data)
        toast.error('Erreur lors du chargement des logs')
    } finally { loading.value = false }
}

const logout = async () => {
    await api.post('/api/logout')
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/login')
}

const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }

onMounted(fetchLogs)
</script>

<template>
<div class="min-h-screen bg-[#09090f] text-[#e0e0e0]" style="font-family:'DM Sans',sans-serif; display:flex;">

    <!-- OVERLAY mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>

    <!-- SIDEBAR -->
    <aside :class="[
        'bg-[#111118] border-r border-[#1e1e2e] flex flex-col p-5 fixed h-screen z-40 transition-transform duration-300 w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]">
        <div class="flex items-baseline gap-1 mb-9">
            <span class="font-black text-xl tracking-tight text-white" style="font-family:'Syne',sans-serif">
                <span class="text-[#FFB400]">Y</span>AMS
            </span>
            <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
        </div>
        <nav class="flex-1 space-y-1">
            <a @click="router.push('/dashboard'); sidebarOpen=false"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span>📁</span> Mes fichiers
            </a>
            <a @click="router.push('/admin'); sidebarOpen=false"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span>🛡️</span> Administration
            </a>
            <a class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-[rgba(255,180,0,0.1)] text-[#FFB400]">
                <span>📋</span> Logs d'activité
            </a>
        </nav>
        <div class="flex items-center gap-2.5 p-3 bg-[#0d0d14] rounded-xl border border-[#1e1e2e]">
            <div class="w-8 h-8 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">{{ user?.name?.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-[#ddd] truncate">{{ user?.name }}</div>
                <div class="text-[10px] text-[#FFB400] uppercase tracking-wide">Admin</div>
            </div>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors text-base ml-1">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 min-w-0" style="margin-left:0">
        <!-- TOPBAR MOBILE -->
        <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-[#111118] border-b border-[#1e1e2e] sticky top-0 z-20">
            <button @click="sidebarOpen = true" class="text-[#aaa] hover:text-white text-xl">☰</button>
            <span class="font-black text-lg text-white" style="font-family:'Syne',sans-serif"><span class="text-[#FFB400]">Y</span>AMS</span>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors">↩</button>
        </div>

        <<div class="p-4 sm:p-6 lg:p-10">
            <div class="dash-main">
                <div class="mb-6">
                    <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Logs d'activité</h1>
                    <p class="text-xs text-[#555]">Historique complet de toutes les actions</p>
                </div>

                <!-- STATS -->
                <div v-if="stats" class="grid grid-cols-3 gap-3 mb-7">
                    <div class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 sm:p-5">
                        <div class="text-2xl sm:text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ stats.total_logs }}</div>
                        <div class="text-[11px] text-[#555]">Total</div>
                    </div>
                    <div class="bg-[#111118] border border-green-500/20 rounded-xl p-4 sm:p-5">
                        <div class="text-2xl sm:text-3xl font-black text-green-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.success_logs }}</div>
                        <div class="text-[11px] text-[#555]">Réussies</div>
                    </div>
                    <div class="bg-[#111118] border border-red-500/20 rounded-xl p-4 sm:p-5">
                        <div class="text-2xl sm:text-3xl font-black text-red-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.failed_logs }}</div>
                        <div class="text-[11px] text-[#555]">Échouées</div>
                    </div>
                </div>

                <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
                <div v-else-if="logs.length === 0" class="text-[#444] text-sm py-6">Aucun log trouvé.</div>

                <!-- TABLE desktop -->
                <div v-else class="hidden sm:block overflow-x-auto">
                    <table class="w-full text-[13px]">
                        <thead class="border-b border-[#1e1e2e]">
                            <tr>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Statut</th>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Action</th>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Utilisateur</th>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Description</th>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px] hidden md:table-cell">IP</th>
                                <th class="text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="log in logs" :key="log.id" class="hover:bg-white/[0.01]">
                                <td class="px-4 py-3 border-b border-[#141420] align-middle">
                                    <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">
                                        {{ log.success ? '✓' : '✗' }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 border-b border-[#141420] align-middle">
                                    <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono whitespace-nowrap">{{ log.action }}</span>
                                </td>
                                <td class="px-4 py-3 border-b border-[#141420] align-middle">
                                    <div v-if="log.user" class="flex items-center gap-2">
                                        <div class="w-6 h-6 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{{ log.user?.name?.charAt(0) }}</div>
                                        <span class="text-xs text-[#ccc] truncate max-w-[80px]">{{ log.user?.name }}</span>
                                    </div>
                                    <span v-else class="text-[#333] text-xs">Système</span>
                                </td>
                                <td class="px-4 py-3 border-b border-[#141420] align-middle text-xs text-[#666] max-w-[160px] truncate">{{ log.description || '—' }}</td>
                                <td class="px-4 py-3 border-b border-[#141420] align-middle font-mono text-[11px] text-[#555] hidden md:table-cell">{{ log.ip_address || '—' }}</td>
                                <td class="px-4 py-3 border-b border-[#141420] align-middle text-[11px] text-[#555] whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- CARDS mobile -->
                <div class="sm:hidden space-y-2">
                    <div v-for="log in logs" :key="log.id" class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">
                                {{ log.success ? '✓' : '✗' }}
                            </span>
                            <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono">{{ log.action }}</span>
                            <span class="text-[10px] text-[#555]">{{ formatDate(log.created_at) }}</span>
                        </div>
                        <div class="text-xs text-[#aaa]">{{ log.user?.name || 'Système' }}</div>
                        <div v-if="log.description" class="text-[11px] text-[#555] mt-1">{{ log.description }}</div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
</template>
<style scoped>
@media (min-width: 1024px) {
    .logs-main {
        margin-left: 256px;
    }
}
</style>