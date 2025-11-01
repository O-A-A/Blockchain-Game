<template>
  <v-container class="py-6" style="max-width: 80%">
    <!-- 加载状态 -->
    <v-card v-if="loading" rounded="lg" elevation="2" class="pa-8 text-center">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
      <p class="text-body-1">正在从区块链加载代币信息...</p>
    </v-card>

    <!-- 错误状态 -->
    <v-alert v-else-if="error" type="error" rounded="lg" class="mb-4">
      {{ error }}
      <v-btn color="white" variant="text" @click="goBack" class="mt-2">返回</v-btn>
    </v-alert>

    <!-- 代币详情 -->
    <template v-else-if="tokenInfo">
      <!-- 返回按钮 -->
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-6" @click="goBack">
        返回代币列表
      </v-btn>

      <!-- 代币基本信息 -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card rounded="lg" elevation="2" class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-avatar :color="isWBKC ? 'secondary' : 'primary'" size="64" class="mr-4">
                <span class="text-white text-h4">{{ tokenInfo.symbol ? tokenInfo.symbol.charAt(0) : 'T' }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <h1 class="text-h4 font-weight-bold">{{ tokenInfo.name || '未命名代币' }}</h1>
                <div class="text-body-1 text-medium-emphasis">{{ tokenInfo.symbol || 'N/A' }}</div>
                <v-chip size="small" :color="isWBKC ? 'secondary' : 'primary'" class="mt-2">
                  {{ isWBKC ? 'Wrapped BKC' : 'ERC20 Token' }}
                </v-chip>
                <v-chip size="small" class="mt-2 ml-2 font-mono" prepend-icon="mdi-identifier">
                  {{ formatAddress(tokenAddress) }}
                </v-chip>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadTokenInfo" :loading="refreshing"
                rounded="lg">
                刷新数据
              </v-btn>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- 关键指标 -->
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="primary">mdi-chart-box</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">总供应量</div>
                  <div class="text-h6 font-weight-bold">{{ formatBalance(tokenInfo.totalSupply) }}</div>
                  <div class="text-caption">{{ tokenInfo.symbol }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="success">mdi-wallet</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">我的余额</div>
                  <div class="text-h6 font-weight-bold">{{ userBalance }}</div>
                  <div class="text-caption">{{ tokenInfo.symbol }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="info">mdi-numeric</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">精度</div>
                  <div class="text-h6 font-weight-bold">{{ tokenInfo.decimals }}</div>
                  <div class="text-caption">decimals</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="warning">mdi-account</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">合约拥有者</div>
                  <div class="text-caption font-mono">{{ formatAddress(tokenInfo.owner) }}</div>
                  <v-btn size="x-small" icon variant="text" @click="copyToClipboard(tokenInfo.owner)">
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 常用操作快捷按钮 -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card rounded="lg" elevation="1" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-4">
              <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
              快捷操作
            </div>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-wallet" @click="setFunction('balanceOf')">
                  查询余额
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="success" block rounded="lg" prepend-icon="mdi-send" @click="setFunction('transfer')">
                  转账
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="success" block rounded="lg" prepend-icon="mdi-check-circle"
                  @click="setFunction('approve')">
                  授权
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-eye" @click="setFunction('allowanceOf')">
                  查询授权额度
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-information"
                  @click="setFunction('totalSupply')">
                  总供应量
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-label" @click="setFunction('coin_name')">
                  代币名称
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 通用合约函数调用器 -->
      <v-row>
        <v-col cols="12">
          <ContractFunctionCaller :key="functionCallerKey" :contract-address="tokenAddress"
            :contract-type="isWBKC ? 'wbkc' : 'erc20'" ref="functionCallerRef" />
        </v-col>
      </v-row>
    </template>

    <!-- 复制成功提示 -->
    <v-snackbar v-model="showCopySuccess" timeout="2000" color="success">
      已复制到剪贴板
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContractsStore } from '@/store/contracts'
import contractInteractionService from '@/services/contractInteractionService'
import connectionService from '@/services/connectionService'
import ContractFunctionCaller from '@/components/ContractFunctionCaller.vue'
import {formatBalance} from '@/utils/formatters'

const router = useRouter()
const route = useRoute()
const contractsStore = useContractsStore()

// 从路由参数获取代币地址
const tokenAddress = route.params.addr as string

// 响应式状态
const tokenInfo = ref<any>(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref('')
const userAddress = ref('')
const userBalance = ref('0')
const showCopySuccess = ref(false)

// 函数调用器
const functionCallerRef = ref()
const functionCallerKey = ref(0)

// 是否是 WBKC
const isWBKC = computed(() => {
  return tokenInfo.value?.contractType === 1
})

// 加载代币信息
const loadTokenInfo = async () => {
  if (tokenInfo.value) {
    refreshing.value = true
  } else {
    loading.value = true
  }
  error.value = ''

  try {
    if (!tokenAddress) {
      throw new Error('代币地址无效')
    }

    // 获取用户地址
    const wallet = connectionService.getWallet()
    userAddress.value = wallet.address

    // 从 store 获取合约类型（所有合约都已扫描并存储）
    const storedContract = contractsStore.getContractByAddress(tokenAddress)
    if (!storedContract) {
      throw new Error('合约未找到，请先扫描区块链')
    }

    const contractType = storedContract.type

    // 根据类型获取信息
    if (contractType === 1) {
      // WBKC
      tokenInfo.value = await contractInteractionService.getWBKCInfo(tokenAddress)
    } else {
      // ERC20 (默认)
      tokenInfo.value = await contractInteractionService.getERC20Info(tokenAddress)
    }

    // 获取用户余额
    await loadUserBalance()
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载用户余额
const loadUserBalance = async () => {
  if (!tokenInfo.value) return

  try {
    const balance = await contractInteractionService.getERC20Balance(tokenAddress, userAddress.value)
    userBalance.value = formatBalance(balance)
  } catch (err: any) {
    // 静默失败，余额显示为 0
    userBalance.value = '0'
  }
}

// 设置函数（快捷按钮）
const setFunction = (functionName: string, prefillParams?: string[]) => {
  if (functionCallerRef.value && functionCallerRef.value.setSelectedFunction) {
    // 如果没有提供预填充参数，根据函数名智能预填充
    let params = prefillParams
    if (!params) {
      switch (functionName) {
        case 'balanceOf':
          // 查询余额：预填充当前用户地址
          params = [userAddress.value]
          break
        case 'transfer':
          // 转账：第一个参数为目标地址（留空让用户填），第二个参数为金额（留空）
          params = []
          break
        case 'approve':
          // 授权：第一个参数为被授权地址（留空），第二个参数为授权额度（留空）
          params = []
          break
        case 'allowanceOf':
          // 查询授权额度：预填充用户地址作为 owner，spender 留空
          params = [userAddress.value, '']
          break
        case 'mintToken':
          // 铸造代币：根据类型预填充
          if (isWBKC.value) {
            // WBKC 不需要参数（通过 payable 传 ETH）
            params = []
          } else {
            // ERC20：预填充接收地址为当前用户，数量留空
            params = [userAddress.value, '']
          }
          break
        case 'burnToken':
          // 销毁代币：预填充数量为空
          params = ['']
          break
        default:
          params = []
      }
    }

    functionCallerRef.value.setSelectedFunction(functionName, params)

    // 滚动到函数调用器
    setTimeout(() => {
      const element = document.querySelector('.v-card')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }
}

// 格式化地址
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.slice(0, 10) + '...' + address.slice(-8)
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
  } catch (err) {
    // 复制失败，不显示任何提示
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  loadTokenInfo()
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}

.bg-secondary-light {
  background-color: rgba(var(--v-theme-secondary), 0.1);
}
</style>
