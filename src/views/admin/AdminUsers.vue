<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'
import { formatSize, formatDate, apiError } from '@/utils/format'
import AdminPagination from '@/components/admin/AdminPagination.vue'

const toast = useToast()
const me = JSON.parse(localStorage.getItem('user') || 'null')

const users = ref([])
const roles = ref([])
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const roleFilter = ref('')
const loading = ref(true)

// Modale création / édition
const modal = ref(false)
const editing = ref(null)
const form = ref({})
const saving = ref(false)

const fetchUsers = async (p = page.value) => {
    loading.value = true
    try {
        const { data } = await api.get('/api/admin/users', { params: { page: p, search: search.value || undefined, role: roleFilter.value || undefined } })
        users.value = data.data
        page.value = data.current_page
        lastPage.value = data.last_page
        total.value = data.total
    } catch (e) { toast.error(apiError(e)) }
    finally { loading.value = false }
}

let searchTimer
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchUsers(1), 300) })
watch(roleFilter, () => fetchUsers(1))

const openCreate = () => {
    editing.value = null
    form.value = { name: '', email: '', password: '', role_id: roles.value.find(r => r.name === 'user')?.id ?? '' }
    modal.value = true
}
const openEdit = (u) => {
    editing.value = u
    form.value = { name: u.name, email: u.email, password: '', role_id: u.role_id }
    modal.value = true
}

const save = async () => {
    saving.value = true
    try {
        if (editing.value) {
            const payload = { ...form.value }
            if (!payload.password) delete payload.password
            await api.patch(`/api/admin/users/${editing.value.id}`, payload)
            toast.success('Utilisateur mis à jour')
        } else {
            await api.post('/api/admin/users', form.value)
            toast.success('Utilisateur créé')
        }
        modal.value = false
        await fetchUsers()
    } catch (e) { toast.error(apiError(e)) }
    finally { saving.value = false }
}

const remove = async (u) => {
    if (!confirm(`Supprimer ${u.name} (${u.email}) ?\nSes ${u.documents_count} document(s) seront définitivement supprimés.`)) return
    try {
        await api.delete(`/api/admin/users/${u.id}`)
        toast.success('Utilisateur supprimé')
        await fetchUsers(users.value.length === 1 && page.value > 1 ? page.value - 1 : page.value)
    } catch (e) { toast.error(apiError(e)) }
}

const revoke = async (u) => {
    if (!confirm(`Déconnecter ${u.name} de toutes ses sessions ?`)) return
    try {
        const { data } = await api.post(`/api/admin/users/${u.id}/revoke-tokens`)
        toast.success(data.message)
        await fetchUsers()
    } catch (e) { toast.error(apiError(e)) }
}

onMounted(async () => {
    try { roles.value = (await api.get('/api/admin/roles')).data } catch (e) { toast.error(apiError(e)) }
    await fetchUsers(1)
})
</script>

<template>
<div>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
            <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Utilisateurs</h1>
            <p class="text-xs text-[#555]">Comptes, rôles et sessions</p>
        </div>
        <button @click="openCreate" class="bg-[#FFB400] hover:bg-[#ffc433] text-black font-semibold text-sm rounded-lg px-4 py-2.5 transition-all">+ Nouvel utilisateur</button>
    </div>

    <div class="flex flex-col sm:flex-row gap-2 mb-4">
        <input v-model="search" type="search" placeholder="Rechercher par nom ou email…"
            class="flex-1 bg-[#111118] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd] placeholder-[#444]">
        <select v-model="roleFilter" class="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#ddd] outline-none">
            <option value="">Tous les rôles</option>
            <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
        </select>
    </div>

    <div v-if="loading && !users.length" class="text-[#444] text-sm py-6">Chargement...</div>
    <div v-else-if="!users.length" class="text-[#444] text-sm py-6">Aucun utilisateur.</div>

    <div v-else :class="['bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-x-auto transition-opacity', loading && 'opacity-50']">
        <table class="w-full text-[13px]">
            <thead class="border-b border-[#1e1e2e]">
                <tr class="text-left text-[10px] font-semibold text-[#444] uppercase tracking-[1px]">
                    <th class="px-4 py-3">Utilisateur</th>
                    <th class="px-4 py-3">Rôle</th>
                    <th class="px-4 py-3 hidden md:table-cell">Fichiers</th>
                    <th class="px-4 py-3 hidden md:table-cell">Sessions</th>
                    <th class="px-4 py-3 hidden lg:table-cell">Inscrit le</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="u in users" :key="u.id" class="border-b border-[#141420] last:border-0 hover:bg-white/[0.01]">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-xs shrink-0">{{ u.name?.charAt(0) }}</div>
                            <div class="min-w-0">
                                <div class="text-[#ddd] truncate">{{ u.name }} <span v-if="u.id === me?.id" class="text-[10px] text-[#555]">(vous)</span></div>
                                <div class="text-[11px] text-[#555] truncate">{{ u.email }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span :class="['rounded px-2 py-0.5 text-[10px] uppercase tracking-wide border',
                            u.role?.name === 'admin' ? 'bg-[rgba(255,180,0,0.1)] text-[#FFB400] border-[rgba(255,180,0,0.25)]' : 'bg-[#1a1a28] text-[#888] border-[#2a2a3a]']">
                            {{ u.role?.name || 'aucun' }}
                        </span>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell text-xs text-[#888]">{{ u.documents_count }} · <span class="font-mono">{{ formatSize(u.documents_sum_size) }}</span></td>
                    <td class="px-4 py-3 hidden md:table-cell text-xs text-[#888]">{{ u.tokens_count }}</td>
                    <td class="px-4 py-3 hidden lg:table-cell text-[11px] text-[#555] whitespace-nowrap">{{ formatDate(u.created_at) }}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-1 justify-end">
                            <button @click="openEdit(u)" title="Modifier" class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded px-2 py-1 text-xs transition-all">✏️</button>
                            <button @click="revoke(u)" :disabled="!u.tokens_count" title="Révoquer les sessions"
                                class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded px-2 py-1 text-xs transition-all disabled:opacity-30">🔌</button>
                            <button @click="remove(u)" :disabled="u.id === me?.id" title="Supprimer"
                                class="bg-[#1a1a28] border border-[#2a2a3a] hover:bg-red-500/10 hover:border-red-500/30 rounded px-2 py-1 text-xs transition-all disabled:opacity-30">🗑</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <AdminPagination :page="page" :last-page="lastPage" :total="total" @change="fetchUsers" />

    <!-- MODALE -->
    <div v-if="modal" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" @click.self="modal = false">
        <form @submit.prevent="save" class="bg-[#111118] border border-[#222230] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 class="text-lg font-bold text-white" style="font-family:'Syne',sans-serif">{{ editing ? 'Modifier l’utilisateur' : 'Nouvel utilisateur' }}</h2>

            <label class="block">
                <span class="text-[11px] text-[#666] uppercase tracking-wide">Nom</span>
                <input v-model="form.name" required class="mt-1 w-full bg-[#0d0d14] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd]">
            </label>
            <label class="block">
                <span class="text-[11px] text-[#666] uppercase tracking-wide">Email</span>
                <input v-model="form.email" type="email" required class="mt-1 w-full bg-[#0d0d14] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd]">
            </label>
            <label class="block">
                <span class="text-[11px] text-[#666] uppercase tracking-wide">Mot de passe {{ editing ? '(laisser vide pour ne pas changer)' : '' }}</span>
                <input v-model="form.password" type="password" :required="!editing" minlength="8" autocomplete="new-password"
                    class="mt-1 w-full bg-[#0d0d14] border border-[#1e1e2e] focus:border-[#FFB400]/50 outline-none rounded-lg px-3 py-2 text-sm text-[#ddd]">
                <span class="text-[10px] text-[#444]">8 caractères minimum, avec lettres et chiffres.</span>
            </label>
            <label class="block">
                <span class="text-[11px] text-[#666] uppercase tracking-wide">Rôle</span>
                <select v-model="form.role_id" required :disabled="editing?.id === me?.id"
                    class="mt-1 w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#ddd] outline-none disabled:opacity-50">
                    <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                </select>
            </label>
            <p v-if="editing" class="text-[10px] text-[#555]">Un changement de rôle ou de mot de passe déconnecte l’utilisateur de toutes ses sessions.</p>

            <div class="flex gap-2 pt-2">
                <button type="button" @click="modal = false" class="flex-1 bg-[#1a1a28] border border-[#2a2a3a] hover:bg-[#222238] rounded-lg py-2.5 text-sm transition-all">Annuler</button>
                <button type="submit" :disabled="saving" class="flex-1 bg-[#FFB400] hover:bg-[#ffc433] text-black font-semibold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">
                    {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
            </div>
        </form>
    </div>
</div>
</template>
