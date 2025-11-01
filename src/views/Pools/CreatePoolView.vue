<template>
  <v-container class="py-6" style="max-width: 80%">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- 顶部标题 -->
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold mb-2">创建流动性池</h1>
          <p class="text-body-2 text-medium-emphasis">部署新的 AMM 流动性池合约</p>
        </div>

        <!-- 代币对选择 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
            选择交易对
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="poolForm" @submit.prevent="deployPool">
              <v-row align="center">
                <v-col cols="12" md="5">
                  <v-select
                    v-model="formData.tokenA"
                    :items="tokenOptions"
                    item-title="label"
                    item-value="address"
                    label="选择代币 A"
                    prepend-inner-icon="mdi-currency-usd"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[v => !!v || '请选择代币 A']"
                  >
                  </v-select>

                <!-- Token A 信息 -->
                <v-card v-if="selectedTokenA" variant="outlined" rounded="lg" class="pa-3 mt-2">
                  <div class="text-caption text-medium-emphasis">代币 A</div>
                  <div class="font-weight-medium">{{ selectedTokenA?.name }}</div>
                  <div class="text-caption text-medium-emphasis font-mono">{{ formatAddress(selectedTokenA.address) }}</div>
                </v-card>
              </v-col>

              <!-- 交换按钮 -->
              <v-col cols="12" md="2" class="text-center">
                <v-btn
                  icon
                  color="primary"
                  variant="flat"
                  @click="swapTokens"
                  :disabled="!formData.tokenA || !formData.tokenB"
                >
                  <v-icon>mdi-swap-horizontal</v-icon>
                </v-btn>
              </v-col>

              <!-- Token B 选择 -->
              <v-col cols="12" md="5">
                <v-select
                  v-model="formData.tokenB"
                  :items="tokenOptions"
                  item-title="label"
                  item-value="address"
                  label="选择代币 B"
                  prepend-inner-icon="mdi-water"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[v => !!v || '请选择代币 B']"
                >
                </v-select>

                <!-- Token B 信息 -->
                <v-card v-if="selectedTokenB" variant="outlined" rounded="lg" class="pa-3 mt-2">
                  <div class="text-caption text-medium-emphasis">代币 B</div>
                  <div class="font-weight-medium">{{ selectedTokenB?.name }}</div>
                  <div class="text-caption text-medium-emphasis font-mono">{{ formatAddress(selectedTokenB.address) }}</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- 验证提示 -->
            <v-alert v-if="formData.tokenA && formData.tokenB && formData.tokenA === formData.tokenB"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              不能选择相同的代币创建池子
            </v-alert>

            <v-alert v-if="selectedTokenA && selectedTokenB && formData.tokenA !== formData.tokenB"
              type="success"
              variant="tonal"
              class="mt-4"
            >
              <div class="font-weight-bold">交易对: {{ selectedTokenA.address }}/{{ selectedTokenB.address }}</div>
            </v-alert>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 池信息 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-information</v-icon>
            池信息
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="poolInfoForm">
              <v-text-field
                v-model="formData.poolName"
                label="流动性池名称"
                placeholder="例如: USDC-ETH Pool"
                prepend-inner-icon="mdi-tag"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hint="池的名称，UTF-8编码后最长32字节（必填）"
                persistent-hint
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="formData.imgUrl"
                label="图片 URL"
                placeholder="例如: https://example.com/pool.png"
                prepend-inner-icon="mdi-image"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hint="池图标的URL地址，UTF-8编码后最长32字节（必填）"
                persistent-hint
              ></v-text-field>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 注意事项 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-text class="pa-4">
            <v-alert color="info" variant="tonal">
              <v-icon class="mr-2">mdi-information</v-icon>
              <div>
                <div class="font-weight-medium mb-2">注意事项</div>
                <ul class="pl-4">
                  <li>部署流动性池将创建一个新的 AMM 智能合约</li>
                  <li>部署后池子地址无法更改</li>
                  <li>部署完成后，您需要单独调用合约添加初始流动性</li>
                  <li>确保两个代币地址正确且已部署</li>
                </ul>
              </div>
            </v-alert>
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
              :disabled="!canDeploy"
              :loading="isLoading"
              @click="deployPool"
            >
              <v-icon class="mr-2">mdi-rocket-launch</v-icon>
              部署流动性池
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 成功对话框 -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-center pt-6">
          <v-icon size="64" color="success" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h5 font-weight-bold">流动性池部署成功！</div>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">池名称</div>
            <div class="text-body-1 font-weight-medium">{{ deployedPool.poolName }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">交易对</div>
            <div class="text-body-1 font-weight-medium">
              {{ deployedPool.tokenA || '0x NULL' }} / {{ deployedPool.tokenB || '0x NULL' }}
            </div>
            <div v-if="deployedTokenA || deployedTokenB" class="text-caption text-medium-emphasis mt-1">
              {{ deployedTokenA?.name || '未知代币' }} / {{ deployedTokenB?.name || '未知代币' }}
            </div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">池地址</div>
            <div class="d-flex align-center bg-surface-variant pa-3 rounded">
              <span class="text-caption font-mono flex-grow-1">{{ deployedPool.address }}</span>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="copyAddress(deployedPool.address)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </div>
          </div>

          <v-alert color="success" variant="tonal" rounded="lg">
            <v-icon class="mr-2">mdi-information</v-icon>
            流动性池已部署，您可以在池列表中查看并添加流动性
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6">
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

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { useContractsStore } from '@/store/contracts'
import contractDeployService from '@/services/contractDeployService'
import { useDialog } from '@/composables/useDialog'

const router = useRouter()
const contractsStore = useContractsStore()
const { error: showError, warning } = useDialog()

// 表单引用
const poolForm = ref<any>(null)
const poolInfoForm = ref<any>(null)

// 表单数据
const formData = ref({
  tokenA: '',
  tokenB: '',
  poolName: -1,
  imgUrl: -1
})

const isLoading = ref(false)
const showSuccessDialog = ref(false)
const showCopySuccess = ref(false)

const deployedPool = ref({
  address: '',
  poolName: -1,
  tokenA: '',
  tokenB: ''
})

// 部署后的代币信息（用于显示）
const deployedTokenA = computed(() => {
  if (!deployedPool.value.tokenA) return null
  return contractsStore.getContractByAddress(deployedPool.value.tokenA)
})

const deployedTokenB = computed(() => {
  if (!deployedPool.value.tokenB) return null
  return contractsStore.getContractByAddress(deployedPool.value.tokenB)
})

// 获取所有代币（ERC20 + WBKC）
const tokenOptions = computed(() => {
  const allTokens = contractsStore.allTokens
  return allTokens.map(token => ({
    ...token,
    label: `${token.address || 'N/A'} - ${token.name || '未命名'}`,
  }))
})

// 获取选中的代币A
const selectedTokenA = computed(() => {
  if (!formData.value.tokenA) return null
  return contractsStore.getContractByAddress(formData.value.tokenA)
})

// 获取选中的代币B
const selectedTokenB = computed(() => {
  if (!formData.value.tokenB) return null
  return contractsStore.getContractByAddress(formData.value.tokenB)
})

// 检查是否可以部署
const canDeploy = computed(() => {
  return (
    formData.value.tokenA &&
    formData.value.tokenB &&
    formData.value.tokenA !== formData.value.tokenB &&
    formData.value.poolName &&
    formData.value.imgUrl
  )
})

// 格式化地址
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.slice(0, 10) + '...' + address.slice(-8)
}

// 交换代币
const swapTokens = () => {
  const temp = formData.value.tokenA
  formData.value.tokenA = formData.value.tokenB
  formData.value.tokenB = temp
}

// 部署池子
const deployPool = async () => {
  if (!canDeploy.value) return

  isLoading.value = true

  try {
    // 开始部署 AMM 流动性池
    const result = await contractDeployService.deployAMM({
      tokenA: formData.value.tokenA,
      tokenB: formData.value.tokenB,
      poolName: formData.value.poolName,
      imgUrl: formData.value.imgUrl
    })

    if (!result.success) {
      throw new Error(result.error || '部署失败')
    }


    deployedPool.value = {
      address: result.contractAddress || '',
      poolName: formData.value.poolName,
      tokenA: formData.value.tokenA,
      tokenB: formData.value.tokenB
    }

    showSuccessDialog.value = true

    // 清空表单并重置验证状态
    formData.value = {
      tokenA: '',
      tokenB: '',
      poolName: -1,
      imgUrl: -1
    }
    
    // 重置表单验证状态
    nextTick(() => {
      poolForm.value?.resetValidation()
      poolInfoForm.value?.resetValidation()
    })
  } catch (err: any) {
    showError('部署失败', err.message || '未知错误')
  } finally {
    isLoading.value = false
  }
}

// 复制地址
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    showCopySuccess.value = true
  } catch (err) {
    // 复制失败，静默处理
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

// 页面加载时检查代币数量
onMounted(() => {
  if (tokenOptions.value.length === 0) {
    warning('暂无可用代币', '请先部署代币或扫描区块链查找已部署的代币。')
  } else if (tokenOptions.value.length < 2) {
    warning('代币数量不足', '至少需要 2 个代币才能创建流动性池。请先部署更多代币。')
  }
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
