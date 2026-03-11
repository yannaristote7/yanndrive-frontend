import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layout
import MainLayout from '@/layouts/MainLayout.vue'

// Views
import WelcomeView from '@/views/WelcomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import ActivityLogsView from '@/views/ActivityLogsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // =========================
    // LANDING PAGE
    // =========================
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
    },

    // =========================
    // PUBLIC
    // =========================
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
    },

    {
      path: '/public/share/:token',
      name: 'public-share',
      component: () => import('@/views/PublicShareView.vue')
    },

    // =========================
    // ZONE PROTÉGÉE (LAYOUT)
    // =========================
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'admin',
          name: 'admin',
          component: AdminDashboardView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'logs',
          name: 'logs',
          component: ActivityLogsView,
        },
      ],
    },

    // =========================
    // 404
    // =========================
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

/**
 * =========================
 * ROUTE GUARD GLOBAL
 * =========================
 */
router.beforeEach(async (to, from, next) => {

  const auth = useAuthStore()

  // Si token existe mais user pas chargé
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser()
    } catch (error) {
      auth.logout()
      return next('/login')
    }
  }

  // Route protégée
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  // Route admin
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/dashboard')
  }

  // Route guest
  if (to.meta.guest && auth.isAuthenticated) {
    return next('/dashboard')
  }

  next()
})

export default router