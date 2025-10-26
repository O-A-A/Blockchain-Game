<template>
  <v-card rounded="lg" elevation="1">
    <v-card-title class="bg-surface-variant">
      <v-icon class="mr-2">mdi-code-braces</v-icon>
      合约函数调用
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- 函数选择 -->
      <v-select
        v-model="selectedFunction"
        :items="functionItems"
        label="选择函数"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        @update:model-value="onFunctionChange"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
              <v-icon :color="getFunctionTypeColor(item.raw.stateMutability)">
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
      <v-alert v-if="selectedFunction" :type="getFunctionAlertType(selectedFunction.stateMutability)" variant="tonal" class="mt-4">
        <div class="text-caption">
          <strong>{{ selectedFunction.name }}</strong>
          <v-chip size="x-small" :color="getFunctionTypeColor(selectedFunction.stateMutability)" class="ml-2">
            {{ selectedFunction.stateMutability }}
          </v-chip>
        </div>
        <div class="text-caption mt-1">
          {{ getFunctionDescription(selectedFunction.stateMutability) }}
        </div>
      </v-alert>

      <!-- 函数参数 -->
      <div v-if="selectedFunction && selectedFunction.inputs && selectedFunction.inputs.length > 0" class="mt-4">
        <div class="text-subtitle-2 font-weight-bold mb-3">函数参数</div>
        <v-row>
          <v-col v-for="(input, index) in selectedFunction.inputs" :key="index" cols="12">
            <v-text-field
              v-model="functionParams[index]"
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
        v-if="selectedFunction && selectedFunction.stateMutability === 'payable'"
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
        v-if="selectedFunction"
        :color="selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure' ? 'primary' : 'success'"
        size="large"
        block
        rounded="lg"
        class="mt-4"
        @click="callFunction"
        :loading="loading"
      >
        <v-icon class="mr-2">
          {{ selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure' ? 'mdi-eye' : 'mdi-send' }}
        </v-icon>
        {{ selectedFunction.stateMutability === 'view' || selectedFunction.stateMutability === 'pure' ? '查询' : '发送交易' }}
      </v-btn>

      <!-- 调用结果 -->
      <v-card v-if="result" rounded="lg" variant="outlined" class="mt-4">
        <v-card-title class="text-subtitle-2">
          <v-icon class="mr-2" :color="result.success ? 'success' : 'error'">
            {{ result.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          调用结果
        </v-card-title>
        <v-card-text>
          <v-alert :type="result.success ? 'success' : 'error'" variant="tonal">
            <pre class="text-caption" style="white-space: pre-wrap; word-break: break-all;">{{ formatResult(result) }}</pre>
          </v-alert>
          
          <!-- 如果是交易，显示交易详情 -->
          <div v-if="result.success && result.hash" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-2">交易详情</div>
            <v-chip size="small" class="mr-2" prepend-icon="mdi-identifier">
              <span class="font-mono">{{ formatAddress(result.hash) }}</span>
            </v-chip>
            <v-chip v-if="result.blockNumber" size="small" prepend-icon="mdi-cube">
              区块 {{ result.blockNumber }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import contractInteractionService from '@/services/contractInteractionService'
import { ethers } from 'ethers'

const props = defineProps<{
  contractAddress: string
  contractType: 'erc20' | 'wbkc' | 'amm'
}>()

const selectedFunction = ref<any>(null)
const functionParams = ref<string[]>([])
const ethValue = ref('')
const loading = ref(false)
const result = ref<any>(null)

// 获取 ABI
const abi = computed(() => {
  return contractInteractionService.getAbi(props.contractType)
})

// 过滤出所有函数
const functions = computed(() => {
  return abi.value.filter((item: any) => item.type === 'function')
})

// 函数列表项
const functionItems = computed(() => {
  return functions.value.map((func: any) => ({
    title: func.name,
    value: func.name,
    ...func
  }))
})

// 当函数改变时
const onFunctionChange = () => {
  const func = functions.value.find((f: any) => f.name === selectedFunction.value)
  if (func) {
    selectedFunction.value = func
    // 重置参数
    functionParams.value = new Array(func.inputs?.length || 0).fill('')
    ethValue.value = ''
    result.value = null
  }
}

// 暴露方法给父组件（支持预填充参数）
const setSelectedFunction = (functionName: string, prefillParams?: string[]) => {
  selectedFunction.value = functionName
  onFunctionChange()
  
  // 如果提供了预填充参数，设置它们
  if (prefillParams && prefillParams.length > 0) {
    setTimeout(() => {
      functionParams.value = [...prefillParams]
    }, 50)
  }
}

// 暴露给父组件
defineExpose({
  setSelectedFunction
})

// 调用函数
const callFunction = async () => {
  if (!selectedFunction.value) return
  
  loading.value = true
  result.value = null
  
  try {
    const isViewFunction = selectedFunction.value.stateMutability === 'view' || 
                          selectedFunction.value.stateMutability === 'pure'
    
    if (isViewFunction) {
      // 调用只读函数
      const callResult = await contractInteractionService.callViewFunction({
        address: props.contractAddress,
        abi: abi.value,
        functionName: selectedFunction.value.name,
        args: functionParams.value.filter(p => p !== '')
      })
      
      result.value = {
        success: true,
        data: callResult
      }
    } else {
      // 发送交易
      const txResult = await contractInteractionService.sendTransaction({
        address: props.contractAddress,
        abi: abi.value,
        functionName: selectedFunction.value.name,
        args: functionParams.value.filter(p => p !== ''),
        value: ethValue.value || undefined
      })
      
      result.value = {
        success: txResult.success,
        hash: txResult.hash,
        blockNumber: txResult.receipt?.blockNumber,
        error: txResult.error
      }
    }
  } catch (err: any) {
    console.error('调用函数失败:', err)
    result.value = {
      success: false,
      error: err.message || '调用失败'
    }
  } finally {
    loading.value = false
  }
}

// 获取函数类型颜色
const getFunctionTypeColor = (stateMutability: string) => {
  switch (stateMutability) {
    case 'view':
    case 'pure':
      return 'primary'
    case 'payable':
      return 'warning'
    default:
      return 'success'
  }
}

// 获取函数类型图标
const getFunctionTypeIcon = (stateMutability: string) => {
  switch (stateMutability) {
    case 'view':
    case 'pure':
      return 'mdi-eye'
    case 'payable':
      return 'mdi-cash'
    default:
      return 'mdi-pencil'
  }
}

// 获取函数提示类型
const getFunctionAlertType = (stateMutability: string) => {
  switch (stateMutability) {
    case 'view':
    case 'pure':
      return 'info'
    case 'payable':
      return 'warning'
    default:
      return 'success'
  }
}

// 获取函数描述
const getFunctionDescription = (stateMutability: string) => {
  switch (stateMutability) {
    case 'view':
      return '只读函数，查询区块链状态，不消耗 Gas'
    case 'pure':
      return '纯函数，不读取也不修改状态，不消耗 Gas'
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

