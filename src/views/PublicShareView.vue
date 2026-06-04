<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const state = ref('loading')   // loading | password | downloading | error
const errorMsg = ref('')
const password = ref('')
const loading = ref(false)

// Reconstruit l'URL signée complète depuis les query params
const buildUrl = (pwd = null) => {
    const base = `http://localhost:8000/api/public/share/${route.params.token}`
    const params = new URLSearchParams()

    // Recopie les params de signature (expires, signature)
    if (route.query.expires)   params.append('expires', route.query.expires)
    if (route.query.signature) params.append('signature', route.query.signature)
    if (pwd)                   params.append('password', pwd)

    return `${base}?${params.toString()}`
}

const tryAccess = async (pwd = null) => {
    loading.value = true
    try {
        const res = await fetch(buildUrl(pwd))

        if (res.status === 403) {
            const data = await res.json()
            if (data.message === 'Password incorrect') {
                state.value = 'password'
                if (pwd) errorMsg.value = 'Mot de passe incorrect, réessayez.'
            } else if (data.message === 'Link expired') {
                state.value = 'error'
                errorMsg.value = 'Ce lien a expiré.'
            } else {
                state.value = 'error'
                errorMsg.value = data.message || 'Accès refusé.'
            }
            return
        }

        if (res.status === 404) {
            state.value = 'error'
            errorMsg.value = 'Lien invalide ou introuvable.'
            return
        }

        if (!res.ok) {
            state.value = 'error'
            errorMsg.value = 'Une erreur est survenue.'
            return
        }

        // Succès → télécharge le fichier
        state.value = 'downloading'
        const blob = await res.blob()
        const contentDisposition = res.headers.get('Content-Disposition')
        let filename = 'document'
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (match) filename = match[1].replace(/['"]/g, '')
        }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)

    } catch (e) {
        state.value = 'error'
        errorMsg.value = 'Impossible de contacter le serveur.'
    } finally {
        loading.value = false
    }
}

const submitPassword = () => {
    if (!password.value) return
    errorMsg.value = ''
    tryAccess(password.value)
}

onMounted(() => {
    tryAccess()
})
</script>

<template>
<div class="share-page">
    <div class="share-card">

        <div class="logo">
            <span class="logo-y">Y</span>AMS
            <span class="logo-sub">Drive</span>
        </div>

        <!-- LOADING -->
        <div v-if="state === 'loading'" class="state-block">
            <div class="big-spinner"></div>
            <p>Vérification du lien...</p>
        </div>

        <!-- MOT DE PASSE REQUIS -->
        <div v-else-if="state === 'password'" class="state-block">
            <div class="state-icon">🔒</div>
            <h2>Document protégé</h2>
            <p>Ce document est protégé par un mot de passe.</p>

            <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

            <div class="field">
                <label>Mot de passe</label>
                <input
                    v-model="password"
                    type="password"
                    placeholder="Entrez le mot de passe"
                    @keyup.enter="submitPassword"
                    autofocus
                />
            </div>

            <button class="btn-primary" @click="submitPassword" :disabled="loading || !password">
                <span v-if="loading" class="spinner"></span>
                <span v-else>Accéder au document</span>
            </button>
        </div>

        <!-- TÉLÉCHARGEMENT EN COURS -->
        <div v-else-if="state === 'downloading'" class="state-block">
            <div class="state-icon success">✓</div>
            <h2>Téléchargement lancé !</h2>
            <p>Votre document est en cours de téléchargement.</p>
        </div>

        <!-- ERREUR -->
        <div v-else-if="state === 'error'" class="state-block">
            <div class="state-icon error">✕</div>
            <h2>Accès impossible</h2>
            <p>{{ errorMsg }}</p>
        </div>

        <div class="footer-note">
            Partagé via <strong>YAMS Drive</strong>
        </div>

    </div>
</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { box-sizing: border-box; }

.share-page {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 20px;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.07) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%);
}

.share-card {
    background: #111118;
    border: 1px solid #222230;
    border-radius: 16px;
    padding: 48px 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
    text-align: center;
}

.logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #fff;
    margin-bottom: 36px;
    display: flex;
    align-items: baseline;
    justify-content: center;
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

.state-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.state-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(255,180,0,0.1);
    border: 1px solid rgba(255,180,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 4px;
}

.state-icon.success {
    background: rgba(80,200,120,0.1);
    border-color: rgba(80,200,120,0.2);
    color: #50c878;
    font-size: 28px;
    font-weight: 700;
}

.state-icon.error {
    background: rgba(255,60,60,0.1);
    border-color: rgba(255,60,60,0.2);
    color: #ff6b6b;
    font-size: 28px;
    font-weight: 700;
}

h2 {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

p { font-size: 14px; color: #555; margin: 0; line-height: 1.6; }

.alert-error {
    background: rgba(255,60,60,0.1);
    border: 1px solid rgba(255,60,60,0.3);
    color: #ff6b6b;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    width: 100%;
    text-align: left;
}

.field {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
}

label {
    font-size: 11px;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

input {
    width: 100%;
    background: #0d0d14;
    border: 1px solid #222230;
    border-radius: 8px;
    padding: 12px 16px;
    color: #fff;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
}
input:focus { outline: none; border-color: #FFB400; }
input::placeholder { color: #333; }

.btn-primary {
    width: 100%;
    background: #FFB400;
    color: #000;
    border: none;
    border-radius: 8px;
    padding: 13px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: #ffc933; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.big-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #1e1e2e;
    border-top-color: #FFB400;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 8px;
}

.spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.footer-note {
    margin-top: 32px;
    font-size: 12px;
    color: #333;
}
</style>
