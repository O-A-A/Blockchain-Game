<template>
  <v-container class="py-6" style="max-width: 80%">
    <!-- 返回按钮 -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-6"
      @click="goBack"
    >
      返回池列表
    </v-btn>

    <!-- 池基本信息 -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2" class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary" size="48" class="mr-3">
              <span class="text-white text-h6">{{ pool.token0.symbol.charAt(0) }}</span>
            </v-avatar>
            <v-avatar color="secondary" size="48" class="mr-3">
              <span class="text-white text-h6">{{ pool.token1.symbol.charAt(0) }}</span>
            </v-avatar>
            <div>
              <h1 class="text-h5 font-weight-bold">{{ pool.name }}</h1>
              <div class="text-body-2 text-medium-emphasis">{{ pool.token0.symbol }}/{{ pool.token1.symbol }}</div>
            </div>
          </div>

          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis mb-1">当前价格</div>
              <div class="text-h6 font-weight-bold">$ {{ pool.price }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis mb-1">手续费</div>
              <div class="text-h6 font-weight-bold">{{ pool.fee }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="pa-6 mb-4">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-water</v-icon>
            流动性
          </div>
          <div class="text-h6 font-weight-bold">$ 2.5M</div>
        </v-card>

        <v-card rounded="lg" elevation="2" class="pa-6">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-percent</v-icon>
            APR
          </div>
          <div class="text-h6 font-weight-bold text-success">{{ pool.apr }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 池深度信息 -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-2">
            <v-icon size="small">mdi-database</v-icon>
            {{ pool.token0.symbol }} 深度
          </div>
          <div class="text-h6 font-weight-bold">{{ pool.reserve0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-2">
            <v-icon size="small">mdi-database</v-icon>
            {{ pool.token1.symbol }} 深度
          </div>
          <div class="text-h6 font-weight-bold">{{ pool.reserve1 }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 交互模块 Tab -->
    <v-card rounded="lg" elevation="2">
      <v-tabs v-model="activeTab" background-color="primary" grow>
        <v-tab :value="0">
          <v-icon size="small" class="mr-2">mdi-swap-horizontal</v-icon>
          Swap
        </v-tab>
        <v-tab :value="1">
          <v-icon size="small" class="mr-2">mdi-water-percent</v-icon>
          流动性
        </v-tab>
        <v-tab :value="2">
          <v-icon size="small" class="mr-2">mdi-chart-line</v-icon>
          TWAP
        </v-tab>
        <v-tab :value="3">
          <v-icon size="small" class="mr-2">mdi-lightning-bolt</v-icon>
          Flash Swap
        </v-tab>
      </v-tabs>

      <!-- Swap 标签页 -->
      <v-window v-model="activeTab">
        <v-window-item :value="0">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold mb-3">代币交换</div>
                
                <!-- From 代币 -->
                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-caption text-medium-emphasis">支付</span>
                      <span class="text-caption">余额: 1,000</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="swapData.fromAmount"
                        type="number"
                        min="0"
                        density="compact"
                        variant="plain"
                        hide-details
                        class="text-h5 font-weight-bold"
                        style="max-width: 70%"
                      ></v-text-field>
                      <v-spacer></v-spacer>
                      <v-chip :color="getTokenColor(pool.token0)">
                        {{ pool.token0.symbol }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 交换方向按钮 -->
                <div class="text-center mb-4">
                  <v-btn
                    icon
                    color="primary"
                    variant="flat"
                    @click="swapDirection"
                    rounded="lg"
                  >
                    <v-icon>mdi-swap-vertical</v-icon>
                  </v-btn>
                </div>

                <!-- To 代币 -->
                <v-card class="rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex justify-space-between mb-2">
                      <span class="text-caption text-medium-emphasis">接收</span>
                      <span class="text-caption">余额: 500</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="swapData.toAmount"
                        type="number"
                        min="0"
                        density="compact"
                        variant="plain"
                        hide-details
                        class="text-h5 font-weight-bold"
                        style="max-width: 70%"
                        disabled
                      ></v-text-field>
                      <v-spacer></v-spacer>
                      <v-chip :color="getTokenColor(pool.token1)">
                        {{ pool.token1.symbol }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 滑点设置 -->
                <v-row class="mt-4">
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis mb-1">滑点容限</div>
                    <v-select
                      v-model="swapData.slippage"
                      :items="['0.1%', '0.5%', '1%', '3%']"
                      density="compact"
                      variant="outlined"
                      rounded="lg"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-medium-emphasis mb-1">手续费</div>
                    <v-text-field
                      :value="pool.fee"
                      disabled
                      density="compact"
                      variant="outlined"
                      rounded="lg"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- 交换按钮 -->
                <v-btn
                  color="primary"
                  size="large"
                  block
                  rounded="lg"
                  class="mt-4"
                  @click="executeSwap"
                >
                  <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
                  交换
                </v-btn>
              </v-col>

              <!-- 交换信息 -->
              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1" class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold mb-4">交换详情</div>
                  
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">交换比例</div>
                    <div class="text-body-2">
                      1 {{ pool.token0.symbol }} = {{ swapExchangeRate }} {{ pool.token1.symbol }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">最小接收</div>
                    <div class="text-body-2">{{ minimumReceived }} {{ pool.token1.symbol }}</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">交易费用</div>
                    <div class="text-body-2">{{ tradeFee }} {{ pool.token0.symbol }}</div>
                  </div>

                  <v-divider class="my-3"></v-divider>

                  <div>
                    <div class="text-caption text-medium-emphasis">影响价格</div>
                    <v-chip size="small" color="warning">
                      {{ priceImpact }}%
                    </v-chip>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- 流动性标签页 -->
        <v-window-item :value="1">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold mb-4">提供流动性</div>
                
                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis mb-2">{{ pool.token0.symbol }} 数量</div>
                    <v-text-field
                      v-model.number="liquidityData.amount0"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      @update:model-value="calculateLiquidityRatio"
                    ></v-text-field>
                  </v-card-text>
                </v-card>

                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis mb-2">{{ pool.token1.symbol }} 数量</div>
                    <v-text-field
                      v-model.number="liquidityData.amount1"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      @update:model-value="calculateLiquidityRatio"
                    ></v-text-field>
                  </v-card-text>
                </v-card>

                <v-row>
                  <v-col cols="6">
                    <v-btn
                      color="success"
                      size="large"
                      block
                      rounded="lg"
                      @click="addLiquidity"
                    >
                      <v-icon class="mr-2">mdi-plus</v-icon>
                      添加流动性
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      color="error"
                      size="large"
                      block
                      rounded="lg"
                      @click="removeLiquidity"
                    >
                      <v-icon class="mr-2">mdi-minus</v-icon>
                      移除流动性
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1" class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold mb-4">我的LP头寸</div>
                  
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">LP Token 余额</div>
                    <div class="text-h6 font-weight-bold">1,234.56</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">占池比例</div>
                    <div class="text-h6 font-weight-bold">5.2%</div>
                  </div>

                  <v-divider class="my-3"></v-divider>

                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">未实现收益</div>
                    <div class="text-body-2">+ $234.50</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- TWAP 标签页 -->
        <v-window-item :value="2">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold mb-4">时间加权平均价格 (TWAP)</div>
                
                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis mb-2">查询时间范围</div>
                    <v-select
                      v-model="twapData.timeRange"
                      :items="['1小时', '4小时', '24小时', '7天', '30天']"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                    ></v-select>
                  </v-card-text>
                </v-card>

                <v-btn
                  color="primary"
                  size="large"
                  block
                  rounded="lg"
                  @click="queryTWAP"
                >
                  <v-icon class="mr-2">mdi-magnify</v-icon>
                  查询 TWAP
                </v-btn>
              </v-col>

              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1" class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold mb-4">查询结果</div>
                  
                  <v-alert v-if="!twapData.result" color="info" variant="tonal" rounded="lg">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    选择时间范围并点击查询
                  </v-alert>

                  <div v-else>
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">TWAP 价格</div>
                      <div class="text-h6 font-weight-bold">$ {{ twapData.result }}</div>
                    </div>

                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">与现货价格差异</div>
                      <div class="text-body-2">
                        <v-chip :color="twapData.difference >= 0 ? 'success' : 'error'" text-color="white" size="small">
                          {{ twapData.difference >= 0 ? '+' : '' }}{{ twapData.difference }}%
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- Flash Swap 标签页 -->
        <v-window-item :value="3">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 font-weight-bold mb-4">闪电贷 (Flash Swap)</div>
                
                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis mb-2">借入代币</div>
                    <v-select
                      v-model="flashData.borrowToken"
                      :items="[
                        { title: pool.token0.symbol, value: 0 },
                        { title: pool.token1.symbol, value: 1 }
                      ]"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                    ></v-select>
                  </v-card-text>
                </v-card>

                <v-card class="mb-4 rounded-lg" variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis mb-2">借入数量</div>
                    <v-text-field
                      v-model.number="flashData.amount"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                    ></v-text-field>
                  </v-card-text>
                </v-card>

                <v-btn
                  color="warning"
                  size="large"
                  block
                  rounded="lg"
                  @click="executeFlashSwap"
                >
                  <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                  执行闪电贷
                </v-btn>
              </v-col>

              <v-col cols="12" md="6">
                <v-card rounded="lg" elevation="1" class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold mb-4">闪电贷说明</div>
                  
                  <v-alert color="warning" variant="tonal" rounded="lg" class="mb-3">
                    <v-icon class="mr-2">mdi-alert</v-icon>
                    <div class="text-caption">
                      <div class="font-weight-bold">风险提示</div>
                      <div>闪电贷必须在同一交易内偿还，包括 {{ pool.fee }} 的手续费</div>
                    </div>
                  </v-alert>

                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">借入数量</div>
                    <div class="text-body-2">{{ flashData.amount || '0' }} {{ getBorrowTokenSymbol }}</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">手续费 ({{ pool.fee }})</div>
                    <div class="text-body-2">{{ calculateFlashFee }} {{ getBorrowTokenSymbol }}</div>
                  </div>

                  <div>
                    <div class="text-caption text-medium-emphasis">需偿还总额</div>
                    <div class="text-h6 font-weight-bold">{{ calculateFlashTotal }} {{ getBorrowTokenSymbol }}</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- 操作成功提示 -->
    <v-snackbar v-model="showActionSuccess" timeout="3000" color="success">
      {{ actionSuccessMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPoolByAddress } from '@/mock/pools'

const router = useRouter()
const route = useRoute()

// 从路由参数获取池
const poolAddress = route.params.address
const pool = getPoolByAddress(poolAddress)

// 检查池是否存在
if (!pool) {
  router.push('/poollist')
}

// 响应式状态
const activeTab = ref(0)
const showActionSuccess = ref(false)
const actionSuccessMessage = ref('')

// Swap 数据
const swapData = ref({
  fromAmount: 100,
  toAmount: 200,
  slippage: '0.5%'
})

// 流动性数据
const liquidityData = ref({
  amount0: 1000,
  amount1: 1000
})

// TWAP 数据
const twapData = ref({
  timeRange: '24小时',
  result: null,
  difference: 0
})

// Flash Swap 数据
const flashData = ref({
  borrowToken: 0,
  amount: 1000
})

// 获取代币颜色
const getTokenColor = (token) => {
  return token?.color || 'primary'
}

// 交换方向
const swapDirection = () => {
  const temp = swapData.value.fromAmount
  swapData.value.fromAmount = swapData.value.toAmount
  swapData.value.toAmount = temp
}

// Swap 计算属性
const swapExchangeRate = computed(() => {
  const rate = swapData.value.toAmount / swapData.value.fromAmount
  return rate.toFixed(4)
})

const minimumReceived = computed(() => {
  const slippagePercent = parseFloat(swapData.value.slippage)
  const minimum = swapData.value.toAmount * (1 - slippagePercent / 100)
  return minimum.toFixed(2)
})

const tradeFee = computed(() => {
  const feePercent = parseFloat(pool.fee)
  const fee = swapData.value.fromAmount * (feePercent / 100)
  return fee.toFixed(4)
})

const priceImpact = computed(() => {
  const impact = (swapData.value.fromAmount * 0.05).toFixed(2)
  return impact
})

// Flash Swap 计算
const getBorrowTokenSymbol = computed(() => {
  return flashData.value.borrowToken === 0 ? pool.token0.symbol : pool.token1.symbol
})

const calculateFlashFee = computed(() => {
  const feePercent = parseFloat(pool.fee)
  const fee = flashData.value.amount * (feePercent / 100)
  return fee.toFixed(4)
})

const calculateFlashTotal = computed(() => {
  const feePercent = parseFloat(pool.fee)
  const total = flashData.value.amount * (1 + feePercent / 100)
  return total.toFixed(4)
})

// 方法
const executeSwap = () => {
  actionSuccessMessage.value = `成功交换了 ${swapData.value.fromAmount} ${pool.token0.symbol}`
  showActionSuccess.value = true
}

const addLiquidity = () => {
  actionSuccessMessage.value = `成功添加了流动性`
  showActionSuccess.value = true
}

const removeLiquidity = () => {
  actionSuccessMessage.value = `成功移除了流动性`
  showActionSuccess.value = true
}

const calculateLiquidityRatio = () => {
  // 计算流动性比例
}

const queryTWAP = () => {
  const mockResult = (Math.random() * 2000 + 8000).toFixed(2)
  const mockDifference = ((Math.random() - 0.5) * 2).toFixed(2)
  twapData.value.result = mockResult
  twapData.value.difference = mockDifference
}

const executeFlashSwap = () => {
  actionSuccessMessage.value = `成功执行了闪电贷，借入了 ${flashData.value.amount} ${getBorrowTokenSymbol.value}`
  showActionSuccess.value = true
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
