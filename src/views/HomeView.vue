<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-section">
      <v-container fluid class="hero-content pa-12">
        <v-row align="center" justify="center" class="min-vh-100">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h2 font-weight-bold mb-4 text-white">BrokerFi</h1>
            <h2 class="text-h4 mb-6 text-white-80">去中心化交易所</h2>
            <p class="text-h6 mb-8 text-white-70">
              完全去中心化、透明、零风险的代币交易平台
            </p>
            
            <v-row justify="center" class="mt-8">
              <v-col cols="12" sm="6" md="4">
                <v-btn
                  size="x-large"
                  color="primary"
                  to="/coinlist"
                  rounded="lg"
                  block
                  class="font-weight-bold"
                >
                  <v-icon class="mr-2">mdi-rocket-launch</v-icon>
                  开始交易
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-btn
                  size="x-large"
                  color="white"
                  variant="outlined"
                  to="/poollist"
                  rounded="lg"
                  block
                  class="font-weight-bold"
                >
                  <v-icon class="mr-2">mdi-water</v-icon>
                  查看流动性池
                </v-btn>
              </v-col>
            </v-row>

            <!-- 统计数据 -->
            <v-row justify="center" class="mt-12">
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-white mb-2">$125.3M</div>
                  <div class="text-white-70">总流动性</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-white mb-2">42.7M</div>
                  <div class="text-white-70">24h 交易量</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-white mb-2">11,234</div>
                  <div class="text-white-70">活跃用户</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Why Us Section -->
    <v-container fluid class="py-12" id="why-us">
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h3 font-weight-bold mb-2">为什么选择 BrokerFi？</h2>
          <p class="text-body-1 text-medium-emphasis">我们的核心优势</p>
        </v-col>
      </v-row>

      <v-row>
        <!-- 优势卡片 1 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="primary" class="mb-4">mdi-web</v-icon>
            <div class="text-h6 font-weight-bold mb-2">多链支持</div>
            <div class="text-body-2 text-medium-emphasis">
              可以连接到所有支持 RPC 接口的区块链网络，实现真正的多链互通
            </div>
          </v-card>
        </v-col>

        <!-- 优势卡片 2 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="success" class="mb-4">mdi-gas-station</v-icon>
            <div class="text-h6 font-weight-bold mb-2">低 Gas 费</div>
            <div class="text-body-2 text-medium-emphasis">
              智能合约函数进行了相关的优化，有效减少 Gas 费用消耗
            </div>
          </v-card>
        </v-col>

        <!-- 优势卡片 3 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="error" class="mb-4">mdi-shield-lock</v-icon>
            <div class="text-h6 font-weight-bold mb-2">高安全性</div>
            <div class="text-body-2 text-medium-emphasis">
              使用对称加密算法和哈希匹配保存私钥，确保只有您知道具体私钥内容（注意：请妥善保管密码，一旦丢失无法找回）
            </div>
          </v-card>
        </v-col>

        <!-- 优势卡片 4 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="#374151" class="mb-4">mdi-decagram</v-icon>
            <div class="text-h6 font-weight-bold mb-2">高去中心化</div>
            <div class="text-body-2 text-medium-emphasis">
              所有数据（包括智能合约地址等）只会从区块链网络中获取，没有任何中心化后端，所有安全性由底层链提供
            </div>
          </v-card>
        </v-col>

        <!-- 优势卡片 5 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="#374151" class="mb-4">mdi-human-greeting</v-icon>
            <div class="text-h6 font-weight-bold mb-2">新手友好</div>
            <div class="text-body-2 text-medium-emphasis">
              一键调用合约，一键部署合约，无需任何基础知识即可体验区块链交易
            </div>
          </v-card>
        </v-col>

        <!-- 优势卡片 6 -->
        <v-col cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="1" class="pa-6 h-100 hover-card">
            <v-icon size="48" color="#374151" class="mb-4">mdi-lightning-bolt</v-icon>
            <div class="text-h6 font-weight-bold mb-2">高级功能</div>
            <div class="text-body-2 text-medium-emphasis">
              支持高级功能，包括 TWAP（时间加权平均价格）和 Flash Swap（闪电交换）
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 功能导航 Section -->
    <v-container fluid class="py-12 bg-surface-variant">
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h3 font-weight-bold mb-2">核心功能</h2>
          <p class="text-body-1 text-medium-emphasis">探索 BrokerFi 的强大功能</p>
        </v-col>
      </v-row>

      <v-row>
        <!-- 功能 1 -->
        <v-col cols="12" md="6" lg="3">
          <v-card rounded="lg" elevation="2" class="pa-6 text-center feature-card">
            <v-icon size="64" color="#6b7280" class="mb-4">mdi-currency-usd</v-icon>
            <div class="text-h6 font-weight-bold mb-3">代币发行</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              轻松创建和管理你的自定义代币，支持 ERC20 和 Wrapped 标准
            </div>
            <v-btn color="grey-darken-1" to="/coindeploy" variant="outlined" rounded="lg">
              发行代币
            </v-btn>
          </v-card>
        </v-col>

        <!-- 功能 2 -->
        <v-col cols="12" md="6" lg="3">
          <v-card rounded="lg" elevation="2" class="pa-6 text-center feature-card">
            <v-icon size="64" color="#6b7280" class="mb-4">mdi-swap-horizontal</v-icon>
            <div class="text-h6 font-weight-bold mb-3">代币交换</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              快速交换任意两种代币，实时价格查询，低滑点保护
            </div>
            <v-btn color="grey-darken-1" to="/coinlist" variant="outlined" rounded="lg">
              浏览代币
            </v-btn>
          </v-card>
        </v-col>

        <!-- 功能 3 -->
        <v-col cols="12" md="6" lg="3">
          <v-card rounded="lg" elevation="2" class="pa-6 text-center feature-card">
            <v-icon size="64" color="#6b7280" class="mb-4">mdi-water-percent</v-icon>
            <div class="text-h6 font-weight-bold mb-3">流动性管理</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              提供或移除流动性，赚取交易费用分成，管理 LP 头寸
            </div>
            <v-btn color="grey-darken-1" to="/poollist" variant="outlined" rounded="lg">
              查看流动性池
            </v-btn>
          </v-card>
        </v-col>

        <!-- 功能 4 -->
        <v-col cols="12" md="6" lg="3">
          <v-card rounded="lg" elevation="2" class="pa-6 text-center feature-card">
            <v-icon size="64" color="#6b7280" class="mb-4">mdi-lightning-bolt</v-icon>
            <div class="text-h6 font-weight-bold mb-3">闪电贷</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              无抵押闪电贷，用于套利和清算等复杂交易策略
            </div>
            <v-btn color="grey-darken-1" to="/poollist" variant="outlined" rounded="lg">
              了解更多
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA Section -->
    <v-container fluid class="py-12">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h3 font-weight-bold mb-4">准备好开始了吗？</h2>
          <p class="text-h6 text-medium-emphasis mb-8">
            加入数千名用户，体验去中心化交易的未来
          </p>
          <v-btn
            size="x-large"
            color="primary"
            to="/coinlist"
            rounded="lg"
            class="font-weight-bold px-12"
          >
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            立即开始交易
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- 页脚 -->
    <v-footer class="bg-surface-variant pa-12">
      <v-container>
        <v-row>
          <v-col cols="12" md="3">
            <div class="font-weight-bold mb-2">BrokerFi</div>
            <div class="text-caption text-medium-emphasis">
              去中心化交易所平台
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="font-weight-bold mb-2 text-body-2">产品</div>
            <router-link to="/coinlist" class="text-decoration-none text-body-2 d-block mb-1">
              代币列表
            </router-link>
            <router-link to="/poollist" class="text-decoration-none text-body-2 d-block mb-1">
              流动性池
            </router-link>
          </v-col>
          <v-col cols="12" md="3">
            <div class="font-weight-bold mb-2 text-body-2">功能</div>
            <router-link to="/coindeploy" class="text-decoration-none text-body-2 d-block mb-1">
              发行代币
            </router-link>
            <router-link to="/poolcreate" class="text-decoration-none text-body-2 d-block mb-1">
              创建流动性池
            </router-link>
          </v-col>
          <v-col cols="12" md="3">
            <div class="font-weight-bold mb-2 text-body-2">社区</div>
            <div class="text-body-2 text-medium-emphasis mb-2">Twitter</div>
            <div class="text-body-2 text-medium-emphasis">Discord</div>
          </v-col>
        </v-row>
        <v-divider class="my-6"></v-divider>
        <div class="text-center text-caption text-medium-emphasis">
          © 2024 BrokerFi. All rights reserved.
        </div>
      </v-container>
    </v-footer>
  </div>
</template>

<script setup>
// 首页脚本（暂无特殊逻辑）
</script>

<style scoped>
.hero-section {
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.text-white {
  color: white;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.8);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.min-vh-100 {
  min-height: 100vh;
}

.hover-card {
  transition: all 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-card {
  transition: all 0.2s ease;
  height: 100%;
  border: 1px solid #e5e7eb;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #d1d5db;
}

.bg-surface-variant {
  background-color: rgba(var(--v-theme-surface-variant), 1);
}

a {
  color: inherit;
}

a:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
