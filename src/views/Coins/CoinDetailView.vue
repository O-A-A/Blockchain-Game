<template>
  <v-container class="py-6" style="max-width: 90%">
    <!-- 加载状态 -->
    <v-row v-if="loading" justify="center">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">加载代币信息...</p>
      </v-col>
    </v-row>

    <!-- 错误状态 -->
    <v-row v-else-if="error" justify="center">
      <v-col cols="12" md="8">
        <v-alert type="error" variant="tonal" prominent>
          <v-alert-title>加载失败</v-alert-title>
          {{ error }}
        </v-alert>
        <v-btn color="primary" class="mt-4" @click="goBack">返回列表</v-btn>
      </v-col>
    </v-row>

    <!-- 主内容 -->
    <template v-else>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <!-- 代币信息卡片 -->
          <v-card class="mb-6 rounded-lg" elevation="3">
            <v-card-title class="pa-6">
              <div class="d-flex align-center w-100">
                <v-avatar color="primary" size="56" class="mr-4">
                  <span class="text-white text-h5">{{ tokenInfo.symbol ? tokenInfo.symbol.charAt(0) : 'T' }}</span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h5 font-weight-bold">{{ tokenInfo.name || '未命名代币' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ tokenInfo.symbol || 'N/A' }}</div>
                </div>
                <v-chip :color="isWBKC ? 'secondary' : 'primary'" variant="elevated">
                  {{ isWBKC ? 'WBKC' : 'ERC20' }}
                </v-chip>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">合约地址</div>
                  <div class="d-flex align-center">
                    <span class="font-mono text-body-2">{{ formatAddress(tokenAddress) }}</span>
                    <v-btn icon size="x-small" variant="text" class="ml-2" @click="copyAddress(tokenAddress)">
                      <v-icon size="small">mdi-content-copy</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">总供应量</div>
                  <div class="text-body-2 font-weight-medium">{{ formatBalance(tokenInfo.totalSupply) }}</div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">拥有者</div>
                  <div class="font-mono text-body-2">{{ formatAddress(tokenInfo.owner) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 查询功能 -->
          <v-row class="mb-6">
            <!-- 查询余额 -->
            <v-col cols="12" md="6">
              <v-card rounded="lg" elevation="2">
                <v-card-title class="pa-4 bg-primary-light">
                  <v-icon class="mr-2">mdi-wallet-outline</v-icon>
                  查询余额
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-text-field
                    v-model="balanceQuery.address"
                    label="账户地址"
                    placeholder="0x..."
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account"
                    class="mb-2"
                  ></v-text-field>
                  <v-btn
                    color="primary"
                    block
                    @click="queryBalance"
                    :loading="balanceQuery.loading"
                    :disabled="!balanceQuery.address"
                  >
                    <v-icon class="mr-2">mdi-magnify</v-icon>
                    查询余额
                  </v-btn>
                  <v-alert v-if="balanceQuery.result !== null" type="success" variant="tonal" class="mt-4">
                    余额: <strong>{{ formatBalance(balanceQuery.result) }} {{ tokenInfo.symbol }}</strong>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- 查询授权额度 -->
            <v-col cols="12" md="6">
              <v-card rounded="lg" elevation="2">
                <v-card-title class="pa-4 bg-secondary-light">
                  <v-icon class="mr-2">mdi-shield-check-outline</v-icon>
                  查询授权额度
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-text-field
                    v-model="allowanceQuery.owner"
                    label="拥有者地址"
                    placeholder="0x..."
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-key"
                    class="mb-2"
                  ></v-text-field>
                  <v-text-field
                    v-model="allowanceQuery.spender"
                    label="被授权者地址"
                    placeholder="0x..."
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-check"
                    class="mb-2"
                  ></v-text-field>
                  <v-btn
                    color="secondary"
                    block
                    @click="queryAllowance"
                    :loading="allowanceQuery.loading"
                    :disabled="!allowanceQuery.owner || !allowanceQuery.spender"
                  >
                    <v-icon class="mr-2">mdi-magnify</v-icon>
                    查询授权
                  </v-btn>
                  <v-alert v-if="allowanceQuery.result !== null" type="success" variant="tonal" class="mt-4">
                    授权额度: <strong>{{ formatBalance(allowanceQuery.result) }} {{ tokenInfo.symbol }}</strong>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 操作标签页 -->
          <v-card rounded="lg" elevation="3">
            <v-tabs v-model="activeTab" bg-color="primary" dark grow>
              <v-tab>转账</v-tab>
              <v-tab>授权</v-tab>
              <v-tab v-if="!isWBKC">铸造 (Mint)</v-tab>
              <v-tab v-if="isWBKC">铸造 (Deposit ETH)</v-tab>
              <v-tab v-if="isWBKC">销毁 (Burn)</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <!-- 转账标签页 -->
              <v-window-item>
                <v-card-text class="pa-6">
                  <v-text-field
                    v-model="transferData.to"
                    label="接收地址"
                    placeholder="0x..."
                    variant="outlined"
                    prepend-inner-icon="mdi-account-arrow-right"
                    class="mb-4"
                  ></v-text-field>
                  <v-text-field
                    v-model="transferData.amount"
                    label="转账金额"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-cash"
                  ></v-text-field>
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    class="mt-4"
                    @click="transfer"
                    :loading="transferData.loading"
                    :disabled="!transferData.to || !transferData.amount"
                  >
                    <v-icon class="mr-2">mdi-send</v-icon>
                    执行转账
                  </v-btn>
                </v-card-text>
              </v-window-item>

              <!-- 授权标签页 -->
              <v-window-item>
                <v-card-text class="pa-6">
                  <v-text-field
                    v-model="approveData.spender"
                    label="授权地址"
                    placeholder="0x..."
                    variant="outlined"
                    prepend-inner-icon="mdi-account-check"
                    class="mb-4"
                  ></v-text-field>
                  <v-text-field
                    v-model="approveData.amount"
                    label="授权额度"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-shield-check"
                  ></v-text-field>
                  <v-btn
                    color="secondary"
                    size="large"
                    block
                    class="mt-4"
                    @click="approve"
                    :loading="approveData.loading"
                    :disabled="!approveData.spender || !approveData.amount"
                  >
                    <v-icon class="mr-2">mdi-check-circle</v-icon>
                    执行授权
                  </v-btn>
                </v-card-text>
              </v-window-item>

              <!-- ERC20 铸造标签页 -->
              <v-window-item v-if="!isWBKC">
                <v-card-text class="pa-6">
                  <v-alert type="info" variant="tonal" class="mb-4">
                    只有合约拥有者可以铸造新代币
                  </v-alert>
                  <v-text-field
                    v-model="mintData.to"
                    label="接收地址"
                    placeholder="0x..."
                    variant="outlined"
                    prepend-inner-icon="mdi-account-plus"
                    class="mb-4"
                  ></v-text-field>
                  <v-text-field
                    v-model="mintData.amount"
                    label="铸造数量"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-plus-box"
                  ></v-text-field>
                  <v-btn
                    color="success"
                    size="large"
                    block
                    class="mt-4"
                    @click="mint"
                    :loading="mintData.loading"
                    :disabled="!mintData.to || !mintData.amount"
                  >
                    <v-icon class="mr-2">mdi-plus-circle</v-icon>
                    铸造代币
                  </v-btn>
                </v-card-text>
              </v-window-item>

              <!-- WBKC 铸造标签页 (Deposit ETH) -->
              <v-window-item v-if="isWBKC">
                <v-card-text class="pa-6">
                  <v-alert type="info" variant="tonal" class="mb-4">
                    通过存入 ETH 来铸造等量的 WBKC 代币
                  </v-alert>
                  <v-text-field
                    v-model="wbkcMintData.ethAmount"
                    label="存入 ETH 数量"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-ethereum"
                    suffix="ETH"
                  ></v-text-field>
                  <v-btn
                    color="success"
                    size="large"
                    block
                    class="mt-4"
                    @click="mintWBKC"
                    :loading="wbkcMintData.loading"
                    :disabled="!wbkcMintData.ethAmount || wbkcMintData.ethAmount <= 0"
                  >
                    <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
                    存入 ETH 并铸造
                  </v-btn>
                </v-card-text>
              </v-window-item>

              <!-- WBKC 销毁标签页 (Burn) -->
              <v-window-item v-if="isWBKC">
                <v-card-text class="pa-6">
                  <v-alert type="warning" variant="tonal" class="mb-4">
                    销毁 WBKC 代币以取回等量的 ETH
                  </v-alert>
                  <v-text-field
                    v-model="wbkcBurnData.amount"
                    label="销毁 WBKC 数量"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-fire"
                    suffix="WBKC"
                  ></v-text-field>
                  <v-btn
                    color="error"
                    size="large"
                    block
                    class="mt-4"
                    @click="burnWBKC"
                    :loading="wbkcBurnData.loading"
                    :disabled="!wbkcBurnData.amount || wbkcBurnData.amount <= 0"
                  >
                    <v-icon class="mr-2">mdi-fire</v-icon>
                    销毁并取回 ETH
                  </v-btn>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- 成功提示 -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      {{ successMessage }}
    </v-snackbar>

    <!-- 复制成功提示 -->
    <v-snackbar v-model="showCopySuccess" color="success" timeout="2000">
      地址已复制到剪贴板
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContractsStore } from '@/store/contracts'
import contractInteractionService from '@/services/contractInteractionService'
import { ethers } from 'ethers'

const route = useRoute()
const router = useRouter()
const contractsStore = useContractsStore()

const tokenAddress = ref(route.params.addr as string)
const loading = ref(true)
const error = ref('')
const activeTab = ref(0)
const showSuccess = ref(false)
const showCopySuccess = ref(false)
const successMessage = ref('')

// 代币信息
const tokenInfo = ref({
  name: '',
  symbol: '',
  totalSupply: '0',
  owner: '',
  contractType: 0
})

// 判断是否为 WBKC
const isWBKC = computed(() => tokenInfo.value.contractType === 1)

// 查询余额
const balanceQuery = ref({
  address: '',
  result: null as string | null,
  loading: false
})

// 查询授权
const allowanceQuery = ref({
  owner: '',
  spender: '',
  result: null as string | null,
  loading: false
})

// 转账数据
const transferData = ref({
  to: '',
  amount: '',
  loading: false
})

// 授权数据
const approveData = ref({
  spender: '',
  amount: '',
  loading: false
})

// ERC20 铸造数据
const mintData = ref({
  to: '',
  amount: '',
  loading: false
})

// WBKC 铸造数据
const wbkcMintData = ref({
  ethAmount: '',
  loading: false
})

// WBKC 销毁数据
const wbkcBurnData = ref({
  amount: '',
  loading: false
})

// 格式化地址
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.slice(0, 10) + '...' + address.slice(-8)
}

// 格式化余额
const formatBalance = (balance: string) => {
  if (!balance) return '0'
  try {
    const formatted = ethers.formatEther(balance)
    return Number(formatted).toLocaleString(undefined, { maximumFractionDigits: 6 })
  } catch {
    return balance
  }
}

// 复制地址
const copyAddress = async (address: string) => {
  try {
    await navigator.clipboard.writeText(address)
    showCopySuccess.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 加载代币信息
const loadTokenInfo = async () => {
  loading.value = true
  error.value = ''

  try {
    // 先从 store 中查找
    const contractInfo = contractsStore.getContractByAddress(tokenAddress.value)

    if (contractInfo) {
      // 从 store 中读取基本信息
      tokenInfo.value = {
        name: contractInfo.name || '',
        symbol: (contractInfo as any).symbol || '',
        totalSupply: contractInfo.totalSupply || '0',
        owner: contractInfo.owner,
        contractType: contractInfo.type
      }
    } else {
      // 如果 store 中没有，直接从链上读取
      const abi = isWBKC.value
        ? contractInteractionService.getAbi('wbkc')
        : contractInteractionService.getAbi('erc20')

      const [name, totalSupply, owner, contractType] = await Promise.all([
        contractInteractionService.callViewFunction({
          address: tokenAddress.value,
          abi,
          functionName: 'coin_name'
        }),
        contractInteractionService.callViewFunction({
          address: tokenAddress.value,
          abi,
          functionName: 'totalSupply'
        }),
        contractInteractionService.callViewFunction({
          address: tokenAddress.value,
          abi,
          functionName: 'coinOwner'
        }),
        contractInteractionService.callViewFunction({
          address: tokenAddress.value,
          abi,
          functionName: 'contract_type'
        })
      ])

      // 转换 uint256 编码的字符串
      const nameStr = typeof name === 'string' ? name : name.toString()

      tokenInfo.value = {
        name: nameStr,
        symbol: deriveSymbol(nameStr),
        totalSupply: totalSupply.toString(),
        owner,
        contractType: Number(contractType)
      }
    }

    console.log('代币信息加载成功:', tokenInfo.value)
  } catch (err: any) {
    console.error('加载代币信息失败:', err)
    error.value = err.message || '加载失败，请检查合约地址是否正确'
  } finally {
    loading.value = false
  }
}

// 从名称派生符号
const deriveSymbol = (name: string): string => {
  if (!name) return 'TKN'
  if (name.length <= 10) return name.toUpperCase()
  return name.substring(0, 6).toUpperCase()
}

// 查询余额
const queryBalance = async () => {
  balanceQuery.value.loading = true
  balanceQuery.value.result = null

  try {
    const abi = isWBKC.value
      ? contractInteractionService.getAbi('wbkc')
      : contractInteractionService.getAbi('erc20')

    const balance = await contractInteractionService.callViewFunction({
      address: tokenAddress.value,
      abi,
      functionName: 'balanceOf',
      args: [balanceQuery.value.address]
    })

    balanceQuery.value.result = balance.toString()
    console.log('余额查询成功:', balance.toString())
  } catch (err: any) {
    console.error('查询余额失败:', err)
    alert(`查询失败: ${err.message || '未知错误'}`)
  } finally {
    balanceQuery.value.loading = false
  }
}

// 查询授权额度
const queryAllowance = async () => {
  allowanceQuery.value.loading = true
  allowanceQuery.value.result = null

  try {
    const abi = isWBKC.value
      ? contractInteractionService.getAbi('wbkc')
      : contractInteractionService.getAbi('erc20')

    const allowance = await contractInteractionService.callViewFunction({
      address: tokenAddress.value,
      abi,
      functionName: 'allowanceOf',
      args: [allowanceQuery.value.owner, allowanceQuery.value.spender]
    })

    allowanceQuery.value.result = allowance.toString()
    console.log('授权额度查询成功:', allowance.toString())
  } catch (err: any) {
    console.error('查询授权失败:', err)
    alert(`查询失败: ${err.message || '未知错误'}`)
  } finally {
    allowanceQuery.value.loading = false
  }
}

// 转账
const transfer = async () => {
  transferData.value.loading = true

  try {
    const abi = isWBKC.value
      ? contractInteractionService.getAbi('wbkc')
      : contractInteractionService.getAbi('erc20')

    const amount = ethers.parseEther(transferData.value.amount)

    const result = await contractInteractionService.sendTransaction({
      address: tokenAddress.value,
      abi,
      functionName: 'transfer',
      args: [transferData.value.to, amount.toString()]
    })

    if (result.success) {
      successMessage.value = `转账成功！交易哈希: ${result.hash}`
      showSuccess.value = true
      transferData.value.to = ''
      transferData.value.amount = ''
    } else {
      alert(`转账失败: ${result.error}`)
    }
  } catch (err: any) {
    console.error('转账失败:', err)
    alert(`转账失败: ${err.message || '未知错误'}`)
  } finally {
    transferData.value.loading = false
  }
}

// 授权
const approve = async () => {
  approveData.value.loading = true

  try {
    const abi = isWBKC.value
      ? contractInteractionService.getAbi('wbkc')
      : contractInteractionService.getAbi('erc20')

    const amount = ethers.parseEther(approveData.value.amount)

    const result = await contractInteractionService.sendTransaction({
      address: tokenAddress.value,
      abi,
      functionName: 'approve',
      args: [approveData.value.spender, amount.toString()]
    })

    if (result.success) {
      successMessage.value = `授权成功！交易哈希: ${result.hash}`
      showSuccess.value = true
      approveData.value.spender = ''
      approveData.value.amount = ''
    } else {
      alert(`授权失败: ${result.error}`)
    }
  } catch (err: any) {
    console.error('授权失败:', err)
    alert(`授权失败: ${err.message || '未知错误'}`)
  } finally {
    approveData.value.loading = false
  }
}

// ERC20 铸造
const mint = async () => {
  mintData.value.loading = true

  try {
    const abi = contractInteractionService.getAbi('erc20')
    const amount = ethers.parseEther(mintData.value.amount)

    const result = await contractInteractionService.sendTransaction({
      address: tokenAddress.value,
      abi,
      functionName: 'mintToken',
      args: [mintData.value.to, amount.toString()]
    })

    if (result.success) {
      successMessage.value = `铸造成功！交易哈希: ${result.hash}`
      showSuccess.value = true
      mintData.value.to = ''
      mintData.value.amount = ''
      // 刷新总供应量
      loadTokenInfo()
    } else {
      alert(`铸造失败: ${result.error}`)
    }
  } catch (err: any) {
    console.error('铸造失败:', err)
    alert(`铸造失败: ${err.message || '未知错误'}`)
  } finally {
    mintData.value.loading = false
  }
}

// WBKC 铸造 (存入 ETH)
const mintWBKC = async () => {
  wbkcMintData.value.loading = true

  try {
    const result = await contractInteractionService.mintWBKC(
      tokenAddress.value,
      wbkcMintData.value.ethAmount
    )

    if (result.success) {
      successMessage.value = `存入成功！交易哈希: ${result.hash}`
      showSuccess.value = true
      wbkcMintData.value.ethAmount = ''
      // 刷新总供应量
      loadTokenInfo()
    } else {
      alert(`存入失败: ${result.error}`)
    }
  } catch (err: any) {
    console.error('存入失败:', err)
    alert(`存入失败: ${err.message || '未知错误'}`)
  } finally {
    wbkcMintData.value.loading = false
  }
}

// WBKC 销毁 (取回 ETH)
const burnWBKC = async () => {
  wbkcBurnData.value.loading = true

  try {
    const amount = ethers.parseEther(wbkcBurnData.value.amount)

    const result = await contractInteractionService.burnWBKC(
      tokenAddress.value,
      amount.toString()
    )

    if (result.success) {
      successMessage.value = `销毁成功！交易哈希: ${result.hash}`
      showSuccess.value = true
      wbkcBurnData.value.amount = ''
      // 刷新总供应量
      loadTokenInfo()
    } else {
      alert(`销毁失败: ${result.error}`)
    }
  } catch (err: any) {
    console.error('销毁失败:', err)
    alert(`销毁失败: ${err.message || '未知错误'}`)
  } finally {
    wbkcBurnData.value.loading = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/coinlist')
}

// 页面加载时获取代币信息
onMounted(() => {
  if (!tokenAddress.value) {
    error.value = '缺少合约地址'
    loading.value = false
    return
  }
  loadTokenInfo()
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
}

.bg-primary-light {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.bg-secondary-light {
  background-color: rgba(var(--v-theme-secondary), 0.08);
}
</style>
