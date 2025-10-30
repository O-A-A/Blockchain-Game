<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="rounded-lg" elevation="3">
          <v-card-title class="d-flex align-center px-4 py-3 bg-primary-lighten-5">
            <v-icon size="large" color="primary" class="mr-2">mdi-send</v-icon>
            <span class="text-h6 font-weight-bold">转账</span>
          </v-card-title>

          <v-card-text class="px-4 py-5">
            <!-- 发送表单 -->
            <v-form @submit.prevent="handleSend">
              <!-- 收款地址 -->
              <div class="mb-4">
                <label class="text-subtitle-2 font-weight-medium d-block mb-2">收款地址</label>
                <v-text-field v-model="toAddress" placeholder="输入有效的钱包地址" variant="outlined" density="comfortable"
                  :error-messages="addressError" prepend-inner-icon="mdi-wallet-outline" clearable hide-details="auto"
                  class="mb-1"></v-text-field>
              </div>

              <!-- 发送金额 -->
              <div class="mb-5">
                <div class="d-flex justify-space-between align-center mb-2">
                  <label class="text-subtitle-2 font-weight-medium">发送金额</label>
                  <span class="text-caption text-medium-emphasis">
                    可用: {{ balance }}
                  </span>
                </div>
                <v-text-field v-model="amount" type="number" placeholder="0.00" variant="outlined" density="comfortable"
                  :error-messages="amountError" class="mb-1" hide-details="auto">
                </v-text-field>
              </div>

              <v-btn block type="submit" color="primary" size="large" class="rounded-lg font-weight-bold"
                :loading="isLoading" :disabled="!isFormValid || isLoading" height="50">
                {{ getSendButtonText() }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 交易确认对话框 -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title class="text-subtitle-1">确认交易</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showConfirmDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-3">您即将发送以下交易:</p>

          <v-card variant="outlined" class="pa-3 mb-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-medium-emphasis">发送金额</span>
              <span class="font-weight-medium">{{ amount }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-caption text-medium-emphasis">收款地址</span>
              <span class="font-weight-medium text-truncate" style="max-width: 200px;">{{ toAddress }}</span>
            </div>
          </v-card>

          <p class="text-caption text-medium-emphasis">
            <v-icon size="x-small" class="mr-1">mdi-information-outline</v-icon>
            交易一旦发送将无法撤销，请确认交易详情正确。
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showConfirmDialog = false" class="mr-2">取消</v-btn>
          <v-btn color="primary" @click="confirmSend" :loading="isLoading">确认发送</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 交易结果对话框 -->
    <v-dialog v-model="showResultDialog" max-width="400">
      <v-card>
        <v-toolbar :color="sendSuccess ? 'success' : 'error'" density="compact">
          <v-toolbar-title class="text-white text-subtitle-1">
            {{ sendSuccess ? '交易已发送' : '交易失败' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showResultDialog = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4 text-center">
          <v-avatar :color="sendSuccess ? 'success' : 'error'" size="64" class="my-4">
            <v-icon size="36" color="white">
              {{ sendSuccess ? 'mdi-check' : 'mdi-alert' }}
            </v-icon>
          </v-avatar>

          <h3 class="text-h6 mb-2">{{ sendSuccess ? '交易已发送成功' : '交易发送失败' }}</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ sendSuccess
              ? `您已成功发送 ${amount} 至指定地址`
              : (sendErrorMessage || '发送交易时遇到错误，请稍后重试')
            }}
          </p>

          <v-btn v-if="sendSuccess" variant="text" color="primary" prepend-icon="mdi-eye" size="small">
            查看交易详情
          </v-btn>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeResultDialog">
            完成
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成功提示 -->
    <v-snackbar v-model="showSuccess" color="success" location="top">
      交易已成功发送！
      <template v-slot:actions>
        <v-btn variant="text" @click="showSuccess = false">
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { connectionService } from '@/services/connectionService'

// 表单数据
const toAddress = ref('');
const amount = ref('');

const balance = ref(''); // 存储余额

const loadBalance = async () => {
  try {
    const addr = connectionService.getAddress();
    const bal = await connectionService.getBalance(addr);
    balance.value = bal;
  } catch (err) {
    console.error('加载余额失败:', err);
    balance.value = '0';
  }
};

// 组件挂载时加载余额
onMounted(() => {
  loadBalance();
});

// 错误信息
const addressError = ref('')
const amountError = ref('')

// 界面状态
const isLoading = ref(false)
const showSuccess = ref(false)
const showConfirmDialog = ref(false)
const showResultDialog = ref(false)
const sendSuccess = ref(false)
const sendErrorMessage = ref('')

// 表单验证
const isFormValid = computed(() => {
  return toAddress.value &&
    amount.value &&
    parseFloat(amount.value) > 0 &&
    !addressError.value &&
    !amountError.value
})

// 获取按钮文本
const getSendButtonText = () => {
  if (!toAddress.value) {
    return '请输入收款地址'
  }

  if (!amount.value || parseFloat(amount.value) <= 0) {
    return '请输入金额'
  }

  if (parseFloat(amount.value) > balance.value) {
    return '余额不足'
  }

  return '发送'
}

// 处理发送
const handleSend = () => {
  // 验证地址
  if (!toAddress.value) {
    addressError.value = '请输入收款地址'
    return
  } else if (toAddress.value.length < 10) {
    addressError.value = '请输入有效的钱包地址'
    return
  } else {
    addressError.value = ''
  }

  // 验证金额
  const numAmount = parseFloat(amount.value)
  if (!amount.value || isNaN(numAmount) || numAmount <= 0) {
    amountError.value = '请输入有效金额'
    return
  } else if (numAmount > balance.value) {
    amountError.value = `余额不足，最大可用: ${balance.value}`
    return
  } else {
    amountError.value = ''
  }

  // 显示确认对话框
  showConfirmDialog.value = true
}

// 确认发送
const confirmSend = async () => {
  isLoading.value = true

  try {
    // ethers.js 的 sendTransaction 成功时返回 TransactionResponse
    const transactionResponse = await connectionService.sendTransaction(
      toAddress.value,
      amount.value
    );

    // 等待交易被确认（根据需求决定是否需要）
    const receipt = await transactionResponse.wait();

    // 成功发送交易（已广播到网络）
    sendSuccess.value = true;
    sendErrorMessage.value = '';
    showSuccess.value = true;

  } catch (error) {
    // ethers.js 抛出的错误通常包含 message
    sendSuccess.value = false;
    sendErrorMessage.value = error?.message || '发送过程中发生错误';
  } finally {
    // 关闭确认对话框，显示结果对话框
    showConfirmDialog.value = false;
    showResultDialog.value = true;
    isLoading.value = false;
  }
}

// 关闭结果对话框并重置表单
const closeResultDialog = () => {
  showResultDialog.value = false

  if (sendSuccess.value) {
    // 重置表单
    toAddress.value = ''
    amount.value = ''
    addressError.value = ''
    amountError.value = ''
    loadBalance()
  }
}

</script>