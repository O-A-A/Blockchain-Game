<template>
  <v-container class="py-6" style="max-width: 80%">
    <!-- 顶部标题栏 -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="8">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">代币市场</h1>
          <p class="text-body-2 text-medium-emphasis">浏览所有可用的代币和发行新代币</p>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="goToDeploy"
          rounded="lg"
        >
          发行新代币
        </v-btn>
      </v-col>
    </v-row>

    <!-- 搜索和筛选栏 -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="搜索代币名称或符号"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          rounded="lg"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filterType"
          :items="[
            { title: '全部代币', value: 'all' },
            { title: '仅 ERC20', value: 'erc20' },
            { title: '仅 Wrapped', value: 'wrapped' }
          ]"
          label="代币类型"
          variant="outlined"
          density="compact"
          rounded="lg"
        ></v-select>
      </v-col>
    </v-row>

    <!-- 扫描状态提示 -->
    <v-row v-if="scanMessage" class="mb-4">
      <v-col cols="12">
        <v-alert 
          :type="isLoading ? 'info' : 'success'" 
          variant="tonal"
          :icon="isLoading ? 'mdi-loading mdi-spin' : 'mdi-check-circle'"
        >
          {{ scanMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- ERC20 代币表格 -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="bg-primary-container text-primary pa-4">
            <v-icon class="mr-2">mdi-currency-usd</v-icon>
            ERC20 标准代币 ({{ filteredErc20.length }})
          </v-card-title>
          
          <div v-if="filteredErc20.length === 0" class="pa-8 text-center">
            <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-off</v-icon>
            <p class="text-body-2 text-medium-emphasis">暂无符合条件的代币</p>
          </div>

          <v-table v-else class="rounded-lg" density="compact">
            <thead>
              <tr class="bg-surface-variant">
                <th class="text-left text-subtitle-2 font-weight-bold">代币</th>
                <th class="text-left text-subtitle-2 font-weight-bold">供应量</th>
                <th class="text-center text-subtitle-2 font-weight-bold">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="token in filteredErc20"
                :key="token.address"
                class="hover-row"
                @click="goToDetail(token.address)"
                style="cursor: pointer"
              >
                <td>
                  <div class="d-flex align-center py-2">
                    <v-avatar color="primary" size="32" class="mr-3">
                      <span class="text-white font-weight-bold">N</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ uint256ToString(token.name) || '未命名' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="font-weight-medium">{{ token.totalSupply || '0' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatAddress(token.address) }}</div>
                </td>
                <td class="text-center">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click.stop="copyToClipboard(token.address)"
                  >
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- Wrapped 代币表格 -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="bg-secondary-container text-secondary pa-4">
            <v-icon class="mr-2">mdi-water</v-icon>
            Wrapped 代币 ({{ filteredWrapped.length }})
          </v-card-title>
          
          <div v-if="filteredWrapped.length === 0" class="pa-8 text-center">
            <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-off</v-icon>
            <p class="text-body-2 text-medium-emphasis">暂无符合条件的代币</p>
          </div>

          <v-table v-else class="rounded-lg" density="compact">
            <thead>
              <tr class="bg-surface-variant">
                <th class="text-left text-subtitle-2 font-weight-bold">代币</th>
                <th class="text-left text-subtitle-2 font-weight-bold">原生资产</th>
                <th class="text-center text-subtitle-2 font-weight-bold">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="token in filteredWrapped"
                :key="token.address"
                class="hover-row"
                @click="goToDetail(token.address)"
                style="cursor: pointer"
              >
                <td>
                  <div class="d-flex align-center py-2">
                    <v-avatar color="secondary" size="32" class="mr-3">
                      <span class="text-white font-weight-bold">W</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ uint256ToString(token.name) || 'Wrapped Token' }}</div>
                      <div class="text-caption text-medium-emphasis">WBKC</div>
                    </div>
                  </div>
                </td>
                <td>
                  <v-chip color="info" variant="outlined" size="small" class="mb-1">
                    原生资产
                  </v-chip>
                  <div class="text-caption text-medium-emphasis">{{ formatAddress(token.address) }}</div>
                </td>
                <td class="text-center">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click.stop="copyToClipboard(token.address)"
                  >
                    <v-icon size="small">mdi-content-copy</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 复制成功提示 -->
    <v-snackbar v-model="showCopySuccess" timeout="2000" color="success">
      地址已复制到剪贴板
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContractsStore } from '@/store/contracts'
import { uint256ToString } from '@/utils/formatters'

const router = useRouter()
const contractsStore = useContractsStore()

// 响应式数据
const searchQuery = ref('')
const filterType = ref('all')
const showCopySuccess = ref(false)
const isLoading = ref(false)
const scanMessage = ref('')

// 格式化地址（显示首尾）
const formatAddress = (address: string) => {
  if (!address) return ''
  return address.slice(0, 6) + '...' + address.slice(-4)
}

// 过滤 ERC20 代币
const filteredErc20 = computed(() => {
  let tokens = contractsStore.erc20Tokens

  if (filterType.value === 'wrapped') {
    return []
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tokens = tokens.filter(token =>
      uint256ToString(token.name).toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    )
  }

  return tokens
})

// 过滤 WBKC 代币
const filteredWrapped = computed(() => {
  let tokens = contractsStore.wbkcTokens

  if (filterType.value === 'erc20') {
    return []
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tokens = tokens.filter(token =>
      uint256ToString(token.name).toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    )
  }

  return tokens
})

// 导航到代币详情页
const goToDetail = (address: string) => {
  router.push(`/coindetail/${address}`)
}

// 导航到代币部署页
const goToDeploy = () => {
  router.push('/coindeploy')
}

// 复制到剪贴板
const copyToClipboard = async (text:string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
  } catch (err) {
    // 复制失败，静默处理
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  // 检查连接状态
  const connectionService = (await import('@/services/connectionService')).default
  if (!connectionService.isConnected()) {
    scanMessage.value = '⚠️ 未连接到区块链节点，请重新登录以使用完整功能'
    return
  }
  
  // 如果没有缓存的合约数据，提示用户扫描
  if (contractsStore.contracts.length === 0) {
    scanMessage.value = '暂无代币数据，请点击"扫描区块链"按钮来发现已部署的代币合约'
  } else {
    scanMessage.value = `已加载 ${contractsStore.contracts.length} 个合约（最后扫描到区块 ${contractsStore.lastScanBlock}），可点击"刷新新区块"查找新合约`
    setTimeout(() => {
      scanMessage.value = ''
    }, 5000)
  }
})
</script>

<style scoped>
.hover-row {
  transition: background-color 0.2s ease;
}

.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.bg-primary-container {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.bg-secondary-container {
  background-color: rgba(var(--v-theme-secondary), 0.12);
}

.font-mono {
  font-family: 'Courier New', monospace;
}
</style>