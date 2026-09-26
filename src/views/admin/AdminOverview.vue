<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'
import { formatSize, formatDate, apiError } from '@/utils/format'

const toast = useToast()
const stats = ref(null)

onMounted(async () => {
    try { stats.value = (await api.get('/api/admin/stats')).data }
    catch (e) { toast.error(apiError(e, 'Erreur de chargement des statistiques')) }
})
</script>

<template>
<div>
    <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">Vue d'ensemble</h1>
        <p class="text-xs text-[#555]">Activité et utilisation de YANN Drive</p>
    </div>

    <div v-if="!stats" class="text-[#444] text-sm py-6">Chargement...</div>

    <template v-else>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
            <router-link to="/admin/users" class="bg-[#111118] border border-[#1e1e2e] hover:border-[#2e2e44] rounded-xl p-4 transition-all">
                <div class="text-2xl sm:text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ stats.users }}</div>
                <div class="text-[11px] text-[#555]">Utilisateurs · {{ stats.admins }} admin{{ stats.admins > 1 ? 's' : '' }}</div>
                <div v-if="stats.new_users_7d" class="text-[10px] text-green-400 mt-1">+{{ stats.new_users_7d }} cette semaine</div>
            </router-link>
            <router-link to="/admin/documents" class="bg-[#111118] border border-[#1e1e2e] hover:border-[#2e2e44] rounded-xl p-4 transition-all">
                <div class="text-2xl sm:text-3xl font-black text-white mb-1" style="font-family:'Syne',sans-serif">{{ stats.documents }}</div>
                <div class="text-[11px] text-[#555]">Documents</div>
            </router-link>
            <div class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                <div class="text-2xl sm:text-3xl font-black text-[#FFB400] mb-1" style="font-family:'Syne',sans-serif">{{ formatSize(stats.storage_used) }}</div>
                <div class="text-[11px] text-[#555]">Stockage utilisé</div>
            </div>
            <router-link to="/admin/logs" :class="['bg-[#111118] border rounded-xl p-4 transition-all', stats.logs_failed_7d ? 'border-red-500/30 hover:border-red-500/50' : 'border-[#1e1e2e] hover:border-[#2e2e44]']">
                <div :class="['text-2xl sm:text-3xl font-black mb-1', stats.logs_failed_7d ? 'text-red-400' : 'text-white']" style="font-family:'Syne',sans-serif">{{ stats.logs_failed_7d }}</div>
                <div class="text-[11px] text-[#555]">Échecs (7 derniers jours)</div>
            </router-link>
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
            <section class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
                <h2 class="text-sm font-semibold text-white mb-4">Plus gros consommateurs de stockage</h2>
                <div v-if="!stats.top_users.length" class="text-[#444] text-xs">Aucun utilisateur.</div>
                <div v-for="u in stats.top_users" :key="u.id" class="flex items-center gap-3 py-2 border-b border-[#141420] last:border-0">
                    <div class="w-7 h-7 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">{{ u.name?.charAt(0) }}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-[#ccc] truncate">{{ u.name }}</div>
                        <div class="text-[10px] text-[#444] truncate">{{ u.documents_count }} fichier{{ u.documents_count > 1 ? 's' : '' }}</div>
                    </div>
                    <div class="font-mono text-xs text-[#888]">{{ formatSize(u.documents_sum_size) }}</div>
                </div>
            </section>

            <section class="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-sm font-semibold text-white">Activité récente</h2>
                    <router-link to="/admin/logs" class="text-[11px] text-[#FFB400] hover:underline">Tout voir →</router-link>
                </div>
                <div v-if="!stats.recent_logs.length" class="text-[#444] text-xs">Aucune activité.</div>
                <div v-for="log in stats.recent_logs" :key="log.id" class="flex items-start gap-3 py-2 border-b border-[#141420] last:border-0">
                    <span :class="['inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shrink-0 mt-0.5', log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400']">{{ log.success ? '✓' : '✗' }}</span>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-[#ccc] truncate">{{ log.description || log.action }}</div>
                        <div class="text-[10px] text-[#444]">{{ log.user?.name || 'Système' }} · {{ formatDate(log.created_at) }}</div>
                    </div>
                </div>
            </section>
        </div>
    </template>
</div>
</template>
