export const formatSize = (b) => {
    if (!b) return '—'
    if (b < 1024) return b + ' B'
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
    if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'
    return (b / 1073741824).toFixed(2) + ' GB'
}

export const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const fileIcon = (m) => {
    if (!m) return '📄'
    if (m.includes('pdf')) return '📕'
    if (m.includes('image')) return '🖼️'
    if (m.includes('word') || m.includes('document')) return '📝'
    if (m.includes('sheet') || m.includes('excel')) return '📊'
    if (m.includes('zip')) return '📦'
    return '📄'
}

// Premier message d'erreur renvoyé par Laravel (validation 422 ou message simple)
export const apiError = (e, fallback = 'Une erreur est survenue') => {
    const data = e.response?.data
    const firstField = data?.errors && Object.values(data.errors)[0]
    return firstField?.[0] || data?.message || fallback
}
