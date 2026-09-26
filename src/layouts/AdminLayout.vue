<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const sidebarOpen = ref(false)

const links = [
    { to: '/admin', label: "Vue d'ensemble", icon: '◧', exact: true },
    { to: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { to: '/admin/documents', label: 'Documents', icon: '📁' },
    { to: '/admin/domains', label: 'Domaines autorisés', icon: '🌐' },
    { to: '/admin/logs', label: "Logs d'activité", icon: '📋' },
]

const logout = async () => {
    try { await api.post('/api/logout') } catch { /* session déjà expirée */ }
    localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/')
}
</script>

<template>
<div class="min-h-screen bg-[#09090f] text-[#e0e0e0]" style="font-family:'DM Sans',sans-serif">

    <!-- OVERLAY mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>

    <!-- SIDEBAR -->
    <aside :class="[
        'bg-[#111118] border-r border-[#1e1e2e] flex flex-col p-5 fixed h-screen z-40 transition-transform duration-300 w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]">
        <div class="flex items-baseline gap-1 mb-2">
            <span class="font-black text-xl tracking-tight text-white" style="font-family:'Syne',sans-serif">
                <span class="text-[#FFB400]">Y</span>ANN
            </span>
            <span class="text-[10px] text-[#555] ml-1 tracking-[3px] uppercase">Drive</span>
        </div>
        <div class="text-[10px] text-[#FFB400] uppercase tracking-[2px] mb-8">Administration</div>

        <nav class="flex-1 space-y-1">
            <router-link v-for="l in links" :key="l.to" :to="l.to" @click="sidebarOpen = false" custom v-slot="{ href, navigate, isActive, isExactActive }">
                <a :href="href" @click="navigate"
                    :class="['flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        (l.exact ? isExactActive : isActive) ? 'bg-[rgba(255,180,0,0.1)] text-[#FFB400]' : 'text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc]']">
                    <span class="w-5 text-center">{{ l.icon }}</span> {{ l.label }}
                </a>
            </router-link>

            <div class="border-t border-[#1e1e2e] my-3"></div>
            <router-link to="/dashboard" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666] hover:bg-[#1a1a28] hover:text-[#ccc] transition-all">
                <span class="w-5 text-center">←</span> Mes fichiers
            </router-link>
        </nav>

        <div class="flex items-center gap-2.5 p-3 bg-[#0d0d14] rounded-xl border border-[#1e1e2e]">
            <div class="w-8 h-8 bg-[#FFB400] text-black rounded-full flex items-center justify-center font-bold text-sm shrink-0">{{ user?.name?.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-[#ddd] truncate">{{ user?.name }}</div>
                <div class="text-[10px] text-[#FFB400] uppercase tracking-wide">Admin</div>
            </div>
            <button @click="logout" title="Déconnexion" class="text-[#555] hover:text-red-400 transition-colors text-base ml-1">↩</button>
        </div>
    </aside>

    <!-- MAIN -->
    <main class="lg:ml-64 min-w-0">
        <div class="lg:hidden flex items-center justify-between px-4 py-3 bg-[#111118] border-b border-[#1e1e2e] sticky top-0 z-20">
            <button @click="sidebarOpen = true" class="text-[#aaa] hover:text-white text-xl">☰</button>
            <span class="font-black text-lg text-white" style="font-family:'Syne',sans-serif"><span class="text-[#FFB400]">Y</span>ANN</span>
            <button @click="logout" class="text-[#555] hover:text-red-400 transition-colors">↩</button>
        </div>

        <div class="p-4 sm:p-6 lg:p-10 max-w-7xl">
            <router-view />
        </div>
    </main>
</div>
</template>
