<template>
  <v-container class="py-6" style="max-width: 80%">
        <!-- 顶部标题栏 -->
        <v-row class="mb-6">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-2">流动性池</h1>
        <p class="text-body-2 text-medium-emphasis">
          浏览所有可用的流动性池和创建新池
        </p>
        <div class="d-flex justify-center mt-4">
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="goToCreatePool"
            rounded="lg"
          >
            创建流动性池
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 搜索 -->
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
        <v-card rounded="lg" elevation="1" class="pa-4">
          <div class="text-caption text-medium-emphasis mb-1">
            <v-icon size="small">mdi-information</v-icon>
            活跃池数
          </div>
          <div class="text-h6 font-weight-bold">{{ AmmPools.length }}</div>
        </v-card>
      </v-col>
    </v-row>

     <!-- 池列表 -->
     <v-row>
      <v-col cols="12">
        <!-- 错误提示 -->
        <v-alert
          v-if="error"
          type="error"
          rounded="lg"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- 加载提示 -->
        <v-card
          v-if="loading && AmmPools.length === 0"
          rounded="lg"
          elevation="2"
          class="pa-8 text-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <p class="text-body-1">正在从区块链加载池子数据...</p>
        </v-card>

        <!-- 桌面端：表格布局 -->
        <template v-else-if="isDesktop">
          <v-card rounded="lg" elevation="2">
            <div v-if="AmmPools.length === 0" class="pa-8 text-center">
              <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-off</v-icon>
              <p class="text-body-2 text-medium-emphasis">暂无符合条件的流动性池</p>
              <p class="text-caption text-medium-emphasis mt-2">请先扫描区块链或创建新的流动性池</p>
            </div>

            <v-table v-else class="rounded-lg" density="compact">
              <thead>
                <tr class="bg-surface-variant">
                  <th class="text-left text-subtitle-2 font-weight-bold">交易对</th>
                  <th class="text-left text-subtitle-2 font-weight-bold">池名称</th>
                  <th class="text-right text-subtitle-2 font-weight-bold">流动性</th>
                  <th class="text-center text-subtitle-2 font-weight-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="pool in AmmPools"
                  :key="pool.address"
                  class="hover-row"
                  @click="goToPoolDetail(pool.address)"
                  style="cursor: pointer"
                >
                  <td>
                    <div class="d-flex align-center py-2">
                      <v-avatar color="primary" size="32" class="mr-2">
                        <span class="text-white text-caption font-weight-bold">A</span>
                      </v-avatar>
                      <v-avatar color="secondary" size="32" class="mr-3">
                        <span class="text-white text-caption font-weight-bold">B</span>
                      </v-avatar>
                      <span class="font-weight-medium">
                        {{ pool.token0.name }}/{{ pool.token1.name }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="font-weight-medium">{{ pool.name }}</div>
                  </td>
                  <td class="text-right">
                    <div class="font-weight-medium">
                      {{ pool.reserve0 }} {{ pool.token0.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ pool.reserve1 }} {{ pool.token1.name }}
                    </div>
                  </td>
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
        </template>

        <!-- 移动端：卡片布局 -->
        <v-row v-else class="g-4">
          <v-col cols="12" v-for="pool in AmmPools" :key="pool.address">
            <v-card rounded="lg" elevation="2" class="pa-4">
              <div class="d-flex align-center mb-3" style="gap: 12px;">
                <v-avatar color="primary" size="36">
                  <span class="text-white font-weight-bold">A</span>
                </v-avatar>
                <v-avatar color="secondary" size="36">
                  <span class="text-white font-weight-bold">B</span>
                </v-avatar>
                <div class="font-weight-medium">
                  {{ pool.token0.name }} / {{ pool.token1.name }}
                </div>
              </div>
              <v-divider class="mb-3"></v-divider>
              <div class="text-body-2 text-medium-emphasis mb-1">池名称</div>
              <div class="text-body-1 font-weight-medium mb-3">{{ pool.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-1">流动性</div>
              <div class="text-body-1 font-weight-medium">
                {{ pool.reserve0 }} {{ pool.token0.name }}
              </div>
              <div class="text-caption text-medium-emphasis mb-3">
                {{ pool.reserve1 }} {{ pool.token1.name }}
              </div>
              <v-btn
                block
                color="primary"
                variant="outlined"
                rounded="lg"
                @click="goToPoolDetail(pool.address)"
              >
                查看详情
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 复制成功提示 -->
    <v-snackbar v-model="showCopySuccess" timeout="2000" color="success">
      地址已复制到剪贴板
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted , computed} from 'vue'
import { useRouter } from 'vue-router'
import poolService from '@/services/poolService'
import type { PoolInfo } from '@/services/poolService'
import { useDisplay } from 'vuetify'
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const showCopySuccess = ref(false)
const AmmPools = ref<PoolInfo[]>([])
const loading = ref(false)
const error = ref('')
const display = useDisplay()
const isDesktop = computed(() => display.mdAndUp.value)
// 加载池子数据
const loadPools = async () => {
  loading.value = true
  error.value = ''
  
  try {
    AmmPools.value = await poolService.getAllPools()
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 导航到池详情页
const goToPoolDetail = (address: string) => {
  router.push(`/pooldetail/${address}`)
}

// 导航到创建池页
const goToCreatePool = () => {
  router.push('/poolcreate')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
  } catch (err) {
    // 复制失败，静默处理
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadPools()
})
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
