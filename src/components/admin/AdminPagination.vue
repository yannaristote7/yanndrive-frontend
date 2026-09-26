<script setup>
defineProps({ page: { type: Number, required: true }, lastPage: { type: Number, required: true }, total: { type: Number, default: null } })
defineEmits(['change'])
</script>

<template>
<div v-if="lastPage > 1 || total !== null" class="flex items-center justify-between mt-4 text-xs text-[#555]">
    <span v-if="total !== null">{{ total }} résultat{{ total > 1 ? 's' : '' }}</span>
    <span v-else></span>
    <div v-if="lastPage > 1" class="flex items-center gap-2">
        <button :disabled="page <= 1" @click="$emit('change', page - 1)"
            class="px-3 py-1.5 rounded-lg bg-[#1a1a28] border border-[#2a2a3a] disabled:opacity-30 hover:bg-[#222238] transition-all">‹</button>
        <span>Page {{ page }} / {{ lastPage }}</span>
        <button :disabled="page >= lastPage" @click="$emit('change', page + 1)"
            class="px-3 py-1.5 rounded-lg bg-[#1a1a28] border border-[#2a2a3a] disabled:opacity-30 hover:bg-[#222238] transition-all">›</button>
    </div>
</div>
</template>
