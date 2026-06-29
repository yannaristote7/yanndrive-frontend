<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const documents = ref([])
const logs = ref([])
const stats = ref(null)
const loading = ref(true)
const activeTab = ref('documents')
const sidebarOpen = ref(false)

const fetchDocuments = async () => {
    try {
        const res = await api.get('/api/documents')
        const data = res.data.documents
        documents.value = data?.data || data || []
    } catch (e) {
        console.error(e.response?.data)
    }
}
const fetchLogs = async () => {
    try {
        const [logsRes, statsRes] = await Promise.all([api.get('/api/admin/logs'), api.get('/api/admin/logs/stats')])
        logs.value = logsRes.data.data || []
        stats.value = statsRes.data
    } catch (e) { console.error(e.response?.data) }
}
const deleteDocument = async (id) => {
    if (!confirm('Supprimer définitivement ce document ?')) return
    try { await api.delete(`/api/documents/${id}`); await fetchDocuments(); toast.success('Document supprimé') }
    catch (e) { toast.error(e.response?.data?.message || 'Erreur suppression') }
}
const downloadDocument = async (id, name) => {
    try {
        const res = await api.get(`/api/documents/${id}/download`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a'); a.href = url; a.download = name; a.click()
        window.URL.revokeObjectURL(url)
    } catch (e) { toast.error('Erreur téléchargement') }
}
const logout = async () => {
    await api.post('/api/logout')
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/')
}
const formatSize = (b) => { if (!b) return '—'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB' }
const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) }
const fileIcon = (m) => { if (!m) return '📄'; if (m.includes('pdf')) return '📕'; if (m.includes('image')) return '🖼️'; if (m.includes('word')||m.includes('document')) return '📝'; if (m.includes('sheet')||m.includes('excel')) return '📊'; if (m.includes('zip')) return '📦'; return '📄' }

onMounted(async () => { await Promise.all([fetchDocuments(), fetchLogs()]); loading.value = false })
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
                <span class="text-[#FFB400]">Y</span>ANN
            </span>
            <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
        </div>
        <nav class="flex-1 space-y-1">
            <a @click="router.push('/dashboard'); sidebarOpen=false"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span></span> Mes fichiers
            </a>
            <a class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-[rgba(255,180,0,0.1)] text-[#FFB400]">
                <span></span> Administration
            </a>
            <a @click="router.push('/admin/logs'); sidebarOpen=false"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span></span> Logs d'activité
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
            <span class="font-black text-lg text-white" style="font-family:'Syne',sans-serif"><span class="text-[#FFB400]">Y</span>ANN</span>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors">↩</button>
        </div>

        <div class="p-4 sm:p-6 lg:p-10">
            <div class="admin-main">

                <div class="mb-6">
                    <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Administration</h1>
                    <p class="text-xs text-[#555]">Vue globale de tous les documents et activités</p>
                </div>

                <!-- STATS -->
                <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
                    <div class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                        <div class="text-2xl sm:text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ documents.length }}</div>
                        <div class="text-[11px] text-[#555]">Documents</div>
                    </div>
                    <div class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                        <div class="text-2xl sm:text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ stats.total_logs }}</div>
                        <div class="text-[11px] text-[#555]">Logs totaux</div>
                    </div>
                    <div class="bg-[#111118] border border-green-500/20 rounded-xl p-4">
                        <div class="text-2xl sm:text-3xl font-black text-green-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.success_logs }}</div>
                        <div class="text-[11px] text-[#555]">Réussies</div>
                    </div>
                    <div class="bg-[#111118] border border-red-500/20 rounded-xl p-4">
                        <div class="text-2xl sm:text-3xl font-black text-red-400 mb-1" style="font-family:'Syne',sans-serif">{{ stats.failed_logs }}</div>
                        <div class="text-[11px] text-[#555]">Échouées</div>
                    </div>
                </div>

                <!-- TABS -->
                <div class="flex gap-1 border-b border-[#1e1e2e] mb-5 overflow-x-auto">
                    <button v-for="tab in [{id:'documents',label:`📁 Documents (${documents.length})`},{id:'logs',label:`📋 Logs (${logs.length})`}]" :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="['px-4 py-3 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap', activeTab === tab.id ? 'text-[#FFB400] border-[#FFB400]' : 'text-[#555] border-transparent hover:text-[#aaa]']">
                        {{ tab.label }}
                    </button>
                </div>

                <!-- DOCUMENTS TAB -->
                <div v-if="activeTab === 'documents'">
                    <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
                    <div v-else-if="documents.length === 0" class="text-[#444] text-sm py-6">Aucun document.</div>

                    <!-- TABLE desktop -->
                    <div v-else class="hidden sm:block overflow-x-auto">
                        <table class="w-full text-[13px]">
                            <thead class="border-b border-[#1e1e2e]">
                                <tr>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Fichier</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Propriétaire</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px] hidden md:table-cell">Partagé avec</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Taille</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px] hidden lg:table-cell">Date</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="doc in documents" :key="doc.id" class="hover:bg-white/[0.01]">
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <div class="flex items-center gap-2 max-w-[160px]">
                                            <span class="text-base shrink-0">{{ fileIcon(doc.mime_type) }}</span>
                                            <span class="text-xs text-[#ccc] truncate">{{ doc.name }}</span>
                                        </div>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-6 h-6 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{{ doc.user?.name?.charAt(0) }}</div>
                                            <div class="min-w-0">
                                                <div class="text-xs text-[#ccc] truncate max-w-[80px]">{{ doc.user?.name }}</div>
                                                <div class="text-[10px] text-[#444] truncate max-w-[80px] hidden md:block">{{ doc.user?.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420] hidden md:table-cell">
                                        <span v-if="!doc.shared_with?.length" class="text-[#333] text-xs">—</span>
                                        <div v-else class="flex flex-wrap gap-1">
                                            <span v-for="u in doc.shared_with" :key="u.id"
                                                class="bg-[rgba(255,180,0,0.1)] text-[#FFB400] border border-[rgba(255,180,0,0.2)] rounded px-1.5 py-0.5 text-[10px]">{{ u.name }}</span>
                                        </div>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420] font-mono text-xs text-[#666] whitespace-nowrap">{{ formatSize(doc.size) }}</td>
                                    <td class="px-3 py-3 border-b border-[#141420] text-[11px] text-[#555] whitespace-nowrap hidden lg:table-cell">{{ formatDate(doc.created_at) }}</td>
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <div class="flex gap-1">
                                            <button @click="downloadDocument(doc.id, doc.name)"
                                                class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded px-2 py-1 text-xs transition-all">⬇</button>
                                            <button @click="deleteDocument(doc.id)"
                                                class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded px-2 py-1 text-xs transition-all">🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- CARDS mobile -->
                    <div v-if="!loading && documents.length > 0" class="sm:hidden space-y-2">
                        <div v-for="doc in documents" :key="doc.id" class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                            <div class="flex items-start gap-3 mb-3">
                                <span class="text-xl shrink-0">{{ fileIcon(doc.mime_type) }}</span>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-[#ddd] truncate">{{ doc.name }}</div>
                                    <div class="text-xs text-[#555] mt-0.5">{{ formatSize(doc.size) }} • {{ doc.user?.name }}</div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button @click="downloadDocument(doc.id, doc.name)"
                                    class="flex-1 bg-[#1a1a28] border border-[#2a2a3a] rounded-lg py-2 text-xs text-center transition-all hover:bg-[#222238]">⬇ Télécharger</button>
                                <button @click="deleteDocument(doc.id)"
                                    class="flex-1 bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded-lg py-2 text-xs transition-all">🗑 Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LOGS TAB -->
                <div v-if="activeTab === 'logs'">
                    <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
                    <div v-else-if="logs.length === 0" class="text-[#444] text-sm py-6">Aucun log.</div>

                    <!-- TABLE desktop -->
                    <div v-else class="hidden sm:block overflow-x-auto">
                        <table class="w-full text-[13px]">
                            <thead class="border-b border-[#1e1e2e]">
                                <tr>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Statut</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Action</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Utilisateur</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px] hidden md:table-cell">Description</th>
                                    <th class="text-left px-3 py-3 text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="log in logs" :key="log.id" class="hover:bg-white/[0.01]">
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">{{ log.success ? '✓' : '✗' }}</span>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono whitespace-nowrap">{{ log.action }}</span>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420]">
                                        <div v-if="log.user" class="flex items-center gap-1.5">
                                            <div class="w-6 h-6 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{{ log.user?.name?.charAt(0) }}</div>
                                            <span class="text-xs text-[#ccc] truncate max-w-[80px]">{{ log.user?.name }}</span>
                                        </div>
                                        <span v-else class="text-[#333] text-xs">Système</span>
                                    </td>
                                    <td class="px-3 py-3 border-b border-[#141420] text-xs text-[#666] max-w-[150px] truncate hidden md:table-cell">{{ log.description || '—' }}</td>
                                    <td class="px-3 py-3 border-b border-[#141420] text-[11px] text-[#555] whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- CARDS mobile -->
                    <div v-if="!loading && logs.length > 0" class="sm:hidden space-y-2">
                        <div v-for="log in logs" :key="log.id" class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                            <div class="flex items-center justify-between mb-2">
                                <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">{{ log.success ? '✓' : '✗' }}</span>
                                <span class="bg-[#1a1a28] border border-[#2a2a3a] rounded px-2 py-0.5 text-[10px] text-[#888] font-mono">{{ log.action }}</span>
                                <span class="text-[10px] text-[#555]">{{ formatDate(log.created_at) }}</span>
                            </div>
                            <div class="text-xs text-[#aaa]">{{ log.user?.name || 'Système' }}</div>
                            <div v-if="log.description" class="text-[11px] text-[#555] mt-1">{{ log.description }}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>
</div>
</template>
<style scoped>
@media (min-width: 1024px) {
    .admin-main {
        margin-left: 256px;
    }
}
</style>