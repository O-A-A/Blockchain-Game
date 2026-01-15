<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPlayerData } from '@/services/contract'
import { battle } from '@/game/core/battle'
import GameBattle from '@/components/GameBattle.vue'
import GameTask from '@/components/GameTask.vue'
import { useWalletStore } from '@/store/wallet'

const playerData = ref<any>(null)
const battleResult = ref<any>(null)
const walletStore = useWalletStore()

onMounted(async () => {
  const addr = walletStore.address || (window.ethereum && (window.ethereum.selectedAddress || window.ethereum?.request && null))
  if (addr) {
    playerData.value = await getPlayerData(addr)
  }
})

const handleBattle = async () => {
  const addr = walletStore.address || ''
  if (!addr) {
    alert('请先连接钱包')
    return
  }
  battleResult.value = await battle(addr, 1)
}
</script>

<template>
  <div class="game-index">
    <div class="player-info">
      <h2>玩家：{{ playerData?.id ?? '未连接' }}</h2>
      <p>等级：{{ playerData?.level ?? '-' }}</p>
      <p>游戏代币：{{ playerData?.balance ?? '-' }}</p>
    </div>

    <GameBattle @start-battle="handleBattle" />

    <div v-if="battleResult">
      <p>战斗结果：{{ battleResult.isWin ? '胜利' : '失败' }}</p>
      <p v-if="battleResult.reward">奖励：EXP {{ battleResult.reward.exp }} | 代币 {{ battleResult.reward.token }}</p>
    </div>

    <GameTask />
  </div>
</template>

<style scoped>
.game-index { max-width: 1200px; margin: 0 auto; padding: 20px; }
.player-info { border: 1px solid #eee; padding: 10px; margin-bottom: 20px; }
</style>
