<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const isAdmin = computed(() => user.value?.role?.name === 'admin')

const documents = ref([])
const sharedDocuments = ref([])
const file = ref(null)
const loading = ref(true)
const uploading = ref(false)

const shareModal = ref(false)
const selectedDoc = ref(null)
const shareEmail = ref('')
const shareTab = ref('user')
const publicLinkResult = ref(null)
const linkForm = ref({ permission: 'read', allow_download: true, expires_in_days: 7, password: '', email: '' })

const fetchDocuments = async () => {
    try {
        const res = await api.get('/api/documents')
        if (res.data.type === 'admin') {
            documents.value = res.data.documents || []
            sharedDocuments.value = []
        } else {
            documents.value = res.data.owned_documents || []
            sharedDocuments.value = res.data.shared_documents || []
        }
    } catch (e) { console.error(e.response?.data) }
    finally { loading.value = false }
}

const handleFileChange = (e) => { file.value = e.target.files[0] }

const uploadDocument = async () => {
    if (!file.value) return
    uploading.value = true
    const formData = new FormData()
    formData.append('file', file.value)
    try {
        await api.post('/api/documents', formData)
        file.value = null
        document.getElementById('fileInput').value = ''
        await fetchDocuments()
    } catch (e) { alert(e.response?.data?.message || 'Erreur upload') }
    finally { uploading.value = false }
}

const deleteDocument = async (id) => {
    if (!confirm('Supprimer ce document ?')) return
    try { await api.delete(`/api/documents/${id}`); await fetchDocuments() }
    catch (e) { alert(e.response?.data?.message || 'Erreur suppression') }
}

const downloadDocument = async (id, name) => {
    try {
        const res = await api.get(`/api/documents/${id}/download`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a'); a.href = url; a.download = name; a.click()
        window.URL.revokeObjectURL(url)
    } catch (e) { alert('Erreur téléchargement') }
}

const openShare = (doc) => { selectedDoc.value = doc; shareEmail.value = ''; publicLinkResult.value = null; shareTab.value = 'user'; shareModal.value = true }
const closeShare = () => { shareModal.value = false; selectedDoc.value = null }

const shareWithUser = async () => {
    if (!shareEmail.value) return
    try {
        await api.post(`/api/documents/${selectedDoc.value.id}/share`, { email: shareEmail.value })
        shareEmail.value = ''
        await fetchDocuments()
        selectedDoc.value = documents.value.find(d => d.id === selectedDoc.value.id)
    } catch (e) { alert(e.response?.data?.message || 'Erreur partage') }
}

const generateLink = async () => {
    try {
        const res = await api.post(`/api/documents/${selectedDoc.value.id}/public-link`, {
            permission: linkForm.value.permission,
            allow_download: linkForm.value.allow_download,
            expires_in_days: linkForm.value.expires_in_days,
            password: linkForm.value.password || null,
            email: linkForm.value.email || null
        })
        const url = new URL(res.data.public_url)
        const token = url.pathname.split('/').pop()
        const expires = url.searchParams.get('expires')
        const signature = url.searchParams.get('signature')
        publicLinkResult.value = `http://localhost:5173/share/${token}?expires=${expires}&signature=${signature}`
    } catch (e) { alert(e.response?.data?.message || 'Erreur génération lien') }
}

const copyLink = () => { navigator.clipboard.writeText(publicLinkResult.value); alert('Lien copié !') }

const logout = async () => {
    await api.post('/api/logout')
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/login')
}

const formatSize = (b) => { if (!b) return '—'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB' }
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
const fileIcon = (m) => { if (!m) return '📄'; if (m.includes('pdf')) return '📕'; if (m.includes('image')) return '🖼️'; if (m.includes('word')||m.includes('document')) return '📝'; if (m.includes('sheet')||m.includes('excel')) return '📊'; if (m.includes('zip')) return '📦'; return '📄' }

const inputClass = "w-full bg-[#0d0d14] border border-[#222230] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#333] focus:outline-none focus:border-[#FFB400] transition-colors"

onMounted(fetchDocuments)
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
            <a class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-[rgba(255,180,0,0.1)] text-[#FFB400]">
                <span>📁</span> Mes fichiers
            </a>
            <a v-if="isAdmin" @click="router.push('/admin')"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span>🛡️</span> Administration
            </a>
            <a @click="router.push('/admin/logs')" class="flex items-center gap-2.5 px-3 py-2.5 ...">
               <span>📋</span> Logs d'activité
            </a>
        </nav>

        <div class="flex items-center gap-2.5 p-3 bg-[#0d0d14] rounded-xl border border-[#1e1e2e]">
            <div class="w-8 h-8 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {{ user?.name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-[#ddd] truncate">{{ user?.name }}</div>
                <div class="text-[10px] text-[#555] uppercase tracking-wide">{{ user?.role?.name }}</div>
            </div>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors text-base ml-1">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-10" style="margin-left: 240px;">

        <!-- HEADER -->
        <div class="flex items-start justify-between mb-10 gap-5 flex-wrap">
            <div>
                <h1 class="text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Mes documents</h1>
                <p class="text-xs text-[#555]">{{ documents.length }} fichier(s) • {{ sharedDocuments.length }} partagé(s) avec moi</p>
            </div>

            <!-- UPLOAD -->
            <div class="flex items-center gap-2.5">
                <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.zip" @change="handleFileChange" class="hidden" />
                <label for="fileInput"
                    class="bg-[#1a1a28] border border-dashed border-[#333] hover:border-[#FFB400] hover:text-[#FFB400] text-[#aaa] rounded-lg px-4 py-2.5 text-xs cursor-pointer transition-all truncate max-w-[180px]">
                    {{ file ? file.name : '+ Choisir un fichier' }}
                </label>
                <button @click="uploadDocument" :disabled="!file || uploading"
                    class="bg-[#FFB400] hover:bg-[#ffc933] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg px-5 py-2.5 text-xs flex items-center gap-2 transition-colors whitespace-nowrap"
                    style="font-family:'Syne',sans-serif">
                    <span v-if="uploading" class="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    <span v-else>Uploader</span>
                </button>
            </div>
        </div>

        <!-- MES FICHIERS -->
        <section class="mb-10">
            <h2 class="text-[11px] font-bold text-[#555] uppercase tracking-[2px] mb-4" style="font-family:'Syne',sans-serif">Mes fichiers</h2>

            <div v-if="loading" class="text-[#444] text-sm py-6">Chargement...</div>
            <div v-else-if="documents.length === 0" class="text-[#444] text-sm py-6">Aucun document. Uploadez votre premier fichier !</div>

            <div v-else class="space-y-2">
                <div v-for="doc in documents" :key="doc.id"
                    class="flex items-center gap-4 bg-[#111118] border border-[#1e1e2e] hover:border-[#2e2e44] rounded-xl px-5 py-4 transition-colors">
                    <span class="text-2xl shrink-0">{{ fileIcon(doc.mime_type) }}</span>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-[#ddd] truncate">{{ doc.name }}</div>
                        <div class="text-xs text-[#555] mt-0.5">{{ formatSize(doc.size) }} • {{ formatDate(doc.created_at) }}</div>
                        <div v-if="doc.shared_with?.length" class="text-[11px] text-[#FFB400] mt-0.5">
                            Partagé avec {{ doc.shared_with.length }} personne(s)
                        </div>
                    </div>
                    <div class="flex gap-1.5 shrink-0">
                        <button @click="downloadDocument(doc.id, doc.name)"
                            class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] hover:border-[#444] rounded-md px-2.5 py-1.5 text-sm transition-all">⬇</button>
                        <button @click="openShare(doc)"
                            class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] hover:border-[#444] rounded-md px-2.5 py-1.5 text-sm transition-all">🔗</button>
                        <button @click="deleteDocument(doc.id)"
                            class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded-md px-2.5 py-1.5 text-sm transition-all">🗑</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- PARTAGÉS AVEC MOI -->
        <section v-if="sharedDocuments.length > 0">
            <h2 class="text-[11px] font-bold text-[#555] uppercase tracking-[2px] mb-4" style="font-family:'Syne',sans-serif">Partagés avec moi</h2>
            <div class="space-y-2">
                <div v-for="doc in sharedDocuments" :key="doc.id"
                    class="flex items-center gap-4 bg-[#111118] border-l-2 border-l-[#FFB400] border border-[#1e1e2e] rounded-xl px-5 py-4">
                    <span class="text-2xl shrink-0">{{ fileIcon(doc.mime_type) }}</span>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-[#ddd] truncate">{{ doc.name }}</div>
                        <div class="text-xs text-[#555] mt-0.5">Par {{ doc.user?.name }} • {{ formatDate(doc.created_at) }}</div>
                    </div>
                    <button @click="downloadDocument(doc.id, doc.name)"
                        class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded-md px-2.5 py-1.5 text-sm transition-all shrink-0">⬇</button>
                </div>
            </div>
        </section>
    </main>

    <!-- MODAL PARTAGE -->
    <div v-if="shareModal" @click.self="closeShare"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div class="bg-[#111118] border border-[#222230] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            <div class="flex items-center justify-between px-6 py-5 border-b border-[#1e1e2e]">
                <h3 class="text-base font-bold text-white truncate max-w-[340px]" style="font-family:'Syne',sans-serif">
                    Partager « {{ selectedDoc?.name }} »
                </h3>
                <button @click="closeShare" class="text-[#555] hover:text-white text-lg transition-colors ml-3">✕</button>
            </div>

            <!-- TABS -->
            <div class="flex px-6 pt-4 gap-2 border-b border-[#1e1e2e]">
                <button v-for="tab in [{id:'user',label:'Utilisateur interne'},{id:'link',label:'Lien public'}]" :key="tab.id"
                    @click="shareTab = tab.id"
                    :class="['pb-3 text-sm font-medium border-b-2 transition-all', shareTab === tab.id ? 'text-[#FFB400] border-[#FFB400]' : 'text-[#555] border-transparent hover:text-[#aaa]']">
                    {{ tab.label }}
                </button>
            </div>

            <!-- TAB USER -->
            <div v-if="shareTab === 'user'" class="px-6 py-5 space-y-4">
                <div>
                    <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Email de l'utilisateur</label>
                    <input v-model="shareEmail" type="email" placeholder="alice@yamslogistics.com" @keyup.enter="shareWithUser" :class="inputClass" />
                </div>
                <button @click="shareWithUser"
                    class="w-full bg-[#FFB400] hover:bg-[#ffc933] text-black font-bold rounded-lg py-3 text-sm transition-colors"
                    style="font-family:'Syne',sans-serif">Partager</button>

                <div v-if="selectedDoc?.shared_with?.length" class="pt-2">
                    <p class="text-xs text-[#555] mb-3">Déjà partagé avec :</p>
                    <div v-for="u in selectedDoc.shared_with" :key="u.id"
                        class="flex items-center gap-2.5 py-2 border-b border-[#1a1a28]">
                        <div class="w-7 h-7 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {{ u.name?.charAt(0) }}
                        </div>
                        <div>
                            <div class="text-sm text-[#aaa]">{{ u.name }}</div>
                            <div class="text-xs text-[#444]">{{ u.email }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB LINK -->
            <div v-if="shareTab === 'link'" class="px-6 py-5 space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Permission</label>
                        <select v-model="linkForm.permission" :class="inputClass">
                            <option value="read">Lecture seule</option>
                            <option value="edit">Édition</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Expire (jours)</label>
                        <input v-model="linkForm.expires_in_days" type="number" min="1" max="30" :class="inputClass" />
                    </div>
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Email (optionnel)</label>
                    <input v-model="linkForm.email" type="email" placeholder="contact@externe.com" :class="inputClass" />
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-[#666] uppercase tracking-[1px] mb-2">Mot de passe (optionnel)</label>
                    <input v-model="linkForm.password" type="password" placeholder="Protéger le lien" :class="inputClass" />
                </div>
                <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" v-model="linkForm.allow_download" class="accent-[#FFB400]" />
                    <span class="text-sm text-[#aaa]">Autoriser le téléchargement</span>
                </label>

                <button @click="generateLink"
                    class="w-full bg-[#FFB400] hover:bg-[#ffc933] text-black font-bold rounded-lg py-3 text-sm transition-colors"
                    style="font-family:'Syne',sans-serif">Générer le lien</button>

                <div v-if="publicLinkResult" class="bg-[#0d0d14] border border-[#222230] rounded-lg p-4">
                    <p class="text-[10px] text-[#555] uppercase tracking-[1px] mb-2">Lien généré</p>
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] text-[#FFB400] break-all flex-1">{{ publicLinkResult }}</span>
                        <button @click="copyLink"
                            class="bg-[#1a1a28] border border-[#333] hover:border-[#FFB400] hover:text-[#FFB400] text-[#aaa] rounded-md px-3 py-1.5 text-xs transition-all shrink-0">
                            Copier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>