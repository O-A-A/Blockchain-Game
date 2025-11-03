<template>
  <v-row>
    <!-- 查询信息板块 - View/Pure 函数 -->
    <v-col cols="12" md="6">
      <v-card rounded="lg" elevation="1" class="mb-4">
        <v-card-title class="bg-primary-container text-primary">
          <v-icon class="mr-2">mdi-eye</v-icon>
          查询信息
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- 函数选择 -->
          <v-select
            v-model="selectedViewFunction"
            :items="viewFunctions"
            item-title="name"
            item-value="name"
            return-object
            label="选择查询函数"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            @update:model-value="onViewFunctionChange"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon color="primary" size="small">mdi-eye</v-icon>
                </template>
                <template v-slot:title>
                  <span class="font-weight-medium">{{ item.raw.name }}</span>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- 函数参数 -->
          <div v-if="selectedViewFunction && selectedViewFunction.inputs && selectedViewFunction.inputs.length > 0" class="mt-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">函数参数</div>
            <v-row>
              <v-col v-for="(input, index) in selectedViewFunction.inputs" :key="index" cols="12">
                <v-text-field
                  v-model="viewFunctionParams[index]"
                  :label="`${input.name || `参数${index + 1}`} (${input.type})`"
                  :placeholder="`输入 ${input.type} 类型的值`"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :hint="getInputHint(input.type)"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </div>

          <!-- 查询按钮 -->
          <v-btn
            v-if="selectedViewFunction"
            color="primary"
            size="large"
            block
            rounded="lg"
            class="mt-4"
            @click="callViewFunction"
            :loading="viewLoading"
          >
            <v-icon class="mr-2">mdi-magnify</v-icon>
            查询
          </v-btn>

          <!-- 查询结果 -->
          <v-card v-if="viewResult" rounded="lg" variant="outlined" class="mt-4">
            <v-card-title class="text-subtitle-2">
              <v-icon class="mr-2" :color="viewResult.success ? 'success' : 'error'">
                {{ viewResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              查询结果
            </v-card-title>
            <v-card-text>
              <v-alert :type="viewResult.success ? 'success' : 'error'" variant="tonal">
                <pre class="text-caption" style="white-space: pre-wrap; word-break: break-all;">{{ formatResult(viewResult) }}</pre>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- 调用函数板块 - 非 View/Pure 函数 -->
    <v-col cols="12" md="6">
      <v-card rounded="lg" elevation="1" class="mb-4">
        <v-card-title class="bg-success-container text-success">
          <v-icon class="mr-2">mdi-send</v-icon>
          调用函数
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- 函数选择 -->
          <v-select
            v-model="selectedWriteFunction"
            :items="writeFunctions"
            item-title="name"
            item-value="name"
            return-object
            label="选择调用函数"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            @update:model-value="onWriteFunctionChange"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :color="getFunctionTypeColor(item.raw.stateMutability)" size="small">
                    {{ getFunctionTypeIcon(item.raw.stateMutability) }}
                  </v-icon>
                </template>
                <template v-slot:title>
                  <span class="font-weight-medium">{{ item.raw.name }}</span>
                </template>
                <template v-slot:subtitle>
                  <span class="text-caption">{{ item.raw.stateMutability }}</span>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- 函数说明 -->
          <v-alert v-if="selectedWriteFunction" :type="getFunctionAlertType(selectedWriteFunction.stateMutability)" variant="tonal" class="mt-4">
            <div class="text-caption">
              <strong>{{ selectedWriteFunction.name }}</strong>
              <v-chip size="x-small" :color="getFunctionTypeColor(selectedWriteFunction.stateMutability)" class="ml-2">
                {{ selectedWriteFunction.stateMutability }}
              </v-chip>
            </div>
            <div class="text-caption mt-1">
              {{ getFunctionDescription(selectedWriteFunction.stateMutability) }}
            </div>
          </v-alert>

          <!-- 函数参数 -->
          <div v-if="selectedWriteFunction && selectedWriteFunction.inputs && selectedWriteFunction.inputs.length > 0" class="mt-4">
            <div class="text-subtitle-2 font-weight-bold mb-3">函数参数</div>
            <v-row>
              <v-col v-for="(input, index) in selectedWriteFunction.inputs" :key="index" cols="12">
                <v-text-field
                  v-model="writeFunctionParams[index]"
                  :label="`${input.name || `参数${index + 1}`} (${input.type})`"
                  :placeholder="`输入 ${input.type} 类型的值`"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :hint="getInputHint(input.type)"
                  persistent-hint
                >
                  <template v-slot:prepend-inner>
                    <v-icon size="small" color="primary">mdi-code-tags</v-icon>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- 特殊：如果需要发送 ETH (payable) -->
          <v-text-field
            v-if="selectedWriteFunction && selectedWriteFunction.stateMutability === 'payable'"
            v-model="ethValue"
            label="发送 ETH 数量"
            placeholder="例如: 0.1"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mt-4"
          >
            <template v-slot:append-inner>
              <v-chip size="small" color="warning">ETH</v-chip>
            </template>
          </v-text-field>

          <!-- 调用按钮 -->
          <v-btn
            v-if="selectedWriteFunction"
            color="success"
            size="large"
            block
            rounded="lg"
            class="mt-4"
            @click="callWriteFunction"
            :loading="writeLoading"
          >
            <v-icon class="mr-2">mdi-send</v-icon>
            发送交易
          </v-btn>

          <!-- 调用结果 -->
          <v-card v-if="writeResult" rounded="lg" variant="outlined" class="mt-4">
            <v-card-title class="text-subtitle-2">
              <v-icon class="mr-2" :color="writeResult.success ? 'success' : 'error'">
                {{ writeResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              调用结果
            </v-card-title>
            <v-card-text>
              <v-alert :type="writeResult.success ? 'success' : 'error'" variant="tonal">
                <pre class="text-caption" style="white-space: pre-wrap; word-break: break-all;">{{ formatResult(writeResult) }}</pre>
              </v-alert>
              
              <!-- 如果是交易，显示交易详情 -->
              <div v-if="writeResult.success && writeResult.hash" class="mt-3">
                <div class="text-caption text-medium-emphasis mb-2">交易详情</div>
                <v-chip size="small" class="mr-2" prepend-icon="mdi-identifier">
                  <span class="font-mono">{{ formatAddress(writeResult.hash) }}</span>
                </v-chip>
                <v-chip v-if="writeResult.blockNumber" size="small" prepend-icon="mdi-cube">
                  区块 {{ writeResult.blockNumber }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import contractInteractionService from '@/services/contractInteractionService'
import poolService from '@/services/poolService' // 引入 poolService
import { ethers } from 'ethers'
import { useDialog } from '@/composables/useDialog'
import { useWalletStore } from '@/store/wallet'

const props = defineProps<{
  contractAddress: string
  contractType: 'erc20' | 'wbkc' | 'amm'
  poolInfo?: any // 接收完整的 poolInfo 对象
}>()

const { success, error: showError } = useDialog()
const walletStore = useWalletStore()

const selectedViewFunction = ref<any>(null)
const viewFunctionParams = ref<string[]>([])
const viewLoading = ref(false)
const viewResult = ref<any>(null)

const selectedWriteFunction = ref<any>(null)
const writeFunctionParams = ref<string[]>([])
const ethValue = ref('')
const writeLoading = ref(false)
const writeResult = ref<any>(null)

// 监听 props.poolInfo 的变化
watch(() => props.poolInfo, (newPoolInfo) => {
  // console.log('Pool info updated in caller:', newPoolInfo)
}, { deep: true })

// 获取 ABI
const abi = computed(() => {
  return contractInteractionService.getAbi(props.contractType)
})

// 过滤出所有函数
const functions = computed(() => {
  return abi.value.filter((item: any) => item.type === 'function')
})

// View/Pure 函数列表
const viewFunctions = computed(() => {
  return functions.value.filter((f: any) => 
    f.stateMutability === 'view' || f.stateMutability === 'pure'
  ).map((func: any) => ({
    ...func,
    title: func.name,
    value: func.name
  }))
})

// 非 View/Pure 函数列表
const writeFunctions = computed(() => {
  return functions.value.filter((f: any) => 
    f.stateMutability !== 'view' && f.stateMutability !== 'pure'
  ).map((func: any) => ({
    ...func,
    title: func.name,
    value: func.name
  }))
})

// 当查询函数改变时
const onViewFunctionChange = (func: any) => {
  if (func) {
    viewFunctionParams.value = new Array(func.inputs?.length || 0).fill('')
    viewResult.value = null
  }
}

// 当调用函数改变时
const onWriteFunctionChange = (func: any) => {
  if (func) {
    writeFunctionParams.value = new Array(func.inputs?.length || 0).fill('')
    ethValue.value = ''
    writeResult.value = null
  }
}

// 调用查询函数
const callViewFunction = async () => {
  if (!selectedViewFunction.value) return
  
  viewLoading.value = true
  viewResult.value = null
  
  try {
    const callResult = await contractInteractionService.callViewFunction({
      address: props.contractAddress,
      abi: abi.value,
      functionName: selectedViewFunction.value.name,
      args: viewFunctionParams.value // 保持所有参数，即使是空字符串
    })
    
    viewResult.value = {
      success: true,
      data: callResult
    }
  } catch (err: any) {
    console.error('查询函数失败:', err)
    showError('查询失败', err.message || '查询失败')
  } finally {
    viewLoading.value = false
  }
}

// 调用写入函数
const callWriteFunction = async () => {
  if (!selectedWriteFunction.value) return

  // 检查登录状态
  if (!walletStore.isLoggedIn) {
    showError('需要登录', '此操作需要登录，请先登录后再执行')
    return
  }
  
  writeLoading.value = true
  writeResult.value = null
  
  try {
    // 自动授权逻辑
    if (props.contractType === 'amm' && walletStore.address && props.poolInfo) {
      const functionName = selectedWriteFunction.value.name
      const params = writeFunctionParams.value

      const spender = props.contractAddress
      const tokenA = props.poolInfo.token0.address
      const tokenB = props.poolInfo.token1.address

      if (functionName === 'swapAForB' && params[0]) {
        await contractInteractionService.checkAndApprove(tokenA, spender, params[0])
      } else if (functionName === 'swapBForA' && params[0]) {
        await contractInteractionService.checkAndApprove(tokenB, spender, params[0])
      } else if (functionName === 'addLiquidity' && params[0] && params[1]) {
        await contractInteractionService.checkAndApprove(tokenA, spender, params[0])
        await contractInteractionService.checkAndApprove(tokenB, spender, params[1])
      }
    }

    const txResult = await contractInteractionService.sendTransaction({
      address: props.contractAddress,
      abi: abi.value,
      functionName: selectedWriteFunction.value.name,
      args: writeFunctionParams.value, // 保持所有参数，即使是空字符串
      value: ethValue.value || undefined
    })
    
    writeResult.value = {
      success: txResult.success,
      hash: txResult.hash,
      blockNumber: txResult.receipt?.blockNumber,
      error: txResult.error
    }
    
    if (txResult.success) {
      success(`${selectedWriteFunction.value.name} 调用成功`, txResult.hash ? `交易哈希: ${txResult.hash}` : '')
    } else {
      showError(`${selectedWriteFunction.value.name} 调用失败`, txResult.error || '未知错误')
    }
  } catch (err: any) {
    console.error('调用函数失败:', err)
    writeResult.value = {
      success: false,
      error: err.message || '调用失败'
    }
    showError('调用失败', err.message || '调用失败')
  } finally {
    writeLoading.value = false
  }
}

// 暴露方法给父组件（支持预填充参数）
const setSelectedFunction = (functionName: string, prefillParams?: string[]) => {
  const func = functions.value.find((f: any) => f.name === functionName)
  if (!func) return
  
  const isView = func.stateMutability === 'view' || func.stateMutability === 'pure'
  
  if (isView) {
    selectedViewFunction.value = func
    onViewFunctionChange(func)
    if (prefillParams && prefillParams.length > 0) {
      setTimeout(() => {
        viewFunctionParams.value = [...prefillParams]
      }, 50)
    }
  } else {
    selectedWriteFunction.value = func
    onWriteFunctionChange(func)
    if (prefillParams && prefillParams.length > 0) {
      setTimeout(() => {
        writeFunctionParams.value = [...prefillParams]
      }, 50)
    }
  }
}

// 暴露给父组件
defineExpose({
  setSelectedFunction
})

// 获取函数类型颜色
const getFunctionTypeColor = (stateMutability: string) => {
  switch (stateMutability) {
    case 'payable':
      return 'warning'
    default:
      return 'success'
  }
}

// 获取函数类型图标
const getFunctionTypeIcon = (stateMutability: string) => {
  switch (stateMutability) {
    case 'payable':
      return 'mdi-cash'
    default:
      return 'mdi-pencil'
  }
}

// 获取函数提示类型
const getFunctionAlertType = (stateMutability: string) => {
  switch (stateMutability) {
    case 'payable':
      return 'warning'
    default:
      return 'success'
  }
}

// 获取函数描述
const getFunctionDescription = (stateMutability: string) => {
  switch (stateMutability) {
    case 'payable':
      return '可支付函数，可以接收 ETH，会消耗 Gas'
    default:
      return '状态修改函数，会改变区块链状态，消耗 Gas'
  }
}

// 获取输入提示
const getInputHint = (type: string) => {
  if (type === 'address') return '格式: 0x...'
  if (type.includes('uint')) return '格式: 整数（如 1000000）'
  if (type.includes('int')) return '格式: 整数（可正可负）'
  if (type === 'bool') return '格式: true 或 false'
  if (type === 'string') return '格式: 文本字符串'
  if (type === 'bytes') return '格式: 0x...'
  return `输入 ${type} 类型的值`
}

// 格式化结果
const formatResult = (result: any) => {
  if (!result.success) {
    return `错误: ${result.error}`
  }
  
  if (result.hash) {
    return `交易成功！\n哈希: ${result.hash}\n区块: ${result.blockNumber || '等待确认...'}`
  }
  
  // 格式化数据
  return JSON.stringify(result.data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }, 2)
}

// 格式化地址
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.slice(0, 10) + '...' + address.slice(-8)
}
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}

pre {
  font-family: 'Courier New', monospace;
  margin: 0;
}
</style>
