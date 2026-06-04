import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminView from '@/views/AdminView.vue'


const routes = [
    { path: '/', component: () => import('@/views/WelcomeView.vue') },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/register', component: RegisterView, meta: { guest: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/share/:token', component: () => import('@/views/PublicShareView.vue') }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const isAdmin = user?.role?.name === 'admin'

    if (to.meta.guest && token) {
        return isAdmin ? '/admin' : '/dashboard'
    }

    if (to.meta.requiresAuth && !token) {
        return '/login'
    }

    if (to.meta.requiresAdmin && !isAdmin) {
        return '/dashboard'
    }

    return true
})

export default router