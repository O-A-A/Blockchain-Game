<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from './store/wallet'
import { useTheme } from 'vuetify'
import DialogMessage from './components/DialogMessage.vue'
import contractScanService from './services/contractScanService'
import connectionService from './services/connectionService'
import { useDialog } from './composables/useDialog'
import { formatAddress } from './utils/formatters'

const drawer = ref(false)
const theme = useTheme()
const router = useRouter()
const walletStore = useWalletStore()
const { success, error } = useDialog()

// 扫描状态
const isScanning = ref(false)

// 暗黑模式
const isDarkTheme = computed(() => theme.global.current.value.dark)

// 切换主题
const toggleTheme = () => {
  theme.global.name.value = isDarkTheme.value ? 'light' : 'dark'
}

// 扫描区块链
const scanBlockchain = async () => {
  if (isScanning.value) return
  
  isScanning.value = true
  
  try {
    const foundContracts = await contractScanService.scanContracts(
      undefined,
      undefined,
      (current, total, found) => {
        // 可以在控制台显示进度，或使用全局状态
        // 扫描进度更新
      }
    )
    
    success('扫描完成', `共发现 ${foundContracts.length} 个合约（代币和池子）`)
  } catch (err: any) {
    console.error('扫描失败:', err)
    error('扫描失败', err.message || '未知错误')
  } finally {
    isScanning.value = false
  }
}

// 使用统一的格式化工具函数（已从 utils/formatters 导入）

// 复制地址到剪贴板
const copyAddress = () => {
  if (walletStore.address) {
    navigator.clipboard.writeText(walletStore.address)
      .then(() => {
        success('复制成功', '地址已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制失败：', err)
        error('复制失败', '无法复制地址')
      })
  } else {
     error('复制失败', '没有可复制的地址')
  }
}

// 登出
const logout = () => {
  // 断开连接
  connectionService.disconnect()
  // 重置钱包状态
  walletStore.resetWalletState()
  
  router.push('/login')
}

// 初始化钱包 - 检查是否有保存的登录信息并恢复连接
onMounted(async () => {
  try {
    // 初始化钱包状态（会尝试恢复连接）
    await walletStore.init()
    
  } catch (error) {
    console.error('钱包初始化失败:', error)
    // 如果恢复失败，清除会话数据并跳转到登录页
    sessionStorage.clear()
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  }
})
</script>

<template>
  <v-app>
    <!-- 顶部应用栏 -->
    <v-app-bar flat height="64">
      <v-container class="d-flex align-center px-4 py-0 mx-auto">
        <div class="d-flex align-center" style="cursor: pointer" @click="$router.push('/home')">
          <img src="@/assets/logo.png" alt="Logo" class="mr-3" style="width: 32px; height: 32px;">
          <v-app-bar-title class="font-weight-bold text-body-1">BrokerFi Exchange</v-app-bar-title>
        </div>
        
        <!-- 桌面版导航 -->
        <div class="d-none d-md-flex ml-8">
          <v-tabs>
            <v-tab to="/home" class="text-body-2">
              <v-icon size="small" class="mr-1">mdi-home</v-icon>
              首页
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/dashboard" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-view-dashboard</v-icon>
              资产
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/coinlist" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-currency-usd</v-icon>
              代币列表
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/poollist" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-water</v-icon>
              流动性池
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/send" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-send</v-icon>
              转账
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/receive" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-qrcode</v-icon>
              接收
            </v-tab>
            <v-tab 
              v-if="walletStore.isLoggedIn"
              to="/history" 
              class="text-body-2"
            >
              <v-icon size="small" class="mr-1">mdi-history</v-icon>
              历史
            </v-tab>
          </v-tabs>
        </div>
        
        <v-spacer></v-spacer>
        
        <!-- 扫描区块链按钮 -->
        <v-btn
          v-if="walletStore.isLoggedIn"
          color="info"
          variant="outlined"
          prepend-icon="mdi-radar"
          size="small"
          class="mr-2"
          @click="scanBlockchain"
          :loading="isScanning"
          :disabled="!walletStore.isLoggedIn"
        >
          <span class="d-none d-sm-inline">扫描区块链</span>
        </v-btn>
        
        <!-- 用户菜单 - 只有当 walletStore.isLoggedIn 为 true 时才显示 -->
        <v-menu v-if="walletStore.isLoggedIn">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="mr-2"
              size="small"
            >
              <div class="d-flex align-center">
                <span class="text-truncate text-body-2 mr-1" style="max-width: 120px;">
                  {{ formatAddress(walletStore.address) }}
                </span>
                <v-icon size="small">mdi-chevron-down</v-icon>
              </div>
            </v-btn>
          </template>
          <v-list density="compact" width="220">
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar color="primary" size="32">
                  <v-icon size="small" color="white">mdi-account</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">账户</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-truncate">
                {{ walletStore.address || '未连接' }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item @click="copyAddress" prepend-icon="mdi-content-copy" title="复制地址" density="compact"></v-list-item>
            <v-list-item prepend-icon="mdi-shield-key" title="安全设置" density="compact"></v-list-item>
            <v-list-item prepend-icon="mdi-cog" title="账户设置" density="compact"></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item @click="logout" prepend-icon="mdi-logout" title="登出" density="compact"></v-list-item>
          </v-list>
        </v-menu>
         <!-- 如果未登录，显示登录按钮 -->
         <v-btn
            v-else
            variant="text"
            size="small"
            to="/login"
            class="mr-2"
          >
           <v-icon start size="small">mdi-login</v-icon>
            登录
          </v-btn>
        
        <!-- 主题切换 -->
        <v-btn
          icon
          class="mr-2"
          @click="toggleTheme"
          size="small"
        >
          <v-icon size="small">{{ isDarkTheme ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-btn>
        
        <!-- 移动端菜单按钮 -->
        <v-btn
          icon
          @click="drawer = !drawer"
          class="d-md-none"
          size="small"
        >
          <v-icon size="small">mdi-menu</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- 侧边导航 - 仅移动端显示 -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      width="280"
      class="pa-4"
    >
      <div class="mb-6 d-flex justify-center">
        <v-avatar size="48" class="elevation-3" image="@/assets/logo.png"></v-avatar>
      </div>
      
      <!-- 账户信息在侧边栏 - 只有当 walletStore.isLoggedIn 为 true 时才显示 -->
      <v-card flat class="mb-6 pa-3 bg-surface-variant" v-if="walletStore.isLoggedIn">
        <div class="text-caption text-medium-emphasis mb-1">
          账户地址
        </div>
        <div class="d-flex align-center">
          <span class="text-truncate text-body-2">{{ walletStore.address || '未连接' }}</span>
          <v-btn icon size="x-small" variant="text" density="comfortable" class="ml-2" @click="copyAddress">
            <v-icon size="small">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </v-card>
      
      <v-list nav class="pa-0">
        <v-list-subheader class="text-overline">
          菜单
        </v-list-subheader>
        
        <v-list-item
          title="首页"
          prepend-icon="mdi-home"
          to="/home"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="资产概览"
          prepend-icon="mdi-view-dashboard"
          to="/dashboard"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="代币列表"
          prepend-icon="mdi-currency-usd"
          to="/coinlist"
          rounded="lg"
          density="compact"
        ></v-list-item>

        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="流动性池"
          prepend-icon="mdi-water"
          to="/poollist"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="发送"
          prepend-icon="mdi-send"
          to="/send"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="接收"
          prepend-icon="mdi-qrcode"
          to="/receive"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="walletStore.isLoggedIn"
          title="交易历史"
          prepend-icon="mdi-history"
          to="/history"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          v-if="!walletStore.isLoggedIn"
          title="登录"
          prepend-icon="mdi-login"
          to="/login"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-divider class="my-3"></v-divider>
        
        <v-list-subheader class="text-overline">
          设置
        </v-list-subheader>
        
        <v-list-item
          title="账户设置"
          prepend-icon="mdi-account-cog"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
        <v-list-item
          title="安全设置"
          prepend-icon="mdi-shield-lock"
          rounded="lg"
          density="compact"
        ></v-list-item>
        
         <v-divider class="my-3"></v-divider>
        
        <!-- 登出按钮在侧边栏 - 只有当 walletStore.isLoggedIn 为 true 时才显示 -->
         <v-list-item @click="logout" prepend-icon="mdi-logout" title="登出" rounded="lg" density="compact" v-if="walletStore.isLoggedIn"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 主内容区 -->
    <v-main class="bg-background" style="width: 100vw;">
      <router-view v-slot="{ Component }">
        <transition
          name="page"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- 全局弹窗消息 -->
    <DialogMessage />

    <!-- 底部导航 - 仅移动端显示 -->
    <v-bottom-navigation 
      v-if="walletStore.isLoggedIn"
      grow 
      color="primary" 
      elevation="4" 
      class="d-md-none"
    >
      <v-btn to="/home" value="home">
        <v-icon size="small">mdi-home</v-icon>
        <span class="text-caption">首页</span>
      </v-btn>
      <v-btn to="/coinlist" value="coinlist">
        <v-icon size="small">mdi-currency-usd</v-icon>
        <span class="text-caption">代币</span>
      </v-btn>
      <v-btn to="/poollist" value="poollist">
        <v-icon size="small">mdi-water</v-icon>
        <span class="text-caption">流动性</span>
      </v-btn>
      <v-btn to="/dashboard" value="dashboard">
        <v-icon size="small">mdi-view-dashboard</v-icon>
        <span class="text-caption">资产</span>
      </v-btn>
      <v-btn to="/history" value="history">
        <v-icon size="small">mdi-history</v-icon>
        <span class="text-caption">历史</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 深色模式滚动条 */
.v-theme--dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.v-theme--dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.v-theme--dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
