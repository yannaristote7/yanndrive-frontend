<template>
  <div class="auth-container d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-lg">

      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary">YamsDrive</h2>
        <p class="text-muted">Créer un compte sécurisé</p>
      </div>

      <form @submit.prevent="handleRegister">

        <div class="mb-3">
          <label class="form-label">Nom</label>
          <input 
            type="text"
            v-model="form.name"
            class="form-control"
            placeholder="Votre nom"
            required
          />
        </div>

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

        <div class="mb-3">
          <label class="form-label">Confirmer mot de passe</label>
          <input 
            type="password"
            v-model="form.password_confirmation"
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
          class="btn btn-success w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Créer mon compte
        </button>

      </form>

      <div class="text-center mt-3">
        <small>
          Déjà inscrit ?
          <router-link to="/login">Se connecter</router-link>
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
  name: "",
  email: "",
  password: "",
  password_confirmation: ""
})

const loading = ref(false)
const error = ref(null)

const handleRegister = async () => {
  error.value = null
  loading.value = true

  if (form.password !== form.password_confirmation) {
    error.value = "Les mots de passe ne correspondent pas"
    loading.value = false
    return
  }

  try {
    await auth.register(form)
  } catch (err) {
    error.value = err.response?.data?.message || "Erreur d'inscription"
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
  max-width: 450px;
  background: white;
  padding: 40px;
  border-radius: 16px;
}
</style>