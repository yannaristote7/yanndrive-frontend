import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'



const routes = [
    { path: '/', component: () => import('@/views/WelcomeView.vue') },
    { path: '/login', component: LoginView, meta: { guest: true } },
    { path: '/register', component: RegisterView, meta: { guest: true } },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/share/:token', component: () => import('@/views/PublicShareView.vue') },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            { path: '', component: () => import('@/views/admin/AdminOverview.vue') },
            { path: 'users', component: () => import('@/views/admin/AdminUsers.vue') },
            { path: 'documents', component: () => import('@/views/admin/AdminDocuments.vue') },
            { path: 'domains', component: () => import('@/views/admin/AdminDomains.vue') },
            { path: 'logs', component: () => import('@/views/admin/AdminLogs.vue') },
        ]
    }
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