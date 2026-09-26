<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'
import { formatSize, formatDate, fileIcon, apiError } from '@/utils/format'
import AdminPagination from '@/components/admin/AdminPagination.vue'

const toast = useToast()
const documents = ref([])
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(true)

const fetchDocuments = async (p = page.value) => {
    loading.value = true
    try {
        const { data } = await api.get('/api/documents', { params: { page: p, per_page: 15, search: search.value || undefined } })
        const docs = data.documents
        documents.value = docs.data
        page.value = docs.current_page
        lastPage.value = docs.last_page
        total.value = docs.total
    } catch (e) { toast.error(apiError(e)) }
    finally { loading.value = false }
}

let searchTimer
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchDocuments(1), 300) })

const deleteDocument = async (doc) => {
    if (!confirm(`Supprimer définitivement « ${doc.name} » ?`)) return
    try {
        await api.delete(`/api/documents/${doc.id}`)
        toast.success('Document supprimé')
        await fetchDocuments(documents.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
    } catch (e) { toast.error(apiError(e, 'Erreur suppression')) }
}

const downloadDocument = async (doc) => {
    try {
        const res = await api.get(`/api/documents/${doc.id}/download`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a'); a.href = url; a.download = doc.name; a.click()
        window.URL.revokeObjectURL(url)
    } catch { toast.error('Erreur téléchargement') }
}

onMounted(() => fetchDocuments(1))
</script>

<template>
<div>
    <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Documents</h1>
        <p class="text-xs text-[#555]">Tous les fichiers de tous les utilisateurs</p>
    </div>

    <input v-model="search" type="search" placeholder="Rechercher un fichier…"
        class="w-full mb-4 bg-[#111118] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd] placeholder-[#444]">

    <div v-if="loading && !documents.length" class="text-[#444] text-sm py-6">Chargement...</div>
    <div v-else-if="!documents.length" class="text-[#444] text-sm py-6">Aucun document.</div>

    <div v-else :class="['bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-x-auto transition-opacity', loading && 'opacity-50']">
        <table class="w-full text-[13px]">
            <thead class="border-b border-[#1e1e2e]">
                <tr class="text-left text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">
                    <th class="px-4 py-3">Fichier</th>
                    <th class="px-4 py-3">Propriétaire</th>
                    <th class="px-4 py-3 hidden md:table-cell">Partagé avec</th>
                    <th class="px-4 py-3 hidden sm:table-cell">Taille</th>
                    <th class="px-4 py-3 hidden lg:table-cell">Date</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="doc in documents" :key="doc.id" class="border-b border-[#141420] last:border-0 hover:bg-white/[0.01]">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2 max-w-[220px]">
                            <span class="text-base shrink-0">{{ fileIcon(doc.mime_type) }}</span>
                            <span class="text-xs text-[#ccc] truncate" :title="doc.name">{{ doc.name }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-xs text-[#ccc] truncate max-w-[140px]">{{ doc.user?.name }}</div>
                        <div class="text-[10px] text-[#444] truncate max-w-[140px]">{{ doc.user?.email }}</div>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                        <span v-if="!doc.shared_with?.length" class="text-[#333] text-xs">—</span>
                        <div v-else class="flex flex-wrap gap-1">
                            <span v-for="u in doc.shared_with" :key="u.id"
                                class="bg-[rgba(255,180,0,0.1)] text-[#FFB400] border border-[rgba(255,180,0,0.2)] rounded px-1.5 py-0.5 text-[10px]">{{ u.name }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#666] whitespace-nowrap">{{ formatSize(doc.size) }}</td>
                    <td class="px-4 py-3 hidden lg:table-cell text-[11px] text-[#555] whitespace-nowrap">{{ formatDate(doc.created_at) }}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-1 justify-end">
                            <button @click="downloadDocument(doc)" title="Télécharger" class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded px-2 py-1 text-xs transition-all">⬇</button>
                            <button @click="deleteDocument(doc)" title="Supprimer" class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded px-2 py-1 text-xs transition-all">🗑</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <AdminPagination :page="page" :last-page="lastPage" :total="total" @change="fetchDocuments" />
</div>
</template>
