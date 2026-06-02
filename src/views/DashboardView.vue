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

// Partage
const shareModal = ref(false)
const selectedDoc = ref(null)
const shareUserId = ref('')
const shareTab = ref('user') // 'user' | 'link'
const publicLinkResult = ref(null)
const linkForm = ref({
    permission: 'read',
    allow_download: true,
    expires_in_days: 7,
    password: '',
    email: ''
})

/*
========================================
FETCH
========================================
*/
const fetchDocuments = async () => {
    try {
        const res = await api.get('/api/documents')
        if (res.data.type === 'admin') {
            router.push('/admin')
            return
        }
        documents.value = res.data.owned_documents || []
        sharedDocuments.value = res.data.shared_documents || []
    } catch (e) {
        console.error(e.response?.data)
    } finally {
        loading.value = false
    }
}

/*
========================================
UPLOAD
========================================
*/
const handleFileChange = (e) => {
    file.value = e.target.files[0]
}

const uploadDocument = async () => {
    if (!file.value) return alert('Choisir un fichier')
    uploading.value = true
    const formData = new FormData()
    formData.append('file', file.value)
    try {
        await api.post('/api/documents', formData)
        file.value = null
        document.getElementById('fileInput').value = ''
        await fetchDocuments()
    } catch (e) {
        alert(e.response?.data?.message || 'Erreur upload')
        console.error(e.response?.data)
    } finally {
        uploading.value = false
    }
}

/*
========================================
DELETE
========================================
*/
const deleteDocument = async (id) => {
    if (!confirm('Supprimer ce document ?')) return
    try {
        await api.delete(`/api/documents/${id}`)
        await fetchDocuments()
    } catch (e) {
        alert(e.response?.data?.message || 'Erreur suppression')
    }
}

/*
========================================
DOWNLOAD
========================================
*/
const downloadDocument = async (id, name) => {
    try {
        const res = await api.get(`/api/documents/${id}/download`, {
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = name
        a.click()
        window.URL.revokeObjectURL(url)
    } catch (e) {
        alert('Erreur téléchargement')
    }
}

/*
========================================
PARTAGE MODAL
========================================
*/
const openShare = (doc) => {
    selectedDoc.value = doc
    shareUserId.value = ''
    publicLinkResult.value = null
    shareTab.value = 'user'
    shareModal.value = true
}

const closeShare = () => {
    shareModal.value = false
    selectedDoc.value = null
}

const shareWithUser = async () => {
    if (!shareUserId.value) return
    try {
        await api.post(`/api/documents/${selectedDoc.value.id}/share`, {
            user_id: shareUserId.value
        })
        alert('Document partagé avec succès')
        shareUserId.value = ''
        await fetchDocuments()
    } catch (e) {
        alert(e.response?.data?.message || 'Erreur partage')
    }
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
        publicLinkResult.value = res.data.public_url
    } catch (e) {
        alert(e.response?.data?.message || 'Erreur génération lien')
    }
}

const copyLink = () => {
    navigator.clipboard.writeText(publicLinkResult.value)
    alert('Lien copié !')
}

/*
========================================
LOGOUT
========================================
*/
const logout = async () => {
    await api.post('/api/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
}

/*
========================================
UTILS
========================================
*/
const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
})

const fileIcon = (mime) => {
    if (!mime) return '📄'
    if (mime.includes('pdf')) return '📕'
    if (mime.includes('image')) return '🖼️'
    if (mime.includes('word') || mime.includes('document')) return '📝'
    if (mime.includes('sheet') || mime.includes('excel')) return '📊'
    if (mime.includes('zip')) return '📦'
    return '📄'
}

onMounted(fetchDocuments)
</script>

<template>
<div class="dashboard">

    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="sidebar-logo">
            <span class="logo-y">Y</span>AMS
            <span class="logo-sub">Drive</span>
        </div>

        <nav class="sidebar-nav">
            <a class="nav-item active">
                <span class="nav-icon">📁</span> Mes fichiers
            </a>
            <a class="nav-item" v-if="isAdmin" @click="router.push('/admin')">
                <span class="nav-icon">🛡️</span> Administration
            </a>
        </nav>

        <div class="sidebar-user">
            <div class="user-avatar">{{ user?.name?.charAt(0) }}</div>
            <div class="user-info">
                <div class="user-name">{{ user?.name }}</div>
                <div class="user-role">{{ user?.role?.name }}</div>
            </div>
            <button class="btn-logout" @click="logout" title="Déconnexion">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="main">

        <!-- HEADER -->
        <div class="page-header">
            <div>
                <h1>Mes documents</h1>
                <p class="page-sub">{{ documents.length }} fichier(s) • {{ sharedDocuments.length }} partagé(s) avec moi</p>
            </div>

            <!-- UPLOAD ZONE -->
            <div class="upload-zone">
                <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    @change="handleFileChange"
                    style="display:none"
                />
                <label for="fileInput" class="btn-choose">
                    {{ file ? file.name : '+ Choisir un fichier' }}
                </label>
                <button
                    class="btn-upload"
                    @click="uploadDocument"
                    :disabled="!file || uploading"
                >
                    <span v-if="uploading" class="spinner"></span>
                    <span v-else>Uploader</span>
                </button>
            </div>
        </div>

        <!-- MES DOCUMENTS -->
        <section class="section">
            <h2 class="section-title">Mes fichiers</h2>

            <div v-if="loading" class="loading">Chargement...</div>

            <div v-else-if="documents.length === 0" class="empty">
                Aucun document. Uploadez votre premier fichier !
            </div>

            <div v-else class="doc-grid">
                <div class="doc-card" v-for="doc in documents" :key="doc.id">
                    <div class="doc-icon">{{ fileIcon(doc.mime_type) }}</div>
                    <div class="doc-info">
                        <div class="doc-name" :title="doc.name">{{ doc.name }}</div>
                        <div class="doc-meta">{{ formatSize(doc.size) }} • {{ formatDate(doc.created_at) }}</div>
                        <div class="doc-shared" v-if="doc.shared_with?.length">
                            Partagé avec {{ doc.shared_with.length }} personne(s)
                        </div>
                    </div>
                    <div class="doc-actions">
                        <button class="btn-icon" @click="downloadDocument(doc.id, doc.name)" title="Télécharger">⬇</button>
                        <button class="btn-icon" @click="openShare(doc)" title="Partager">🔗</button>
                        <button class="btn-icon danger" @click="deleteDocument(doc.id)" title="Supprimer">🗑</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- PARTAGÉS AVEC MOI -->
        <section class="section" v-if="sharedDocuments.length > 0">
            <h2 class="section-title">Partagés avec moi</h2>
            <div class="doc-grid">
                <div class="doc-card shared" v-for="doc in sharedDocuments" :key="doc.id">
                    <div class="doc-icon">{{ fileIcon(doc.mime_type) }}</div>
                    <div class="doc-info">
                        <div class="doc-name">{{ doc.name }}</div>
                        <div class="doc-meta">Par {{ doc.user?.name }} • {{ formatDate(doc.created_at) }}</div>
                    </div>
                    <div class="doc-actions">
                        <button class="btn-icon" @click="downloadDocument(doc.id, doc.name)" title="Télécharger">⬇</button>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- MODAL PARTAGE -->
    <div class="modal-overlay" v-if="shareModal" @click.self="closeShare">
        <div class="modal">
            <div class="modal-header">
                <h3>Partager « {{ selectedDoc?.name }} »</h3>
                <button class="modal-close" @click="closeShare">✕</button>
            </div>

            <div class="modal-tabs">
                <button :class="['tab', shareTab === 'user' && 'active']" @click="shareTab = 'user'">
                    Utilisateur interne
                </button>
                <button :class="['tab', shareTab === 'link' && 'active']" @click="shareTab = 'link'">
                    Lien public
                </button>
            </div>

            <!-- TAB : PARTAGE UTILISATEUR -->
            <div v-if="shareTab === 'user'" class="modal-body">
                <div class="field">
                    <label>ID de l'utilisateur</label>
                    <input v-model="shareUserId" type="number" placeholder="Ex: 2" />
                </div>
                <button class="btn-primary" @click="shareWithUser">Partager</button>

                <!-- Liste des utilisateurs déjà partagés -->
                <div v-if="selectedDoc?.shared_with?.length" class="shared-list">
                    <p class="shared-list-title">Déjà partagé avec :</p>
                    <div class="shared-user" v-for="u in selectedDoc.shared_with" :key="u.id">
                        <span class="shared-avatar">{{ u.name?.charAt(0) }}</span>
                        <span>{{ u.name }}</span>
                        <small>{{ u.email }}</small>
                    </div>
                </div>
            </div>

            <!-- TAB : LIEN PUBLIC -->
            <div v-if="shareTab === 'link'" class="modal-body">
                <div class="field-row">
                    <div class="field">
                        <label>Permission</label>
                        <select v-model="linkForm.permission">
                            <option value="read">Lecture seule</option>
                            <option value="edit">Édition</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Expire dans (jours)</label>
                        <input v-model="linkForm.expires_in_days" type="number" min="1" max="30" />
                    </div>
                </div>

                <div class="field">
                    <label>Email destinataire (optionnel)</label>
                    <input v-model="linkForm.email" type="email" placeholder="contact@externe.com" />
                </div>

                <div class="field">
                    <label>Mot de passe (optionnel)</label>
                    <input v-model="linkForm.password" type="password" placeholder="Protéger le lien" />
                </div>

                <div class="field-check">
                    <input type="checkbox" id="allowDl" v-model="linkForm.allow_download" />
                    <label for="allowDl" style="text-transform:none;font-size:14px;letter-spacing:0">
                        Autoriser le téléchargement
                    </label>
                </div>

                <button class="btn-primary" @click="generateLink">Générer le lien</button>

                <div v-if="publicLinkResult" class="link-result">
                    <p class="link-label">Lien généré :</p>
                    <div class="link-box">
                        <span class="link-text">{{ publicLinkResult }}</span>
                        <button class="btn-copy" @click="copyLink">Copier</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; }

.dashboard {
    display: flex;
    min-height: 100vh;
    background: #0a0a0f;
    color: #e0e0e0;
    font-family: 'DM Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
    width: 240px;
    background: #111118;
    border-right: 1px solid #1e1e2e;
    display: flex;
    flex-direction: column;
    padding: 28px 20px;
    position: fixed;
    height: 100vh;
}

.sidebar-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 36px;
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.logo-y { color: #FFB400; }
.logo-sub {
    font-size: 11px;
    font-weight: 400;
    color: #555;
    margin-left: 4px;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.sidebar-nav { flex: 1; }

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: 4px;
    text-decoration: none;
}

.nav-item:hover { background: #1a1a28; color: #ccc; }
.nav-item.active { background: rgba(255,180,0,0.1); color: #FFB400; }
.nav-icon { font-size: 16px; }

.sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #0d0d14;
    border-radius: 10px;
    border: 1px solid #1e1e2e;
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: #FFB400;
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
}

.user-info { flex: 1; min-width: 0; }
.user-name {
    font-size: 13px;
    font-weight: 600;
    color: #ddd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.user-role { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }

.btn-logout {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    transition: color 0.15s;
}
.btn-logout:hover { color: #ff6b6b; }

/* MAIN */
.main {
    margin-left: 240px;
    flex: 1;
    padding: 36px 40px;
    min-width: 0;
}

.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 20px;
    flex-wrap: wrap;
}

h1 {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 4px;
}

.page-sub { font-size: 13px; color: #555; margin: 0; }

.upload-zone {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-choose {
    background: #1a1a28;
    border: 1px dashed #333;
    border-radius: 8px;
    padding: 10px 18px;
    color: #aaa;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.btn-choose:hover { border-color: #FFB400; color: #FFB400; }

.btn-upload {
    background: #FFB400;
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 700;
    font-size: 13px;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}
.btn-upload:hover:not(:disabled) { background: #ffc933; }
.btn-upload:disabled { opacity: 0.5; cursor: not-allowed; }

/* SECTIONS */
.section { margin-bottom: 40px; }

.section-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin: 0 0 16px;
}

.loading, .empty {
    color: #444;
    font-size: 14px;
    padding: 24px 0;
}

/* DOC GRID */
.doc-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.doc-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #111118;
    border: 1px solid #1e1e2e;
    border-radius: 10px;
    padding: 14px 18px;
    transition: border-color 0.15s;
}

.doc-card:hover { border-color: #2e2e44; }
.doc-card.shared { border-left: 2px solid #FFB400; }

.doc-icon { font-size: 24px; flex-shrink: 0; }

.doc-info { flex: 1; min-width: 0; }

.doc-name {
    font-size: 14px;
    font-weight: 500;
    color: #ddd;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.doc-meta { font-size: 12px; color: #555; margin-top: 2px; }
.doc-shared { font-size: 11px; color: #FFB400; margin-top: 2px; }

.doc-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.btn-icon {
    background: #1a1a28;
    border: 1px solid #2a2a3a;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
    color: #888;
}
.btn-icon:hover { background: #222238; border-color: #444; }
.btn-icon.danger:hover { background: rgba(255,60,60,0.1); border-color: rgba(255,60,60,0.3); }

/* MODAL */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal {
    background: #111118;
    border: 1px solid #222230;
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #1e1e2e;
}

.modal-header h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 340px;
}

.modal-close {
    background: none;
    border: none;
    color: #555;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    flex-shrink: 0;
}
.modal-close:hover { color: #fff; }

.modal-tabs {
    display: flex;
    padding: 16px 24px 0;
    gap: 8px;
    border-bottom: 1px solid #1e1e2e;
}

.tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 8px 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
}
.tab.active { color: #FFB400; border-bottom-color: #FFB400; }
.tab:hover { color: #aaa; }

.modal-body {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: flex; gap: 12px; }
.field-row .field { flex: 1; }

label {
    font-size: 11px;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

input, select {
    background: #0d0d14;
    border: 1px solid #222230;
    border-radius: 8px;
    padding: 10px 14px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
}
input:focus, select:focus { outline: none; border-color: #FFB400; }
input::placeholder { color: #333; }
select option { background: #111118; }

.field-check {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-primary {
    background: #FFB400;
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-weight: 700;
    font-size: 14px;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
    text-align: center;
}
.btn-primary:hover { background: #ffc933; }

.link-result {
    background: #0d0d14;
    border: 1px solid #222230;
    border-radius: 8px;
    padding: 14px;
}

.link-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px; }

.link-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.link-text {
    font-size: 11px;
    color: #FFB400;
    word-break: break-all;
    flex: 1;
}

.btn-copy {
    background: #1a1a28;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 6px 12px;
    color: #aaa;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
}
.btn-copy:hover { border-color: #FFB400; color: #FFB400; }

/* Shared users list */
.shared-list { margin-top: 4px; }
.shared-list-title { font-size: 12px; color: #555; margin: 0 0 10px; }

.shared-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #1a1a28;
    font-size: 13px;
    color: #aaa;
}

.shared-avatar {
    width: 28px;
    height: 28px;
    background: #FFB400;
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 11px;
    flex-shrink: 0;
}

.shared-user small { color: #444; font-size: 11px; }

/* Spinner */
.spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>