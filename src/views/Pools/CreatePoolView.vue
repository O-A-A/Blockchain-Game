<template>
  <v-container class="py-6" style="max-width: 80%">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- 顶部标题 -->
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold mb-2">创建流动性池</h1>
          <p class="text-body-2 text-medium-emphasis">选择两种代币并提供初始流动性</p>
        </div>

        <!-- 代币对选择 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
            选择交易对
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-row align="center">
              <!-- Token0 选择 -->
              <v-col cols="12" md="5">
                <v-combobox
                  v-model="selectedToken0"
                  :items="tokenOptions"
                  item-title="symbol"
                  item-value="address"
                  label="选择代币 A"
                  prepend-inner-icon="mdi-currency-usd"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar size="24" :color="getTokenColor(item.raw)">
                          <span class="text-white text-caption">{{ item.raw.symbol.charAt(0) }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.symbol }}</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{ item.raw.name }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>

              <!-- 交换按钮 -->
              <v-col cols="12" md="2" class="text-center">
                <v-btn
                  icon
                  color="primary"
                  variant="flat"
                  @click="swapTokens"
                  rounded="lg"
                >
                  <v-icon>mdi-swap-horizontal</v-icon>
                </v-btn>
              </v-col>

              <!-- Token1 选择 -->
              <v-col cols="12" md="5">
                <v-combobox
                  v-model="selectedToken1"
                  :items="tokenOptions"
                  item-title="symbol"
                  item-value="address"
                  label="选择代币 B"
                  prepend-inner-icon="mdi-water"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar size="24" :color="getTokenColor(item.raw)">
                          <span class="text-white text-caption">{{ item.raw.symbol.charAt(0) }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.symbol }}</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{ item.raw.name }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>

            <!-- 选中的代币信息 -->
            <v-row v-if="token0 && token1" class="mt-4">
              <v-col cols="12" md="6">
                <v-card variant="outlined" rounded="lg" class="pa-3">
                  <div class="text-caption text-medium-emphasis">代币 A</div>
                  <div class="font-weight-medium">{{ token0.symbol }}</div>
                  <div class="text-caption text-medium-emphasis mt-1">{{ token0.name }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" rounded="lg" class="pa-3">
                  <div class="text-caption text-medium-emphasis">代币 B</div>
                  <div class="font-weight-medium">{{ token1.symbol }}</div>
                  <div class="text-caption text-medium-emphasis mt-1">{{ token1.name }}</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 初始流动性设置 -->
        <v-card v-if="token0 && token1" class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-water-percent</v-icon>
            初始流动性
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-row>
              <!-- Token0 数量 -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="liquidityData.amount0"
                  :label="`提供 ${token0.symbol} 数量`"
                  type="number"
                  min="0"
                  prepend-inner-icon="mdi-plus-box"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  @update:model-value="calculatePrice"
                ></v-text-field>
              </v-col>

              <!-- Token1 数量 -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="liquidityData.amount1"
                  :label="`提供 ${token1.symbol} 数量`"
                  type="number"
                  min="0"
                  prepend-inner-icon="mdi-plus-box"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  @update:model-value="calculatePrice"
                ></v-text-field>
              </v-col>

              <!-- 初始价格显示 -->
              <v-col cols="12">
                <v-card variant="outlined" rounded="lg" class="pa-4">
                  <div class="text-caption text-medium-emphasis mb-2">初始交换价格</div>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="text-body-2">
                        1 {{ token0.symbol }} = 
                        <span class="font-weight-bold">{{ initialPrice0To1 }}</span> 
                        {{ token1.symbol }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-body-2">
                        1 {{ token1.symbol }} = 
                        <span class="font-weight-bold">{{ initialPrice1To0 }}</span> 
                        {{ token0.symbol }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 池信息设置 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-information</v-icon>
            池信息
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-text-field
              v-model="poolData.name"
              label="流动性池名称"
              placeholder="例如: USDC-ETH Pool"
              prepend-inner-icon="mdi-tag"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || '池名称不能为空']"
            ></v-text-field>

            <v-row class="mt-4">
              <v-col cols="12" md="6">
                <div class="text-caption text-medium-emphasis mb-2">手续费</div>
                <v-select
                  v-model="poolData.fee"
                  :items="['0.01%', '0.05%', '0.3%', '1%']"
                  label="选择手续费等级"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" rounded="lg" class="pa-3 mt-6">
                  <div class="text-caption text-medium-emphasis">手续费说明</div>
                  <div class="text-body-2 mt-1">{{ feeDescription }}</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 操作按钮 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              block
              rounded="lg"
              @click="goBack"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              返回
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              color="primary"
              size="large"
              block
              rounded="lg"
              :disabled="!canCreatePool"
              :loading="isLoading"
              @click="createPool"
            >
              <v-icon class="mr-2">mdi-plus-circle</v-icon>
              创建流动性池
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 成功对话框 -->
    <v-dialog v-model="showSuccessDialog" max-width="400" persistent rounded="lg">
      <v-card class="rounded-lg">
        <v-card-title class="text-center pt-6">
          <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6 font-weight-bold">流动性池创建成功！</div>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">池名称</div>
            <div class="text-body-2 font-weight-medium">{{ poolData.name }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">交易对</div>
            <div class="text-body-2 font-weight-medium">{{ token0.symbol }}/{{ token1.symbol }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">池地址</div>
            <div class="d-flex align-center bg-surface-variant pa-3 rounded">
              <span class="text-caption font-mono">{{ createdPoolAddress }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                class="ml-2"
                @click="copyAddress"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>

          <v-alert color="success" variant="tonal" rounded="lg">
            <v-icon class="mr-2">mdi-information</v-icon>
            流动性池已创建，你可以在池列表中查看
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            size="large"
            block
            rounded="lg"
            @click="goToPoolList"
          >
            查看池列表
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 复制成功提示 -->
    <v-snackbar v-model="showCopySuccess" timeout="2000" color="success">
      地址已复制到剪贴板
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ALL_TOKENS } from '@/mock/tokens'

const router = useRouter()

// 响应式数据
const selectedToken0 = ref(null)
const selectedToken1 = ref(null)
const isLoading = ref(false)
const showSuccessDialog = ref(false)
const showCopySuccess = ref(false)
const createdPoolAddress = ref('')

const liquidityData = ref({
  amount0: 1000,
  amount1: 1000
})

const poolData = ref({
  name: '',
  fee: '0.3%'
})

// Token 列表
const tokenOptions = computed(() => ALL_TOKENS)

// 获取选中的代币
const token0 = computed(() => {
  if (!selectedToken0.value) return null
  return ALL_TOKENS.find(t => t.address === selectedToken0.value)
})

const token1 = computed(() => {
  if (!selectedToken1.value) return null
  return ALL_TOKENS.find(t => t.address === selectedToken1.value)
})

// 获取代币颜色
const getTokenColor = (token) => {
  return token?.color || 'primary'
}

// 计算初始价格
const initialPrice0To1 = computed(() => {
  if (!liquidityData.value.amount0 || !liquidityData.value.amount1) return '0'
  const price = liquidityData.value.amount1 / liquidityData.value.amount0
  return price.toFixed(4)
})

const initialPrice1To0 = computed(() => {
  if (!liquidityData.value.amount0 || !liquidityData.value.amount1) return '0'
  const price = liquidityData.value.amount0 / liquidityData.value.amount1
  return price.toFixed(4)
})

// 手续费描述
const feeDescription = computed(() => {
  const descriptions = {
    '0.01%': '稳定币对 (推荐)',
    '0.05%': '相关资产对',
    '0.3%': '通用交易对 (推荐)',
    '1%': '稀有或高波动对'
  }
  return descriptions[poolData.value.fee] || '通用手续费'
})

// 是否可以创建池
const canCreatePool = computed(() => {
  return (
    token0.value &&
    token1.value &&
    selectedToken0.value !== selectedToken1.value &&
    liquidityData.value.amount0 > 0 &&
    liquidityData.value.amount1 > 0 &&
    poolData.value.name
  )
})

// 交换代币
const swapTokens = () => {
  const temp = selectedToken0.value
  selectedToken0.value = selectedToken1.value
  selectedToken1.value = temp
}

// 计算价格
const calculatePrice = () => {
  // 自动计算，computed 会处理
}

// 生成模拟池地址
const generateMockAddress = () => {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return address
}

// 创建流动性池
const createPool = async () => {
  if (!canCreatePool.value) return

  isLoading.value = true

  try {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    createdPoolAddress.value = generateMockAddress()
    showSuccessDialog.value = true
  } finally {
    isLoading.value = false
  }
}

// 复制地址
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(createdPoolAddress.value)
    showCopySuccess.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 导航到池列表
const goToPoolList = () => {
  showSuccessDialog.value = false
  router.push('/poollist')
}

// 初始化：设置默认代币
selectedToken0.value = ALL_TOKENS[0]?.address || null
selectedToken1.value = ALL_TOKENS[1]?.address || null
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
