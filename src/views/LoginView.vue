<template>
  <v-container fluid class="d-flex align-center justify-center" style="min-height: 100vh;">
    <v-card class="pa-8" elevation="8" style="width: 500px; max-width: 90vw;" rounded="xl">
      <v-card-title class="text-h4 font-weight-bold text-center mb-2">
        <v-icon size="48" color="primary" class="mb-2">mdi-wallet</v-icon>
        <div>连接钱包</div>
      </v-card-title>

      <v-card-subtitle class="text-center mb-6 text-medium-emphasis">
        连接到区块链节点并使用您的私钥登录
      </v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="login" ref="loginForm">
          <!-- 节点URL -->
          <v-text-field
            v-model="nodeUrl"
            label="节点 URL"
            placeholder="http://127.0.0.1:8545"
            prepend-inner-icon="mdi-server-network"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[v => !!v || '节点URL不能为空']"
            required
            hint="Ganache默认: http://127.0.0.1:8545"
            persistent-hint
          ></v-text-field>

          <!-- 私钥 -->
          <v-text-field
            v-model="privateKey"
            label="私钥"
            :type="showPrivateKey ? 'text' : 'password'"
            prepend-inner-icon="mdi-key-variant"
            :append-inner-icon="showPrivateKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPrivateKey = !showPrivateKey"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[
              v => !!v || '私钥不能为空',
              v => (v && (v.startsWith('0x') ? v.length === 66 : v.length === 64)) || '私钥格式不正确'
            ]"
            required
            hint="从 Ganache 复制账户私钥"
            persistent-hint
          ></v-text-field>

          <!-- 密码（用于加密存储） -->
          <v-text-field
            v-model="localPassword"
            label="本地密码（用于加密存储）"
            type="password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            hint="设置一个密码来加密保存您的私钥（可选）"
            persistent-hint
          ></v-text-field>

          <!-- 记住我 -->
          <v-checkbox
            v-model="rememberMe"
            label="记住我（加密保存到本地）"
            color="primary"
            density="compact"
            class="mb-4"
            hide-details
          ></v-checkbox>

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
            v-if="detectedAddress"
            type="success"
            variant="tonal"
            class="mb-4 rounded-lg"
          >
            <div class="text-caption">检测到钱包地址：</div>
            <div class="font-mono text-body-2">{{ detectedAddress }}</div>
          </v-alert>

          <!-- 登录按钮 -->
          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            class="rounded-lg font-weight-bold mb-4"
            :loading="isLoading"
            :disabled="isLoading"
          >
            <v-icon class="mr-2">mdi-login</v-icon>
            连接钱包
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
                <li>确保 Ganache 正在运行</li>
                <li>从 Ganache 复制账户的私钥</li>
                <li>勾选"记住我"可以保存登录信息</li>
              </ul>
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="text-center d-block pt-0">
        <div class="text-caption text-medium-emphasis">
          首次使用？请先启动 Ganache 并复制账户私钥
        </div>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/store/wallet'
import connectionService from '@/services/connectionService'
import { ethers } from 'ethers'
import CryptoJS from 'crypto-js'

const router = useRouter()
const walletStore = useWalletStore()

const loginForm = ref<any>(null)
const nodeUrl = ref('http://127.0.0.1:8545')
const privateKey = ref('')
const localPassword = ref('')
const rememberMe = ref(false)
const showPrivateKey = ref(false)
const isLoading = ref(false)
const error = ref('')
const detectedAddress = ref('')

// 页面加载时检查是否有保存的登录信息
onMounted(() => {
  // 检查 localStorage 中是否有保存的信息
  const savedNodeUrl = localStorage.getItem('nodeUrl')
  const savedEncryptedKey = localStorage.getItem('encryptedPrivateKey')
  const savedAddress = localStorage.getItem('walletAddress')

  if (savedNodeUrl) {
    nodeUrl.value = savedNodeUrl
  }

  if (savedAddress && savedEncryptedKey) {
    // 有保存的信息，显示提示
    error.value = ''
    detectedAddress.value = savedAddress
  }

  // 检查 sessionStorage 中是否有当前会话的登录信息
  const sessionNodeUrl = sessionStorage.getItem('currentNodeUrl')
  const sessionPrivateKey = sessionStorage.getItem('currentPrivateKey')
  const sessionAddress = sessionStorage.getItem('currentAddress')

  if (sessionNodeUrl && sessionPrivateKey && sessionAddress) {
    // 已经登录，尝试恢复连接
    restoreSession(sessionNodeUrl, sessionPrivateKey, sessionAddress)
  }
})

// 监听私钥变化，自动检测地址
watch(privateKey, (newKey) => {
  if (newKey && newKey.length >= 64) {
    try {
      // 确保私钥有 0x 前缀
      const keyWithPrefix = newKey.startsWith('0x') ? newKey : '0x' + newKey
      const wallet = new ethers.Wallet(keyWithPrefix)
      detectedAddress.value = wallet.address
      error.value = ''
    } catch (err) {
      detectedAddress.value = ''
      error.value = '私钥格式不正确'
    }
  } else {
    detectedAddress.value = ''
  }
})

/**
 * 恢复会话
 */
const restoreSession = async (nodeUrl: string, privateKey: string, address: string) => {
  try {
    console.log('尝试恢复会话...')
    await connectionService.connect(nodeUrl, privateKey)
    walletStore.setAddress(address)
    walletStore.setLoggedIn(true)

    console.log('会话恢复成功，跳转到 Dashboard')
    router.replace('/dashboard')
  } catch (err) {
    console.error('会话恢复失败:', err)
    // 清除无效的会话信息
    sessionStorage.removeItem('currentNodeUrl')
    sessionStorage.removeItem('currentPrivateKey')
    sessionStorage.removeItem('currentAddress')
  }
}

/**
 * 登录
 */
const login = async () => {
  console.log('='.repeat(60))
  console.log('开始登录流程')
  console.log('='.repeat(60))

  // 验证表单
  const { valid } = await loginForm.value.validate()
  if (!valid) {
    console.error('表单验证失败')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    console.log('[1/5] 验证私钥格式')
    // 确保私钥有 0x 前缀
    let keyWithPrefix = privateKey.value.trim()
    if (!keyWithPrefix.startsWith('0x')) {
      keyWithPrefix = '0x' + keyWithPrefix
    }

    // 验证私钥格式
    if (keyWithPrefix.length !== 66) {
      throw new Error('私钥长度不正确，应该是64位十六进制字符')
    }

    console.log('[2/5] 生成钱包地址')
    // 生成钱包地址
    const wallet = new ethers.Wallet(keyWithPrefix)
    const address = wallet.address
    console.log('钱包地址:', address)

    console.log('[3/5] 连接到区块链节点')
    console.log('节点URL:', nodeUrl.value)

    // 连接到区块链节点
    await connectionService.connect(nodeUrl.value, keyWithPrefix)

    console.log('[4/5] 测试连接')
    // 测试连接
    const blockNumber = await connectionService.getBlockNumber()
    console.log('当前区块号:', blockNumber)

    console.log('[5/5] 保存登录信息')
    // 保存到 sessionStorage（当前会话）
    sessionStorage.setItem('currentNodeUrl', nodeUrl.value)
    sessionStorage.setItem('currentPrivateKey', keyWithPrefix)
    sessionStorage.setItem('currentAddress', address)

    // 如果勾选了"记住我"，加密保存到 localStorage
    if (rememberMe.value) {
      console.log('保存登录信息到 localStorage（加密）')

      if (!localPassword.value) {
        throw new Error('请设置本地密码用于加密保存')
      }

      // 使用 AES 加密私钥
      const encryptedKey = CryptoJS.AES.encrypt(keyWithPrefix, localPassword.value).toString()

      localStorage.setItem('nodeUrl', nodeUrl.value)
      localStorage.setItem('encryptedPrivateKey', encryptedKey)
      localStorage.setItem('walletAddress', address)
    }

    // 更新钱包状态
    walletStore.setAddress(address)
    walletStore.setLoggedIn(true)

    console.log('✓ 登录成功！')
    console.log('='.repeat(60))

    // 跳转到 Dashboard
    router.push('/dashboard')

  } catch (err: any) {
    console.error('✗ 登录失败:', err)
    console.log('='.repeat(60))

    let errorMsg = '登录失败'

    if (err.message) {
      errorMsg = err.message
    }

    if (err.code === 'NETWORK_ERROR') {
      errorMsg = '无法连接到节点，请检查节点URL是否正确，以及 Ganache 是否正在运行'
    } else if (err.message.includes('invalid private key')) {
      errorMsg = '私钥格式不正确，请检查是否正确复制了 Ganache 的私钥'
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
