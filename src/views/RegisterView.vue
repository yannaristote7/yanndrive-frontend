<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
    error.value = ''
    loading.value = true
    try {
        const res = await api.post('/api/register', {
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        })
        localStorage.setItem('token', res.data.token)

        const userRes = await api.get('/api/user')
        localStorage.setItem('user', JSON.stringify(userRes.data))

        router.push('/dashboard')
    } catch (e) {
        const errors = e.response?.data?.errors
        if (errors) {
            error.value = Object.values(errors).flat().join(' — ')
        } else {
            error.value = e.response?.data?.message || 'Erreur lors de l\'inscription'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
<div class="auth-page">
    <div class="auth-card">
        <div class="auth-logo">
            <span class="logo-y">Y</span>AMS
            <span class="logo-sub">Drive</span>
        </div>

        <h2>Créer un compte</h2>
        <p class="subtitle">Domaines autorisés : yamslogistics.com, yamsgroup.com, yamscorporate.com</p>

        <div v-if="error" class="alert-error">{{ error }}</div>

        <div class="field">
            <label>Nom complet</label>
            <input v-model="name" type="text" placeholder="Jean Dupont" />
        </div>

        <div class="field">
            <label>Email professionnel</label>
            <input v-model="email" type="email" placeholder="vous@yamslogistics.com" />
        </div>

        <div class="field">
            <label>Mot de passe</label>
            <input v-model="password" type="password" placeholder="8 caractères minimum" />
        </div>

        <div class="field">
            <label>Confirmer le mot de passe</label>
            <input v-model="passwordConfirmation" type="password" placeholder="••••••••" @keyup.enter="register" />
        </div>

        <button class="btn-primary" @click="register" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Créer le compte</span>
        </button>

        <p class="auth-link">
            Déjà un compte ?
            <router-link to="/login">Se connecter</router-link>
        </p>
    </div>
</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.auth-page {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.07) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(255,100,0,0.05) 0%, transparent 50%);
}

.auth-card {
    background: #111118;
    border: 1px solid #222230;
    border-radius: 16px;
    padding: 48px 40px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}

.auth-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 28px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.logo-y { color: #FFB400; }

.logo-sub {
    font-size: 14px;
    font-weight: 400;
    color: #666;
    margin-left: 4px;
    letter-spacing: 2px;
    text-transform: uppercase;
}

h2 {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
}

.subtitle {
    font-size: 12px;
    color: #555;
    margin: 0 0 24px;
    line-height: 1.5;
}

.alert-error {
    background: rgba(255,60,60,0.1);
    border: 1px solid rgba(255,60,60,0.3);
    color: #ff6b6b;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
}

.field { margin-bottom: 16px; }

label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
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
    box-sizing: border-box;
}

input:focus { outline: none; border-color: #FFB400; }
input::placeholder { color: #444; }

.btn-primary {
    width: 100%;
    background: #FFB400;
    color: #0a0a0f;
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary:hover:not(:disabled) { background: #ffc933; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.auth-link {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #555;
}

.auth-link a { color: #FFB400; text-decoration: none; font-weight: 500; }
.auth-link a:hover { text-decoration: underline; }
</style>