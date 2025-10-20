<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
      <v-col>
        <h1>代币列表</h1>
      </v-col>
      <v-col>
        <v-btn fab size="large" color="primary" rounded="xl" @click="goToDeploy">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined rounded="xl">
          <v-card-title>ERC20 代币</v-card-title>
          <v-data-table
            :headers="headers"
            :items="erc20Tokens"
            item-key="address" 
            @click:row="goToDetail"
            hover
          ></v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined rounded="xl">
          <v-card-title>Wrapped 代币</v-card-title>
          <v-data-table
            :headers="headers"
            :items="wrappedTokens"
            item-key="address"
            @click:row="goToDetail"
            hover
          ></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CoinListView',
  data() {
    return {
      headers: [
        { text: '代币名称', sortable: true, value: 'name' },
        { text: '代币发行方', value: 'issuer' },
        { text: '代币总发行量', value: 'totalSupply' }
      ],
      erc20Tokens: [
        {
          name: 'Uniswap',
          issuer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // 原 issuer 是 '0x1f9840'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        },
        {
          name: 'ChainLink',
          issuer: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // 原 issuer 是 'ChainLink'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
        },
        {
          name: 'Uniswap',
          issuer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // 原 issuer 是 '0x1f9840'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        },
        {
          name: 'ChainLink',
          issuer: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // 原 issuer 是 'ChainLink'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
        },
        {
          name: 'Uniswap',
          issuer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // 原 issuer 是 '0x1f9840'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
        },
        {
          name: 'ChainLink',
          issuer: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // 原 issuer 是 'ChainLink'，这里用 address 更合理
          totalSupply: '1,000,000,000',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
        },
      ],
      wrappedTokens: [
        {
          name: 'Wrapped Ether',
          issuer: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // 原 issuer 是 'WETH Contract'，这里用 address 更合理
          totalSupply: 'N/A',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        },
        {
          name: 'Wrapped BTC',
          issuer: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // 原 issuer 是 'WBTC DAO'，这里用 address 更合理
          totalSupply: '154,663',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
        },
        {
          name: 'Wrapped Ether',
          issuer: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // 原 issuer 是 'WETH Contract'，这里用 address 更合理
          totalSupply: 'N/A',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        },
        {
          name: 'Wrapped BTC',
          issuer: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // 原 issuer 是 'WBTC DAO'，这里用 address 更合理
          totalSupply: '154,663',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
        },
        {
          name: 'Wrapped Ether',
          issuer: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // 原 issuer 是 'WETH Contract'，这里用 address 更合理
          totalSupply: 'N/A',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        },
        {
          name: 'Wrapped BTC',
          issuer: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // 原 issuer 是 'WBTC DAO'，这里用 address 更合理
          totalSupply: '154,663',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
        },
      ]
    };
  },
  methods: {
    goToDetail(event, { item }) {
      this.$router.push(`/coindetail/${item.address}`);
    },
    goToDeploy() {
      this.$router.push('/coindeploy');
    }
  }
};
</script>