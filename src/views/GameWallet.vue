<script setup lang="ts">
import { computed } from 'vue'
import { useWalletStore } from '@/store/wallet'

const wallet = useWalletStore()

const address = computed(() => wallet.address || '未连接')
</script>

<template>
  <div class="game-wallet">
    <h2>游戏钱包</h2>
    <p>地址：{{ address }}</p>
    <p>WBKC 余额：{{ wallet.wbkcBalance }}</p>
    <p>E20C 余额：{{ wallet.e20cBalance }}</p>
    <p v-if="wallet.isLoading">正在加载余额...</p>
  </div>
</template>

<style scoped>
.game-wallet { padding: 16px; max-width: 800px; margin: 0 auto; }
</style>
