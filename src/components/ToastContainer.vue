<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>

<template>
<div class="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id"
            :class="[
                'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl min-w-[280px] max-w-[360px]',
                toast.type === 'success' && 'bg-[#111118] border-green-500/30 text-green-400',
                toast.type === 'error'   && 'bg-[#111118] border-red-500/30 text-red-400',
                toast.type === 'info'    && 'bg-[#111118] border-[#FFB400]/30 text-[#FFB400]',
            ]">
            <span class="text-base shrink-0">
                {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
            </span>
            <span class="flex-1">{{ toast.message }}</span>
        </div>
    </transition-group>
</div>
</template>

<style>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(20px); }
</style>