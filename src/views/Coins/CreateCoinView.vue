<template>
  <v-container class="py-6" style="max-width: 80%">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- 顶部标题 -->
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold mb-2">发行新代币</h1>
          <p class="text-body-2 text-medium-emphasis">创建自己的 ERC20 或 Wrapped 代币</p>
        </div>

        <!-- 代币类型选择 -->
        <v-card class="mb-6 rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-folder-plus</v-icon>
            选择代币类型
          </v-card-title>
          <v-divider></v-divider>
          
          <v-card-text class="pa-6">
            <v-row>
              <!-- ERC20 选项 -->
              <v-col cols="12" md="6">
                <v-card
                  :class="[
                    'pa-4 rounded-lg cursor-pointer transition-all',
                    tokenType === 'erc20'
                      ? 'border-primary bg-primary-light'
                      : 'border-secondary hover:elevation-4'
                  ]"
                  :border="tokenType === 'erc20'"
                  @click="tokenType = 'erc20'"
                  style="cursor: pointer; border: 2px solid transparent; position: relative"
                  :style="{
                    borderColor: tokenType === 'erc20' ? 'rgb(var(--v-theme-primary))' : 'transparent',
                    backgroundColor: tokenType === 'erc20' ? 'rgba(var(--v-theme-primary), 0.08)' : 'transparent'
                  }"
                >
                  <div class="d-flex align-center mb-2">
                    <v-icon size="40" color="primary" class="mr-3">mdi-currency-usd</v-icon>
                    <div>
                      <div class="text-h6 font-weight-bold">ERC20 代币</div>
                      <div class="text-caption text-medium-emphasis">标准可交易代币</div>
                    </div>
                  </div>
                  <div class="text-body-2 mt-3">
                    <ul class="pl-0" style="list-style: none">
                      <li class="mb-1">✓ 自定义初始供应量</li>
                      <li class="mb-1">✓ 完全可编程</li>
                      <li class="mb-1">✓ 支持全部 ERC20 功能</li>
                    </ul>
                  </div>
                </v-card>
              </v-col>

              <!-- Wrapped 代币选项 -->
              <v-col cols="12" md="6">
                <v-card
                  :class="[
                    'pa-4 rounded-lg cursor-pointer transition-all',
                    tokenType === 'wrapped'
                      ? 'border-primary bg-primary-light'
                      : 'border-secondary hover:elevation-4'
                  ]"
                  @click="tokenType = 'wrapped'"
                  style="cursor: pointer; border: 2px solid transparent; position: relative"
                  :style="{
                    borderColor: tokenType === 'wrapped' ? 'rgb(var(--v-theme-primary))' : 'transparent',
                    backgroundColor: tokenType === 'wrapped' ? 'rgba(var(--v-theme-primary), 0.08)' : 'transparent'
                  }"
                >
                  <div class="d-flex align-center mb-2">
                    <v-icon size="40" color="secondary" class="mr-3">mdi-water</v-icon>
                    <div>
                      <div class="text-h6 font-weight-bold">Wrapped 代币</div>
                      <div class="text-caption text-medium-emphasis">包装资产代币</div>
                    </div>
                  </div>
                  <div class="text-body-2 mt-3">
                    <ul class="pl-0" style="list-style: none">
                      <li class="mb-1">✓ 包装原生资产</li>
                      <li class="mb-1">✓ 初始供应量固定为 0</li>
                      <li class="mb-1">✓ 通过转账铸造</li>
                    </ul>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 代币信息表单 -->
        <v-card class="rounded-lg" elevation="2">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-form-textbox</v-icon>
            代币信息
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="deployToken" ref="form">
              <v-row>
                <!-- 代币名称 -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="代币名称"
                    placeholder="例如: My Token"
                    prepend-inner-icon="mdi-alphabetical"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || '代币名称不能为空', v => v.length <= 31 || '名称不能超过31个字符']"
                    rounded="lg"
                    hint="智能合约将存储此名称，最长31字符"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <!-- 图片URL -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.imgUrl"
                    label="图片URL"
                    placeholder="例如: https://example.com/token.png"
                    prepend-inner-icon="mdi-image"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[v => !!v || '图片URL不能为空', v => v.length <= 31 || 'URL不能超过31个字符']"
                    required
                    hint="代币图标的URL地址，最长31字符（必填）"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <!-- 初始供应量 (仅 ERC20 显示) -->
                <v-col v-if="tokenType === 'erc20'" cols="12">
                  <v-text-field
                    v-model="formData.initialSupply"
                    label="初始供应量"
                    type="number"
                    min="0"
                    prepend-inner-icon="mdi-plus-box"
                    variant="outlined"
                    density="comfortable"
                    :rules="[
                      v => v !== null && v !== '' || '初始供应量不能为空',
                      v => Number(v) >= 0 || '初始供应量不能为负数'
                    ]"
                    rounded="lg"
                    hint="代币的初始发行量（单位：个，将自动转换为最小单位）"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <!-- Wrapped 代币说明 -->
                <v-col v-if="tokenType === 'wrapped'" cols="12">
                  <v-alert color="info" variant="tonal" rounded="lg" class="mb-0">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    <div>
                      <div class="font-weight-medium">Wrapped 代币信息</div>
                      <div class="text-caption">初始供应量固定为 0，用户可通过转账原生币来铸造对应的 Wrapped 代币。小数位数固定为 18 位。</div>
                    </div>
                  </v-alert>
                </v-col>

                <!-- 通用说明 -->
                <v-col cols="12">
                  <v-alert color="warning" variant="tonal" rounded="lg" class="mb-0">
                    <v-icon class="mr-2">mdi-alert</v-icon>
                    <div>
                      <div class="font-weight-medium">注意事项</div>
                      <div class="text-caption">• 代币小数位数固定为 18 位<br>• 代币符号将根据名称自动生成<br>• 部署后无法修改</div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>

              <!-- 操作按钮 -->
              <v-row class="mt-6">
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
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    rounded="lg"
                    :loading="isLoading"
                    :disabled="isLoading"
                  >
                    <v-icon class="mr-2">mdi-rocket-launch</v-icon>
                    部署代币
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 成功对话框 -->
    <v-dialog v-model="showSuccessDialog" max-width="400" persistent rounded="lg">
      <v-card class="rounded-lg">
        <v-card-title class="text-center pt-6">
          <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6 font-weight-bold">代币部署成功！</div>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">代币名称</div>
            <div class="text-body-2 font-weight-medium">{{ deployedToken.name }}</div>
          </div>
          
          <div class="mb-4" v-if="deployedToken.symbol">
            <div class="text-caption text-medium-emphasis mb-1">代币符号</div>
            <div class="text-body-2 font-weight-medium">{{ deployedToken.symbol }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">合约地址</div>
            <div class="d-flex align-center bg-surface-variant pa-3 rounded">
              <span class="text-caption font-mono">{{ deployedToken.address }}</span>
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
            你可以在代币列表中找到你的代币
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            size="large"
            block
            rounded="lg"
            @click="goToTokenList"
          >
            查看代币列表
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import contractDeployService from '@/services/contractDeployService'
import { useContractsStore } from '@/store/contracts'

const router = useRouter()
const contractsStore = useContractsStore()

const tokenType = ref('erc20')
const form = ref(null)
const isLoading = ref(false)
const showSuccessDialog = ref(false)
const showCopySuccess = ref(false)

const formData = ref({
  name: '',
  imgUrl: '',
  initialSupply: '1000000'
})

const deployedToken = ref({
  name: '',
  symbol: '',
  address: '',
  type: '',
  decimals: 18,
  initialSupply: '0'
})

// 部署代币
const deployToken = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  isLoading.value = true

  try {
    let result

    if (tokenType.value === 'erc20') {
      // 部署 ERC20 代币
      // 正在部署 ERC20 代币
      deployProgress.value = '正在部署 ERC20 代币...'

      result = await contractDeployService.deployERC20({
        name: formData.value.name,
        totalSupply: formData.value.initialSupply,
        imgUrl: formData.value.imgUrl || ''
      })
    } else {
      // 部署 WBKC 代币
      // 正在部署 WBKC 代币
      deployProgress.value = '正在部署 WBKC 代币...'

      result = await contractDeployService.deployWBKC({
        name: formData.value.name,
        imgUrl: formData.value.imgUrl || ''
      })
    }

    // 检查部署是否成功
    if (!result.success) {
      throw new Error(result.error || '部署失败')
    }

    if (!result.contractAddress || !result.contractInfo) {
      throw new Error('部署结果不完整')
    }

    // 不需要再次添加到store，因为 deployService 已经添加了
    // contractsStore.addContract(result.contractInfo)

    // 设置部署结果
    deployedToken.value = {
      name: result.contractInfo.name || formData.value.name,
      symbol: result.contractInfo.symbol || 'TOKEN',
      address: result.contractAddress,
      type: tokenType.value,
      decimals: 18,
      initialSupply: tokenType.value === 'erc20' ? formData.value.initialSupply : '0'
    }

    showSuccessDialog.value = true
  } catch (error) {
    alert(`部署失败: ${error.message || '未知错误'}`)
  } finally {
    isLoading.value = false
  }
}

// 复制地址
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(deployedToken.value.address)
    showCopySuccess.value = true
  } catch (err) {
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 导航到代币列表
const goToTokenList = () => {
  showSuccessDialog.value = false
  router.push('/coinlist')
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary));
}

.bg-primary-light {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.font-mono {
  font-family: 'Courier New', monospace;
}

ul {
  margin: 0;
  padding: 0;
}
</style>
