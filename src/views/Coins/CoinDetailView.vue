<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="mb-6" elevation="4">
          <v-card-title class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <span class="white--text text-h5">{{ token.symbol ? token.symbol.charAt(0) : 'T' }}</span>
            </v-avatar>

            <div class="text-h6">{{ token.name }} ({{ token.symbol }})</div>
            <v-chip small class="mt-1 ml-6" :color="token.type === 'wETH' ? 'blue' : 'green'" dark>{{ token.type }}</v-chip>

          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" sm="4">
                <div class="d-flex align-center mb-1">
                  <v-icon small class="mr-2">mdi-account-circle-outline</v-icon>
                  <div class="text-subtitle-2 font-weight-bold">发行方</div>
                </div>
                <div class="body-2 text--secondary text-truncate d-flex align-center" :title="token.issuer">
                  <v-icon small class="mr-1">mdi-account</v-icon>
                  <span>{{ token.issuer }}</span>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="d-flex align-center mb-1">
                  <v-icon small class="mr-2">mdi-chart-pie</v-icon>
                  <div class="text-subtitle-2 font-weight-bold">总供应量</div>
                </div>
                <div class="body-2 text--secondary d-flex align-center">
                  <v-icon small class="mr-1">mdi-currency-usd</v-icon>
                  <span>{{ token.totalSupply }}</span>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="d-flex align-center">
                    <div class="d-flex flex-column mr-4">
                    <div class="d-flex align-center mb-1">
                        <v-icon small class="mr-2">mdi-file-document-outline</v-icon>
                        <div class="text-subtitle-2 font-weight-bold">合约地址</div>
                    </div>
                    <div class="body-2 text--secondary d-flex align-center">
                        <v-icon small class="mr-1">mdi-code-braces</v-icon>
                        <span class="text-truncate" :title="token.contractAddress">{{ token.contractAddress }}</span>
                    </div>
                    </div>

                    <v-btn icon x-small @click="copyAddress">
                    <v-icon x-small>mdi-content-copy</v-icon>
                    </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 查询功能卡片 -->
        <v-card class="mb-6" elevation="4">
          <v-card-title class="text-h6">信息查询</v-card-title>
          <v-divider></v-divider>
          <v-row class="pa-4" align="start">
            <!-- 查询余额 -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                <v-icon class="mr-2">mdi-wallet-outline</v-icon>
                查询余额 (BalanceOf)
              </div>
              <v-text-field
                v-model="balanceQuery.address"
                label="账户地址"
                outlined
                dense
                prepend-inner-icon="mdi-account-search-outline"
                class="mb-2"
              ></v-text-field>
              <v-btn color="primary" @click="handleQueryBalance">
                <v-icon left>mdi-magnify</v-icon>
                查询
              </v-btn>
              <div v-if="balanceQuery.balance !== null" class="mt-4 body-1">
                查询结果: <strong>{{ balanceQuery.balance }} {{ token.symbol }}</strong>
              </div>
            </v-col>

            <!-- 查询授权额度 -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-medium mb-3 d-flex align-center">
                <v-icon class="mr-2">mdi-account-lock-outline</v-icon>
                查询授权额度 (Allowance)
              </div>
              <v-text-field
                v-model="allowanceQuery.owner"
                label="授权方地址 (Owner)"
                outlined
                dense
                prepend-inner-icon="mdi-account-key-outline"
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model="allowanceQuery.spender"
                label="被授权方地址 (Spender)"
                outlined
                dense
                prepend-inner-icon="mdi-account-check-outline"
                class="mb-2"
              ></v-text-field>
              <v-btn color="primary" @click="handleQueryAllowance">
                <v-icon left>mdi-magnify</v-icon>
                查询
              </v-btn>
              <div v-if="allowanceQuery.allowance !== null" class="mt-4 body-1">
                查询结果: <strong>{{ allowanceQuery.allowance }} {{ token.symbol }}</strong>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card elevation="4">
          <v-card-title class="text-h6">函数调用</v-card-title>
          <v-divider></v-divider>
          <v-tabs v-model="activeTab" background-color="primary" dark grow>
            <v-tab key="transfer">转账</v-tab>
            <v-tab key="transferFrom">授权转账</v-tab>
            <v-tab key="increaseAllowance">增加授权</v-tab>
            <v-tab key="decreaseAllowance">减少授权</v-tab>
            <v-tab key="mintToken">铸造代币</v-tab>
          </v-tabs>

          <!-- 转账标签页 -->
          <v-card v-show="activeTab === 0" flat class="pa-4">
            <v-card-title>转账 (Transfer)</v-card-title>
            <v-card-text>
              <v-text-field v-model="transferData.to" label="接收方地址" outlined prepend-inner-icon="mdi-account-arrow-right"></v-text-field>
              <v-text-field v-model="transferData.amount" label="金额" type="number" outlined prepend-inner-icon="mdi-cash"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" large @click="handleTransfer">执行 Transfer</v-btn>
            </v-card-actions>
          </v-card>

          <!-- 授权转账标签页 -->
          <v-card v-show="activeTab === 1" flat class="pa-4">
            <v-card-title>授权转账 (TransferFrom)</v-card-title>
            <v-card-text>
              <v-text-field v-model="transferFromData.from" label="发送方地址" outlined prepend-inner-icon="mdi-account-arrow-left"></v-text-field>
              <v-text-field v-model="transferFromData.to" label="接收方地址" outlined prepend-inner-icon="mdi-account-arrow-right"></v-text-field>
              <v-text-field v-model="transferFromData.amount" label="金额" type="number" outlined prepend-inner-icon="mdi-cash"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" large @click="handleTransferFrom">执行 TransferFrom</v-btn>
            </v-card-actions>
          </v-card>

          <!-- 增加授权额度标签页 -->
          <v-card v-show="activeTab === 2" flat class="pa-4">
            <v-card-title>增加授权额度</v-card-title>
            <v-card-text>
              <v-text-field v-model="allowanceData.spender" label="授权地址" outlined prepend-inner-icon="mdi-account-check"></v-text-field>
              <v-text-field v-model="allowanceData.increase" label="增加的额度" type="number" outlined prepend-inner-icon="mdi-arrow-up-bold-circle"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" large @click="handleIncreaseAllowance">增加授权</v-btn>
            </v-card-actions>
          </v-card>

          <!-- 减少授权额度标签页 -->
          <v-card v-show="activeTab === 3" flat class="pa-4">
            <v-card-title>减少授权额度</v-card-title>
            <v-card-text>
              <v-text-field v-model="allowanceData.spender" label="授权地址" outlined prepend-inner-icon="mdi-account-check"></v-text-field>
              <v-text-field v-model="allowanceData.decrease" label="减少的额度" type="number" outlined prepend-inner-icon="mdi-arrow-down-bold-circle"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn color="primary" large @click="handleDecreaseAllowance">减少授权</v-btn>
            </v-card-actions>
          </v-card>

          <!-- 铸造代币标签页 -->
          <v-card v-show="activeTab === 4" flat class="pa-4">
            <v-card-title>铸造代币</v-card-title>
            <!-- ERC20 铸造 -->
            <div v-if="token.type === 'ERC20'">
              <v-card-text>
                <v-text-field v-model="mintData.to" label="接收方地址" outlined prepend-inner-icon="mdi-account-plus"></v-text-field>
                <v-text-field v-model="mintData.amount" label="铸造数量" type="number" outlined prepend-inner-icon="mdi-plus-box"></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="primary" large @click="handleMint">铸造代币</v-btn>
              </v-card-actions>
            </div>
            <!-- Wrapped Token 铸造 (e.g., WETH deposit) -->
            <div v-else-if="token.type === 'wETH'">
              <v-card-text>
                <v-text-field v-model="mintData.amount" label="转账金额 (ETH)" type="number" hint="铸造数量将与转账金额相同" outlined prepend-inner-icon="mdi-ethereum"></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="primary" large @click="handleMint">转账并铸造</v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CoinDetailView',
  data() {
    return {
      activeTab: 0, // 当前激活的标签页
      // Mock data, should be fetched from API or blockchain
      token: {
        name: 'My Token',
        symbol: 'MTK',
        issuer: '0xd3d23d2',
        type: 'ERC20', // or 'wETH'
        totalSupply: '1,000,000',
        contractAddress: '0xde837t',
      },
      transferData: {
        to: '',
        amount: null,
      },
      transferFromData: {
        from: '',
        to: '',
        amount: null,
      },
      allowanceData: {
        spender: '',
        increase: null,
        decrease: null,
      },
      mintData: {
        to: '',
        amount: null,
      },
      balanceQuery: {
        address: '',
        balance: null,
      },
      allowanceQuery: {
        owner: '',
        spender: '',
        allowance: null,
      },
    };
  },
  methods: {
    // Placeholder methods for contract interactions
    handleTransfer() {
      console.log('Transfer:', this.transferData);
      // Add Web3/Ethers.js logic here
    },
    handleTransferFrom() {
      console.log('TransferFrom:', this.transferFromData);
      // Add Web3/Ethers.js logic here
    },
    handleIncreaseAllowance() {
      console.log('Increase Allowance:', {
        spender: this.allowanceData.spender,
        amount: this.allowanceData.increase,
      });
      // Add Web3/Ethers.js logic here
    },
    handleDecreaseAllowance() {
      console.log('Decrease Allowance:', {
        spender: this.allowanceData.spender,
        amount: this.allowanceData.decrease,
      });
      // Add Web3/Ethers.js logic here
    },
    handleMint() {
      console.log('Mint:', this.mintData);
      // Add Web3/Ethers.js logic here
    },
    handleQueryBalance() {
      console.log('Query Balance for:', this.balanceQuery.address);
      // Add Web3/Ethers.js logic here
      // Mock result:
      this.balanceQuery.balance = (Math.random() * 1000).toFixed(4);
    },
    handleQueryAllowance() {
      console.log('Query Allowance for:', this.allowanceQuery);
      // Add Web3/Ethers.js logic here
      // Mock result:
      this.allowanceQuery.allowance = (Math.random() * 500).toFixed(4);
    },
    async copyAddress() {
      try {
        await navigator.clipboard.writeText(this.token.contractAddress);
        // Optional: show a success message
        console.log('Address copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  },
  created() {
    // You would typically fetch token data here based on route params
    // For example: const contractAddress = this.$route.params.address;
    // Then fetch token details using the address.
    // We can also change token type for testing:
    // this.token.type = 'wETH'; 
  }
};
</script>

<style scoped>
/* 确保信息行中的图标和文本垂直对齐 */
.d-flex.align-center {
  display: flex;
  align-items: center;
}
</style>



