<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const logs = ref([])
const stats = ref(null)
const loading = ref(true)

const fetchLogs = async () => {
    try {
        const [logsRes, statsRes] = await Promise.all([
            api.get('/api/admin/logs'),
            api.get('/api/admin/logs/stats')
        ])
        logs.value = logsRes.data.data || []
        stats.value = statsRes.data
    } catch (e) {
        console.error('Erreur logs', e.response?.data)
    } finally {
        loading.value = false
    }
}

const logout = async () => {
    await api.post('/api/logout')
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/login')
}

const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }

const thClass = "text-left px-4 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px] whitespace-nowrap"
const tdClass = "px-4 py-3 border-b border-[#141420] align-middle"

onMounted(fetchLogs)
</script>

<template>
<div class="min-h-screen bg-[#09090f] text-[#e0e0e0]" style="display:flex;">

    <!-- SIDEBAR -->
    <aside class="w-60 bg-[#111118] border-r border-[#1e1e2e] flex flex-col p-5 fixed h-screen">
        <div class="flex items-baseline gap-1 mb-9">
            <span class="font-black text-xl tracking-tight text-white" style="font-family:'Syne',sans-serif">
                <span class="text-[#FFB400]">Y</span>AMS
            </span>
            <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
        </div>

        <nav class="flex-1 space-y-1">
            <a @click="router.push('/dashboard')"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span>📁</span> Mes fichiers
            </a>
            <a @click="router.push('/admin')"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span>🛡️</span> Administration
            </a>
            <a class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-[rgba(255,180,0,0.1)] text-[#FFB400]">
                <span>📋</span> Logs d'activité
            </a>
        </nav>

        <div class="flex items-center gap-2.5 p-3 bg-[#0d0d14] rounded-xl border border-[#1e1e2e]">
            <div class="w-8 h-8 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {{ user?.name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-[#ddd] truncate">{{ user?.name }}</div>
                <div class="text-[10px] text-[#FFB400] uppercase tracking-wide">Admin</div>
            </div>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors text-base ml-1">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-10" style="margin-left: 240px;">

        <div class="mb-7">
            <h1 class="text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Logs d'activité</h1>
            <p class="text-xs text-[#555]">Historique complet de toutes les actions</p>
        </div>

        <!-- STATS -->
        <div v-if="stats" class="grid grid-cols-3 gap-3 mb-8">
            <div class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
                <div class="text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ stats.total_logs }}</div>
                <div class="text-xs text-[#555]">Total des logs</div>
            </div>
            <div class="bg-[#111118] border border-green-500/20 rounded-xl p-5">
                <div class="text-3xl font-black text-green-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.success_logs }}</div>
                <div class="text-xs text-[#555]">Actions réussies</div>
            </div>
            <div class="bg-[#111118] border border-red-500/20 rounded-xl p-5">
                <div class="text-3xl font-black text-red-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.failed_logs }}</div>
                <div class="text-xs text-[#555]">Actions échouées</div>
            </div>
        </div>

        <!-- TABLE -->
        <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
        <div v-else-if="logs.length === 0" class="text-[#444] text-sm py-6">Aucun log trouvé.</div>
        <div v-else class="overflow-x-auto">
            <table class="w-full text-[13px]">
                <thead class="border-b border-[#1e1e2e]">
                    <tr>
                        <th :class="thClass">Statut</th>
                        <th :class="thClass">Action</th>
                        <th :class="thClass">Utilisateur</th>
                        <th :class="thClass">Description</th>
                        <th :class="thClass">IP</th>
                        <th :class="thClass">Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in logs" :key="log.id" class="hover:bg-white/[0.01]">
                        <td :class="tdClass">
                            <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">
                                {{ log.success ? '✓' : '✗' }}
                            </span>
                        </td>
                        <td :class="tdClass">
                            <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono whitespace-nowrap">
                                {{ log.action }}
                            </span>
                        </td>
                        <td :class="tdClass">
                            <div v-if="log.user" class="flex items-center gap-2">
                                <div class="w-6 h-6 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {{ log.user?.name?.charAt(0) }}
                                </div>
                                <span class="text-xs text-[#ccc]">{{ log.user?.name }}</span>
                            </div>
                            <span v-else class="text-[#333] text-xs">Système</span>
                        </td>
                        <td :class="[tdClass, 'text-xs text-[#666] max-w-[200px]']">{{ log.description || '—' }}</td>
                        <td :class="[tdClass, 'font-mono text-[11px] text-[#555]']">{{ log.ip_address || '—' }}</td>
                        <td :class="[tdClass, 'text-[11px] text-[#555] whitespace-nowrap']">{{ formatDate(log.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </main>
</div>
</template>