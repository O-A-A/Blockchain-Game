import { createRouter, createWebHistory } from "vue-router";
import { useWalletStore } from "@/store/wallet";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/home",
      name: "Home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/coinlist",
      name: "CoinList",
      component: () => import("@/views/Coins/CoinListView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/coindeploy",
      name: "CoinDeploy",
      component: () => import("@/views/Coins/CreateCoinView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/coindetail/:addr",
      name: "CoinDetail",
      component: () => import("@/views/Coins/CoinDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/poollist",
      name: "PoolList",
      component: () => import("@/views/Pools/PoolListView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/poolcreate",
      name: "CreatePool",
      component: () => import("@/views/Pools/CreatePoolView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/pooldetail/:address",
      name: "PoolDetail",
      component: () => import("@/views/Pools/PoolDetailView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, from, next) => {
  const walletStore = useWalletStore();

  // 如果访问需要登录的页面但未登录，重定向到登录页
  if (to.meta.requiresAuth && !walletStore.isLoggedIn) {
    next("/login");
  }
  // 如果已登录但访问登录页，重定向到仪表板
  else if (to.path === "/login" && walletStore.isLoggedIn) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
