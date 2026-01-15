<script setup lang="ts">
import logoUrl from '@/assets/logo.png'
const emit = defineEmits<{
  (e: 'start-battle'): void
}>()
</script>

<template>
  <div class="game-battle">
    <h3>怪物营地</h3>
    <div class="monster-card">
      <img :src="logoUrl" alt="怪物" />
      <p>哥布林 Lv.10</p>
    </div>
    <button @click="emit('start-battle')" class="battle-btn">开始战斗</button>
  </div>
</template>

<style scoped>
.game-battle {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
}
.battle-btn {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
