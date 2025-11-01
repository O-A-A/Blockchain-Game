import { createRouter, createWebHistory } from 'vue-router'
import { useWalletStore } from '@/store/wallet'
import connectionService from '@/services/connectionService'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/home',
            name: 'Home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/RegisterView.vue')
        },
        {
            path: '/send',
            name: 'Send',
            component: () => import('@/views/SendView.vue')
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/LoginView.vue')
        },
        {
            path: '/recover-wallet',
            name: 'RecoverWallet',
            component: () => import('@/views/RecoverWalletView.vue')
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('@/views/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/coinlist',
            name: 'CoinList',
            component: () => import('@/views/Coins/CoinListView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/coindeploy',
            name: 'CoinDeploy',
            component: () => import('@/views/Coins/CreateCoinView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/coindetail/:addr',
            name: 'CoinDetail',
            component: () => import('@/views/Coins/CoinDetailView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/poollist',
            name: 'PoolList',
            component: () => import('@/views/Pools/PoolListView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/poolcreate',
            name: 'CreatePool',
            component: () => import('@/views/Pools/CreatePoolView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/pooldetail/:address',
            name: 'PoolDetail',
            component: () => import('@/views/Pools/PoolDetailView.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, from, next) => {
    const walletStore = useWalletStore()

    // 尝试从 sessionStorage 恢复区块链连接
    if (!connectionService.isConnected()) {
        const restored = await connectionService.restoreFromSession()

        if (restored) {
            // 恢复钱包状态
            const address = connectionService.getAddress()
            if (address) {
                walletStore.setAddress(address)
                walletStore.setLoggedIn(true)
            }
        } else {
            // 尝试从localStorage恢复登录状态（仅显示状态，不恢复连接）
            if (!walletStore.isLoggedIn) {
                const savedAddress = localStorage.getItem('walletAddress')
                const savedNodeUrl = localStorage.getItem('nodeUrl')

                if (savedAddress && savedNodeUrl) {
                    // 有保存的登录信息，设置为已登录状态
                    walletStore.setAddress(savedAddress)
                    walletStore.setLoggedIn(true)
                }
            }
        }
    }

    // 如果访问需要登录的页面但未登录，重定向到登录页
    if (to.meta.requiresAuth && !walletStore.isLoggedIn) {
        next('/login')
    }
    // 如果已登录但访问登录页，重定向到仪表板
    else if (to.path === '/login' && walletStore.isLoggedIn) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router 