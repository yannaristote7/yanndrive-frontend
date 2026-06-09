import { ref } from 'vue'

const toasts = ref([])

let id = 0

export function useToast() {
    const add = (message, type = 'success', duration = 3000) => {
        const toast = { id: ++id, message, type }
        toasts.value.push(toast)
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== toast.id)
        }, duration)
    }

    return {
        toasts,
        success: (msg) => add(msg, 'success'),
        error: (msg) => add(msg, 'error'),
        info: (msg) => add(msg, 'info'),
    }
}