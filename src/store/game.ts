import { defineStore } from 'pinia'
import { getPlayerData } from '@/services/contract'

export const useGameStore = defineStore('game', {
  state: () => ({
    player: null as any,
    isLoading: false,
    battleHistory: [] as any[]
  }),
  actions: {
    async loadPlayerData() {
      this.isLoading = true
      try {
        const addr = sessionStorage.getItem('currentAddress') || (window.ethereum && (window.ethereum.selectedAddress || null))
        if (addr) {
          this.player = await getPlayerData(addr)
        }
      } catch (err) {
        console.error('加载玩家数据出错', err)
      } finally {
        this.isLoading = false
      }
    },
    addBattleResult(result: any) {
      this.battleHistory.unshift(result)
    }
  }
})
