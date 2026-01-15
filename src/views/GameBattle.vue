<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWalletStore } from '@/store/wallet'
import { battle } from '@/game/core/battle'

const route = useRoute()
const wallet = useWalletStore()
const result = ref<any>(null)

onMounted(async () => {
  const monsterId = Number(route.params.monsterId || 1)
  const addr = wallet.address || ''
  if (!addr) {
    alert('请先连接钱包')
    return
  }
  result.value = await battle(addr, monsterId)
})
</script>

<template>
  <div>
    <h2>战斗页面</h2>
    <div v-if="result">
      <p>结果：{{ result.isWin ? '胜利' : '失败' }}</p>
    </div>
    <div v-else>
      <p>正在战斗...</p>
    </div>
  </div>
</template>
