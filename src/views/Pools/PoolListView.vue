<template>
  <v-container class="py-6" style="max-width: 80%">
    <!-- 顶部标题栏 -->
    <v-row align="center" class="mb-6">
      <v-col cols="12" md="8">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">流动性池</h1>
          <p class="text-body-2 text-medium-emphasis">浏览所有可用的流动性池和创建新池</p>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="goToCreatePool"
          rounded="lg"
        >
          创建流动性池
        </v-btn>
      </v-col>
    </v-row>

    <!-- 搜索和统计 -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="搜索池名称或交易对"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          rounded="lg"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="sortBy"
          :items="[
            { title: '按 TVL 排序', value: 'tvl' },
            { title: '按 APR 排序', value: 'apr' },
            { title: '按 24h 交易量排序', value: 'volume' }
          ]"
          label="排序方式"
          variant="outlined"
          density="compact"
          rounded="lg"
        ></v-select>
      </v-col>
    </v-row>

    <!-- 统计卡片 -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-water</v-icon>
            总流动性
          </div>
          <div class="text-h6 font-weight-bold">$ 125.3M</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-swap-horizontal</v-icon>
            24h 交易量
          </div>
          <div class="text-h6 font-weight-bold">$ 42.7M</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-information</v-icon>
            活跃池数
          </div>
          <div class="text-h6 font-weight-bold">{{ filteredPools.length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 池列表 -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" elevation="2">
          <div v-if="filteredPools.length === 0" class="pa-8 text-center">
            <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-off</v-icon>
            <p class="text-body-2 text-medium-emphasis">暂无符合条件的流动性池</p>
          </div>

          <v-table v-else class="rounded-lg" density="compact">
            <thead>
              <tr class="bg-surface-variant">
                <th class="text-left text-subtitle-2 font-weight-bold">交易对</th>
                <th class="text-left text-subtitle-2 font-weight-bold">池信息</th>
                <th class="text-right text-subtitle-2 font-weight-bold">流动性</th>
                <th class="text-right text-subtitle-2 font-weight-bold">APR</th>
                <th class="text-center text-subtitle-2 font-weight-bold">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pool in filteredPools"
                :key="pool.address"
                class="hover-row"
                @click="goToPoolDetail(pool.address)"
                style="cursor: pointer"
              >
                <!-- 交易对 -->
                <td>
                  <div class="d-flex align-center py-2">
                    <v-avatar color="primary" size="32" class="mr-2">
                      <span class="text-white text-caption font-weight-bold">{{ pool.token0.symbol.charAt(0) }}</span>
                    </v-avatar>
                    <v-avatar color="secondary" size="32" class="mr-3">
                      <span class="text-white text-caption font-weight-bold">{{ pool.token1.symbol.charAt(0) }}</span>
                    </v-avatar>
                    <span class="font-weight-medium">{{ pool.token0.symbol }}/{{ pool.token1.symbol }}</span>
                  </div>
                </td>

                <!-- 池信息 -->
                <td>
                  <div>
                    <div class="font-weight-medium">{{ pool.name }}</div>
                    <div class="text-caption text-medium-emphasis">24h: ${{ pool.volume24h }}</div>
                  </div>
                </td>

                <!-- 流动性 -->
                <td class="text-right">
                  <div class="font-weight-medium">{{ pool.reserve0 }} {{ pool.token0.symbol }}</div>
                  <div class="text-caption text-medium-emphasis">{{ pool.reserve1 }} {{ pool.token1.symbol }}</div>
                </td>

                <!-- APR -->
                <td class="text-right">
                  <v-chip color="success" text-color="white" size="small">
                    {{ pool.apr }}
                  </v-chip>
                </td>

                <!-- 操作 -->
                <td class="text-center">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click.stop="copyToClipboard(pool.address)"
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

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { POOLS_DATA } from '@/mock/pools'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const sortBy = ref('tvl')
const showCopySuccess = ref(false)

// 格式化地址
const formatAddress = (address) => {
  if (!address) return ''
  return address.slice(0, 6) + '...' + address.slice(-4)
}

// 计算 TVL (Token Value Locked)
const calculateTVL = (pool) => {
  const reserve0 = parseFloat(pool.reserve0.replace(/,/g, ''))
  const reserve1 = parseFloat(pool.reserve1.replace(/,/g, ''))
  // 假设交换率
  return reserve0 + reserve1
}

// 过滤和排序池
const filteredPools = computed(() => {
  let pools = POOLS_DATA

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    pools = pools.filter(pool =>
      pool.name.toLowerCase().includes(query) ||
      pool.token0.symbol.toLowerCase().includes(query) ||
      pool.token1.symbol.toLowerCase().includes(query) ||
      pool.address.toLowerCase().includes(query)
    )
  }

  // 排序
  const sorted = [...pools]
  if (sortBy.value === 'tvl') {
    sorted.sort((a, b) => calculateTVL(b) - calculateTVL(a))
  } else if (sortBy.value === 'apr') {
    sorted.sort((a, b) => {
      const aprA = parseFloat(a.apr)
      const aprB = parseFloat(b.apr)
      return aprB - aprA
    })
  } else if (sortBy.value === 'volume') {
    sorted.sort((a, b) => {
      const volA = parseFloat(a.volume24h.replace(/,/g, ''))
      const volB = parseFloat(b.volume24h.replace(/,/g, ''))
      return volB - volA
    })
  }

  return sorted
})

// 导航到池详情页
const goToPoolDetail = (address) => {
  router.push(`/pooldetail/${address}`)
}

// 导航到创建池页
const goToCreatePool = () => {
  router.push('/poolcreate')
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.hover-row {
  transition: background-color 0.2s ease;
}

.hover-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
