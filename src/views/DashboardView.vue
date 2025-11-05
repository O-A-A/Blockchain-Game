<template>
  <v-container class="py-4">
    <v-row>
      <!-- 左侧资产信息区域 -->
      <v-col cols="12" md="4" lg="3">
        <!-- 账户概览卡片 -->
        <v-card class="mb-6 rounded-lg" elevation="1">
          <v-card-text class="pa-4">
            <div class="text-overline text-medium-emphasis mb-1">原始代币数量</div>
            <div class="d-flex align-center">
              <h1 class="text-h5 font-weight-bold">${{ "ANY" }}</h1>
            </div>

            <!-- 刷新按钮和最后更新时间 -->
            <div class="d-flex align-center text-body-2 text-medium-emphasis mt-2">
              <span class="text-caption">最后更新: {{ lastUpdated }}</span>
              <v-btn icon size="small" variant="text" class="ml-2" @click="refreshBalances"
                :loading="loading">
                <v-icon size="small">mdi-refresh</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 快捷操作卡片 -->
        <v-card class="mb-6 rounded-lg" elevation="1">
          <v-card-text class="pa-4">
            <div class="text-subtitle-1 font-weight-bold mb-3">快捷操作</div>

          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右侧主内容区域 -->
      <v-col cols="12" md="8" lg="9">
        <!-- 代币资产列表 -->
        <v-card class="mb-6 rounded-lg" elevation="1">
          <v-toolbar density="compact" flat color="background">
            <v-toolbar-title class="font-weight-bold">代币资产</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip size="small" color="primary" variant="tonal">
              {{ tokenBalances.length }} 个代币
            </v-chip>
          </v-toolbar>

          <v-divider></v-divider>

          <div v-if="loading && tokenBalances.length === 0" class="pa-8 text-center">
            <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
            <p class="text-body-2 text-medium-emphasis">正在加载代币余额...</p>
          </div>

          <v-list v-else-if="tokenBalances.length > 0" class="py-0">
            <v-list-item
              v-for="token in tokenBalances"
              :key="token.address"
              class="py-3"
              @click="goToTokenDetail(token.address)"
              style="cursor: pointer"
            >
              <template v-slot:prepend>
                <v-avatar :color="token.type === 1 ? 'secondary' : 'primary'" variant="flat" size="40">
                  <span class="text-subtitle-2 font-weight-bold text-white">
                    {{ "X" }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">{{ token.name || '未命名' }}</v-list-item-title>
              <v-list-item-subtitle>{{ "X" }}</v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-end">
                  <div class="font-weight-bold">{{ formatBalance(token.balance) }} {{ token.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatAddress(token.address) }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="pa-8 text-center">
            <v-icon size="48" class="text-medium-emphasis mb-2">mdi-wallet-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis">暂无代币资产</p>
            <p class="text-caption text-medium-emphasis mt-2">请先扫描区块链或获取代币</p>
          </div>
        </v-card>

        <!-- 流动性池 LP Token 列表 -->
        <v-card class="mb-6 rounded-lg" elevation="1">
          <v-toolbar density="compact" flat color="background">
            <v-toolbar-title class="font-weight-bold">流动性池 LP Token</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip size="small" color="secondary" variant="tonal">
              {{ lpBalances.length }} 个池子
            </v-chip>
          </v-toolbar>

          <v-divider></v-divider>

          <div v-if="loading && lpBalances.length === 0" class="pa-8 text-center">
            <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
            <p class="text-body-2 text-medium-emphasis">正在加载 LP Token...</p>
          </div>

          <v-list v-else-if="lpBalances.length > 0" class="py-0">
            <v-list-item
              v-for="pool in lpBalances"
              :key="pool.address"
              class="py-3"
              @click="goToPoolDetail(pool.address)"
              style="cursor: pointer"
            >
              <template v-slot:prepend>
                <v-avatar color="info" variant="flat" size="40" class="mr-2">
                  <span class="text-subtitle-2 font-weight-bold text-white">
                    {{ 'A' }}
                  </span>
                </v-avatar>
                <v-avatar color="secondary" variant="flat" size="40">
                  <span class="text-subtitle-2 font-weight-bold text-white">
                    {{ 'B' }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">{{ pool.name || '未命名池' }}</v-list-item-title>
              <v-list-item-subtitle>{{ "A" }}/{{ "B" }}</v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-end">
                  <div class="font-weight-bold">{{ formatBalance(pool.lpBalance) }} LP</div>
                  <div class="text-caption text-medium-emphasis">占比: {{ pool.sharePercentage }}%</div>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="pa-8 text-center">
            <v-icon size="48" class="text-medium-emphasis mb-2">mdi-water-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis">暂无 LP Token</p>
            <p class="text-caption text-medium-emphasis mt-2">请先扫描区块链或添加流动性</p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContractsStore } from '@/store/contracts'
import contractInteractionService from '@/services/contractInteractionService'
import poolService from '@/services/poolService'
import connectionService from '@/services/connectionService'
import { formatAddress, formatBalance } from '@/utils/formatters'

const router = useRouter()
const contractsStore = useContractsStore()

const loading = ref(false)
const lastUpdated = ref('刚刚')
const tokenBalances = ref<Array<{
  address: string
  name: string
  balance: string
  type: number
}>>([])
const lpBalances = ref<Array<{
  address: string
  name: string
  token0Symbol: string
  token1Symbol: string
  lpBalance: string
  sharePercentage: string
}>>([])


// 刷新余额
const refreshBalances = async () => {
  loading.value = true
  
  try {
    // 获取用户地址
    const userAddress = connectionService.getAddress()
    
    if (!userAddress) {
      return
    }

    // 获取所有代币列表
    const allTokens = contractsStore.allTokens
    
    // 获取所有代币余额
    const tokenBalancePromises = allTokens.map(async (token) => {
      try {
        const balance = await contractInteractionService.getERC20Balance(token.address, userAddress)
        
        // 获取代币信息
        const tokenInfo = token.type === 1
          ? await contractInteractionService.getWBKCInfo(token.address)
          : await contractInteractionService.getERC20Info(token.address)
        
        return {
          address: token.address,
          name: tokenInfo.name || '未命名',
          balance: balance.toString(),
          type: token.type
        }
      } catch (err) {
        // 静默失败，不显示该代币
        return null
      }
    })
    
    const tokenResults = await Promise.all(tokenBalancePromises)
    tokenBalances.value = tokenResults.filter(t => t !== null && parseFloat(t.balance) > 0) as any[]
    
    // 获取所有池子列表
    const pools = await poolService.getAllPools()
    
    // 获取每个池子的LP Token余额
    const lpBalancePromises = pools.map(async (pool) => {
      try {
        const abi = contractInteractionService.getAbi('amm')
        const lpBalance = await contractInteractionService.callViewFunction({
          address: pool.address,
          abi,
          functionName: 'userLpToken',
          args: [userAddress]
        })
        
        const lpBalanceNum = parseFloat(lpBalance.toString())
        const totalLpSupplyNum = parseFloat(pool.totalLpSupplyRaw || '0')
        
        let sharePercentage = '0'
        if (totalLpSupplyNum > 0 && lpBalanceNum > 0) {
          sharePercentage = ((lpBalanceNum / totalLpSupplyNum) * 100).toFixed(4)
        }
        
        return {
          address: pool.address,
          name: pool.name || '未命名池',
          lpBalance: lpBalance.toString(),
          sharePercentage
        }
      } catch (err) {
        return null
      }
    })
    
    const lpResults = await Promise.all(lpBalancePromises)
    lpBalances.value = lpResults.filter(p => p !== null && parseFloat(p.lpBalance) > 0) as any[]
    
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (err: any) {
    console.error('刷新余额失败:', err)
  } finally {
    loading.value = false
  }
}

// 跳转到代币详情
const goToTokenDetail = (address: string) => {
  router.push(`/coindetail/${address}`)
}

// 跳转到池子详情
const goToPoolDetail = (address: string) => {
  router.push(`/pooldetail/${address}`)
}

// 组件挂载时刷新数据
onMounted(() => {
  refreshBalances()
})
</script>

<style scoped>
.hover-row {
  transition: background-color 0.2s ease;
}

.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
