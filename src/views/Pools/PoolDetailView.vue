<template>
  <v-container class="py-6" style="max-width: 80%">
    <!-- 加载状态 -->
    <v-card v-if="loading" rounded="lg" elevation="2" class="pa-8 text-center">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
      <p class="text-body-1">正在从区块链加载池子数据...</p>
    </v-card>

    <!-- 错误状态 -->
    <v-alert v-else-if="error" type="error" rounded="lg" class="mb-4">
      {{ error }}
      <v-btn color="white" variant="text" @click="goBack" class="mt-2">返回</v-btn>
    </v-alert>

    <!-- 池子详情 -->
    <template v-else-if="pool">
      <!-- 返回按钮 -->
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-6" @click="goBack">
        返回池列表
      </v-btn>

      <!-- 池基本信息 -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card rounded="lg" elevation="2" class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" size="56" class="mr-3">
                <span class="text-white text-h5">{{ "A" }}</span>
              </v-avatar>
              <v-avatar color="secondary" size="56" class="mr-4">
                <span class="text-white text-h5">{{ "B" }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <h1 class="text-h4 font-weight-bold">{{ pool.name }}</h1>
                <div class="text-body-1 text-medium-emphasis">{{ pool.token0.name }}/{{ pool.token1.name }} 流动性池
                </div>
                <v-chip size="small" class="mt-2" prepend-icon="mdi-identifier">
                  <span class="font-mono">{{ formatAddress(pool.address) }}</span>
                </v-chip>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadPoolInfo" :loading="refreshing"
                rounded="lg">
                刷新数据
              </v-btn>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- 关键指标 -->
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="primary">mdi-currency-usd</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">当前价格</div>
                  <div class="text-h6 font-weight-bold">{{ pool.price }}</div>
                  <div class="text-caption">1 {{ pool.token0.name }} = {{ pool.price }} {{ pool.token1.name }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="success">mdi-percent</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">手续费</div>
                  <div class="text-h6 font-weight-bold text-success">{{ pool.fee }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="info">mdi-wallet</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">我的 LP Token</div>
                  <div class="text-h6 font-weight-bold">{{ pool.userLpBalance || '0' }}</div>
                  <div class="text-caption">占比: {{ poolSharePercentage }}%</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <v-icon size="small" color="warning">mdi-circle-multiple</v-icon>
                  <div class="text-caption text-medium-emphasis mt-1">总 LP 供应</div>
                  <div class="text-h6 font-weight-bold">{{ pool.totalLpSupply }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 池子储备和用户余额 -->
      <v-row class="mb-6">
        <!-- Token0 信息 -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="40" class="mr-3">
                <span class="text-white font-weight-bold">{{ "A" }}</span>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">{{ "A" }}</div>
                <div class="text-caption text-medium-emphasis">{{ pool.token0.name }}</div>
              </div>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">池子储备</span>
              <span class="text-body-1 font-weight-medium">{{ formatBalance(pool.reserve0) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">我的余额</span>
              <span class="text-body-1 font-weight-medium">{{ formatBalance(token0Balance) }}</span>
            </div>
            <v-chip size="small" class="mt-2 font-mono" prepend-icon="mdi-link">
              {{ formatAddress(pool.token0.address) }}
            </v-chip>
          </v-card>
        </v-col>

        <!-- Token1 信息 -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="1" class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="secondary" size="40" class="mr-3">
                <span class="text-white font-weight-bold">{{ "B" }}</span>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">{{ "B" }}</div>
                <div class="text-caption text-medium-emphasis">{{ pool.token1.name }}</div>
              </div>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">池子储备</span>
              <span class="text-body-1 font-weight-medium">{{ formatBalance(pool.reserve1) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">我的余额</span>
              <span class="text-body-1 font-weight-medium">{{ formatBalance(token1Balance) }}</span>
            </div>
            <v-chip size="small" class="mt-2 font-mono" prepend-icon="mdi-link">
              {{ formatAddress(pool.token1.address) }}
            </v-chip>
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
              <v-col cols="12" sm="6" md="3">
                <v-btn color="primary" block rounded="lg" prepend-icon="mdi-swap-horizontal"
                  @click="setFunction('swapAForB')">
                  交换 A→B
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="primary" block rounded="lg" prepend-icon="mdi-swap-horizontal"
                  @click="setFunction('swapBForA')">
                  交换 B→A
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="success" block rounded="lg" prepend-icon="mdi-plus" @click="setFunction('addLiquidity')">
                  添加流动性
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="error" block rounded="lg" prepend-icon="mdi-minus"
                  @click="setFunction('removeLiquidity')">
                  移除流动性
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-chart-line"
                  @click="setFunction('GetTwapPrice')">
                  查询 TWAP
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-information"
                  @click="setFunction('getPoolInfo')">
                  池子信息
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-calculator"
                  @click="setFunction('getAmountBOut')">
                  计算输出 B
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn color="info" block rounded="lg" prepend-icon="mdi-calculator"
                  @click="setFunction('getAmountAOut')">
                  计算输出 A
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- 通用合约函数调用器 -->
      <v-row>
        <v-col cols="12">
          <ContractFunctionCaller :key="functionCallerKey" :contract-address="pool.address" contract-type="amm"
            :pool-info="pool" ref="functionCallerRef" />
        </v-col>
      </v-row>
    </template>

    <!-- 操作成功提示 -->
    <v-snackbar v-model="showActionSuccess" timeout="3000" color="success">
      {{ actionSuccessMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import poolService from '@/services/poolService'
import type { PoolInfo } from '@/services/poolService'
import connectionService from '@/services/connectionService'
import ContractFunctionCaller from '@/components/ContractFunctionCaller.vue'
import { formatAddress, formatBalance } from '@/utils/formatters'

const router = useRouter()
const route = useRoute()

// 从路由参数获取池地址
const poolAddress = route.params.address as string

// 响应式状态
const pool = ref<PoolInfo | null>(null)
const loading = ref(false)
const refreshing = ref(false)
const error = ref('')
const showActionSuccess = ref(false)
const actionSuccessMessage = ref('')

// 用户地址和代币余额
const userAddress = ref('')
const token0Balance = ref('0')
const token1Balance = ref('0')

// 函数调用器
const functionCallerRef = ref()
const functionCallerKey = ref(0)

// 加载池子信息
const loadPoolInfo = async () => {
  if (pool.value) {
    refreshing.value = true
  } else {
    loading.value = true
  }
  error.value = ''

  try {
    if (!poolAddress) {
      throw new Error('池子地址无效')
    }

    // 获取用户地址
    const wallet = connectionService.getWallet()
    userAddress.value = wallet.address

    // 获取池子信息
    pool.value = await poolService.getPoolInfo(poolAddress, userAddress.value)

    // 获取用户代币余额
    await loadTokenBalances()

  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载代币余额
const loadTokenBalances = async () => {
  if (!pool.value) return

  try {
    const [balance0, balance1] = await Promise.all([
      poolService.getTokenBalance(pool.value.token0.address, userAddress.value),
      poolService.getTokenBalance(pool.value.token1.address, userAddress.value)
    ])

    token0Balance.value = balance0
    token1Balance.value = balance1
  } catch (err: any) {
    // 获取余额失败，静默处理
    token0Balance.value = '0'
    token1Balance.value = '0'
  }
}

// 设置函数（快捷按钮）
const setFunction = (functionName: string, prefillParams?: string[]) => {
  if (functionCallerRef.value && functionCallerRef.value.setSelectedFunction) {
    // 如果没有提供预填充参数，根据函数名智能预填充
    let params = prefillParams
    if (!params) {
      switch (functionName) {
        case 'userLpToken':
          params = [userAddress.value]
          break
        case 'addLiquidity':
          // 添加流动性：参数 (amountA, amountB)
          params = ['100', '100']
          break
        case 'removeLiquidity':
          params = ['100']
          break
        case 'swapAForB':
          params = ['100']
          break
        case 'swapBForA':
          params = ['100']
          break
        case 'flashSwapTokenA':
        case 'flashSwapTokenB':
          // 闪电交换：参数留空让用户填写
          params = []
          break
        case 'getAmountAOut':
        case 'getAmountBOut':
          params = ['100']
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

// 计算属性

// 池子份额百分比
const poolSharePercentage = computed(() => {
  if (!pool.value || !pool.value.userLpBalance || !pool.value.totalLpSupply) {
    return '0'
  }

  const userBalance = parseFloat(pool.value.userLpBalance.replace(/,/g, ''))
  const totalSupply = parseFloat(pool.value.totalLpSupply.replace(/,/g, ''))

  if (totalSupply === 0) return '0'

  return ((userBalance / totalSupply) * 100).toFixed(4)
})

// 返回
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  loadPoolInfo()
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
