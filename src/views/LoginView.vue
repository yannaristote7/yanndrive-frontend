<template>
  <div class="auth-container d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-lg">
      
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary">YamsDrive</h2>
        <p class="text-muted">Connexion à votre espace sécurisé</p>
      </div>

      <form @submit.prevent="handleLogin">

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input 
            type="email"
            v-model="form.email"
            class="form-control"
            placeholder="exemple@email.com"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Mot de passe</label>
          <input 
            type="password"
            v-model="form.password"
            class="form-control"
            placeholder="********"
            required
          />
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Se connecter
        </button>

      </form>

      <div class="text-center mt-3">
        <small>
          Pas de compte ?
          <router-link to="/register">Créer un compte</router-link>
        </small>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()

const form = reactive({
  email: "",
  password: ""
})

const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    await auth.login(form)
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur de connexion"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px;
  border-radius: 16px;
}
</style>