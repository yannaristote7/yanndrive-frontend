<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const documents = ref([])
const logs = ref([])
const stats = ref(null)
const loading = ref(true)
const activeTab = ref('documents') // 'documents' | 'logs'

/*
========================================
FETCH DOCUMENTS (ADMIN)
========================================
*/
const fetchDocuments = async () => {
    try {
        const res = await api.get('/api/documents')
        documents.value = res.data.documents || []
    } catch (e) {
        console.error(e.response?.data)
    }
}

/*
========================================
FETCH LOGS
========================================
*/
const fetchLogs = async () => {
    try {
        const [logsRes, statsRes] = await Promise.all([
            api.get('/api/admin/logs'),
            api.get('/api/admin/logs/stats')
        ])
        logs.value = logsRes.data.data || []
        stats.value = statsRes.data
    } catch (e) {
        console.error(e.response?.data)
    }
}

/*
========================================
DELETE DOCUMENT
========================================
*/
const deleteDocument = async (id) => {
    if (!confirm('Supprimer définitivement ce document ?')) return
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
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const fileIcon = (mime) => {
    if (!mime) return '📄'
    if (mime.includes('pdf')) return '📕'
    if (mime.includes('image')) return '🖼️'
    if (mime.includes('word') || mime.includes('document')) return '📝'
    if (mime.includes('sheet') || mime.includes('excel')) return '📊'
    if (mime.includes('zip')) return '📦'
    return '📄'
}

onMounted(async () => {
    await Promise.all([fetchDocuments(), fetchLogs()])
    loading.value = false
})
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
            <a class="nav-item" @click="router.push('/dashboard')">
                <span class="nav-icon">📁</span> Mes fichiers
            </a>
            <a class="nav-item active">
                <span class="nav-icon">🛡️</span> Administration
            </a>
        </nav>

        <div class="sidebar-user">
            <div class="user-avatar">{{ user?.name?.charAt(0) }}</div>
            <div class="user-info">
                <div class="user-name">{{ user?.name }}</div>
                <div class="user-role">Admin</div>
            </div>
            <button class="btn-logout" @click="logout" title="Déconnexion">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="main">

        <!-- HEADER -->
        <div class="page-header">
            <div>
                <h1>Administration</h1>
                <p class="page-sub">Vue globale de tous les documents et activités</p>
            </div>
        </div>

        <!-- STATS -->
        <div class="stats-row" v-if="stats">
            <div class="stat-card">
                <div class="stat-value">{{ documents.length }}</div>
                <div class="stat-label">Documents totaux</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ stats.total_logs }}</div>
                <div class="stat-label">Logs totaux</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">{{ stats.success_logs }}</div>
                <div class="stat-label">Actions réussies</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-value">{{ stats.failed_logs }}</div>
                <div class="stat-label">Actions échouées</div>
            </div>
        </div>

        <!-- TABS -->
        <div class="tabs">
            <button :class="['tab', activeTab === 'documents' && 'active']" @click="activeTab = 'documents'">
                📁 Documents ({{ documents.length }})
            </button>
            <button :class="['tab', activeTab === 'logs' && 'active']" @click="activeTab = 'logs'">
                📋 Logs d'activité ({{ logs.length }})
            </button>
        </div>

        <!-- TAB : DOCUMENTS -->
        <div v-if="activeTab === 'documents'">
            <div v-if="loading" class="loading">Chargement...</div>
            <div v-else-if="documents.length === 0" class="empty">Aucun document.</div>
            <div v-else class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Fichier</th>
                            <th>Propriétaire</th>
                            <th>Partagé avec</th>
                            <th>Taille</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="doc in documents" :key="doc.id">
                            <td>
                                <div class="file-cell">
                                    <span class="file-ico">{{ fileIcon(doc.mime_type) }}</span>
                                    <span class="file-name">{{ doc.name }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="user-cell">
                                    <span class="mini-avatar">{{ doc.user?.name?.charAt(0) }}</span>
                                    <div>
                                        <div class="cell-name">{{ doc.user?.name }}</div>
                                        <div class="cell-sub">{{ doc.user?.email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span v-if="!doc.shared_with?.length" class="cell-empty">—</span>
                                <div v-else class="shared-badges">
                                    <span class="badge" v-for="u in doc.shared_with" :key="u.id">
                                        {{ u.name }}
                                    </span>
                                </div>
                            </td>
                            <td class="cell-mono">{{ formatSize(doc.size) }}</td>
                            <td class="cell-date">{{ formatDate(doc.created_at) }}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="btn-icon" @click="downloadDocument(doc.id, doc.name)" title="Télécharger">⬇</button>
                                    <button class="btn-icon danger" @click="deleteDocument(doc.id)" title="Supprimer">🗑</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TAB : LOGS -->
        <div v-if="activeTab === 'logs'">
            <div v-if="loading" class="loading">Chargement...</div>
            <div v-else-if="logs.length === 0" class="empty">Aucun log.</div>
            <div v-else class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Statut</th>
                            <th>Action</th>
                            <th>Utilisateur</th>
                            <th>Description</th>
                            <th>IP</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in logs" :key="log.id">
                            <td>
                                <span :class="['status-dot', log.success ? 'ok' : 'fail']">
                                    {{ log.success ? '✓' : '✗' }}
                                </span>
                            </td>
                            <td><span class="action-tag">{{ log.action }}</span></td>
                            <td>
                                <div v-if="log.user" class="user-cell">
                                    <span class="mini-avatar">{{ log.user?.name?.charAt(0) }}</span>
                                    <div class="cell-name">{{ log.user?.name }}</div>
                                </div>
                                <span v-else class="cell-empty">Système</span>
                            </td>
                            <td class="cell-desc">{{ log.description || '—' }}</td>
                            <td class="cell-mono">{{ log.ip_address || '—' }}</td>
                            <td class="cell-date">{{ formatDate(log.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
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
.user-name { font-size: 13px; font-weight: 600; color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: #FFB400; text-transform: uppercase; letter-spacing: 0.5px; }

.btn-logout { background: none; border: none; color: #555; cursor: pointer; font-size: 16px; padding: 4px; }
.btn-logout:hover { color: #ff6b6b; }

/* MAIN */
.main {
    margin-left: 240px;
    flex: 1;
    padding: 36px 40px;
    min-width: 0;
}

.page-header { margin-bottom: 28px; }

h1 {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 4px;
}

.page-sub { font-size: 13px; color: #555; margin: 0; }

/* STATS */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
}

.stat-card {
    background: #111118;
    border: 1px solid #1e1e2e;
    border-radius: 10px;
    padding: 18px 20px;
}

.stat-card.success { border-color: rgba(80,200,120,0.2); }
.stat-card.danger { border-color: rgba(255,60,60,0.2); }

.stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    margin-bottom: 6px;
}

.stat-card.success .stat-value { color: #50c878; }
.stat-card.danger .stat-value { color: #ff6b6b; }

.stat-label { font-size: 12px; color: #555; }

/* TABS */
.tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 1px solid #1e1e2e;
}

.tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 10px 16px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: -1px;
}

.tab.active { color: #FFB400; border-bottom-color: #FFB400; }
.tab:hover:not(.active) { color: #aaa; }

.loading, .empty { color: #444; font-size: 14px; padding: 24px 0; }

/* TABLE */
.table-wrap { overflow-x: auto; }

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

thead tr {
    border-bottom: 1px solid #1e1e2e;
}

th {
    text-align: left;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    white-space: nowrap;
}

td {
    padding: 12px 14px;
    border-bottom: 1px solid #141420;
    vertical-align: middle;
}

tr:hover td { background: rgba(255,255,255,0.01); }

.file-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 220px;
}

.file-ico { font-size: 18px; flex-shrink: 0; }

.file-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #ccc;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.mini-avatar {
    width: 26px;
    height: 26px;
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

.cell-name { font-size: 13px; color: #ccc; }
.cell-sub { font-size: 11px; color: #444; }
.cell-empty { color: #333; }
.cell-mono { font-family: monospace; font-size: 12px; color: #666; }
.cell-date { font-size: 12px; color: #555; white-space: nowrap; }
.cell-desc { font-size: 12px; color: #666; max-width: 200px; }

.shared-badges { display: flex; flex-wrap: wrap; gap: 4px; }

.badge {
    background: rgba(255,180,0,0.1);
    color: #FFB400;
    border: 1px solid rgba(255,180,0,0.2);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    white-space: nowrap;
}

.action-btns { display: flex; gap: 6px; }

.btn-icon {
    background: #1a1a28;
    border: 1px solid #2a2a3a;
    border-radius: 6px;
    padding: 5px 9px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
}
.btn-icon:hover { background: #222238; }
.btn-icon.danger:hover { background: rgba(255,60,60,0.1); border-color: rgba(255,60,60,0.3); }

.status-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
}
.status-dot.ok { background: rgba(80,200,120,0.15); color: #50c878; }
.status-dot.fail { background: rgba(255,60,60,0.15); color: #ff6b6b; }

.action-tag {
    background: #1a1a28;
    border: 1px solid #2a2a3a;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    color: #888;
    font-family: monospace;
    white-space: nowrap;
}
</style>