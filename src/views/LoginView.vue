<template>
  <v-container fluid class="d-flex align-center justify-center">
    <v-card class="pa-8" elevation="8" style="width: 500px; max-width: 90vw;" rounded="xl">
      <v-card-title class="text-h4 font-weight-bold text-center mb-2">
        <v-icon size="48" color="primary" class="mb-2">mdi-wallet</v-icon>
        <div>连接到 MetaMask</div>
      </v-card-title>

      <v-card-subtitle class="text-center mb-6 text-medium-emphasis">
        使用您的 MetaMask 浏览器钱包进行连接
      </v-card-subtitle>

      <v-card-text>
        <!-- 错误提示 -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4 rounded-lg"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- 成功提示（显示地址） -->
        <v-alert
          v-if="connectedAddress"
          type="success"
          variant="tonal"
          class="mb-4 rounded-lg"
        >
          <div class="text-caption">已连接钱包地址：</div>
          <div class="font-mono text-body-2">{{ connectedAddress }}</div>
        </v-alert>

        <!-- 连接按钮 -->
        <v-btn
          @click="connectWallet"
          color="primary"
          size="large"
          block
          class="rounded-lg font-weight-bold mb-4"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <v-icon class="mr-2">mdi-login</v-icon>
          连接 MetaMask
        </v-btn>

        <!-- 信息提示 -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-0 rounded-lg"
        >
          <div class="text-caption">
            <strong>提示：</strong>
            <ul class="pl-4 mt-2">
              <li>请确保您已经安装了 MetaMask 浏览器插件。</li>
              <li>点击按钮后，将在 MetaMask 中弹出授权请求。</li>
              <li>连接成功后将自动跳转到主页面。</li>
            </ul>
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions class="text-center d-block pt-0">
        <div class="text-caption text-medium-emphasis">
          首次使用？请先安装 <a href="https://metamask.io/" target="_blank">MetaMask</a>
        </div>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/store/wallet'
import connectionService from '@/services/connectionService'

const router = useRouter()
const walletStore = useWalletStore()

const isLoading = ref(false)
const error = ref('')
const connectedAddress = ref('')

// 页面加载时尝试恢复会话

onMounted(async () => {
  isLoading.value = true
  try {
    const restored = await connectionService.restoreFromSession()
    if (restored) {
      const address = connectionService.getAddress()
      walletStore.setAddress(address)
      walletStore.setLoggedIn(true)
      connectedAddress.value = address
      console.log('会话恢复成功，跳转到 Dashboard')
      router.replace('/dashboard')
    }
  } catch (err) {
    // 恢复失败，停留在登录页
    console.log('无法自动恢复会话，等待用户手动连接。')
  } finally {
    isLoading.value = false
  }
})

/**
 * 连接钱包
 */
const connectWallet = async () => {
  isLoading.value = true
  error.value = ''

  try {
    console.log('开始连接 MetaMask...')
    await connectionService.connect()

    const address = connectionService.getAddress()
    if (!address) {
      throw new Error('未能获取钱包地址')
    }

    connectedAddress.value = address
    
    // 更新钱包状态
    walletStore.setAddress(address)
    walletStore.setLoggedIn(true)

    console.log('✓ 连接成功！钱包地址:', address)
    
    // 跳转到 Dashboard
    router.push('/dashboard')

  } catch (err: any) {
    console.error('✗ 连接失败:', err)
    let errorMsg = '连接失败'

    if (err.message) {
      if (err.message.includes('User rejected the request')) {
        errorMsg = '您拒绝了连接请求'
      } else if (err.message.includes('MetaMask is not defined')) {
        errorMsg = '未检测到 MetaMask，请确保已安装并启用。'
      } else {
        errorMsg = err.message
      }
    }
    
    error.value = errorMsg
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
