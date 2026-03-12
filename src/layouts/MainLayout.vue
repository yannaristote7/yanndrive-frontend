<template>
  <div class="app-wrapper d-flex">

    <!-- Sidebar -->
    <aside class="sidebar p-3">
      <h4 class="text-white fw-bold mb-4">YamsDrive</h4>

      <ul class="nav flex-column">

        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link">
            📂 Mes Documents
          </router-link>
        </li>

        <li class="nav-item" v-if="auth.isAdmin">
          <router-link to="/admin" class="nav-link">
            📊 Admin Dashboard
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/logs" class="nav-link">
            📜 Activités
          </router-link>
        </li>

      </ul>

      <div class="mt-auto pt-4">
        <button @click="auth.logout()" class="btn btn-outline-light w-100">
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-content flex-grow-1">

      <!-- Navbar -->
      <nav class="navbar navbar-light bg-white shadow-sm px-4">
        <div>
          <strong>Bienvenue {{ auth.user?.name }}</strong>
        </div>

        <div>
          <span class="badge bg-primary">
            {{ auth.user?.role?.name }}
          </span>
        </div>
      </nav>

      <!-- Dynamic page -->
      <div class="p-4">
        <router-view />
      </div>

    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
</script>

<style scoped>
.app-wrapper {
min-height:100vh;
display:flex;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1e3c72, #2a5298);
  display: flex;
  flex-direction: column;
}

.sidebar .nav-link {
  color: white;
  margin-bottom: 10px;
  border-radius: 8px;
  padding: 8px 12px;
}

.sidebar .nav-link.router-link-active {
  background-color: rgba(255,255,255,0.2);
}

.main-content{
flex:1;
background:#f5f7fa;
}
</style>