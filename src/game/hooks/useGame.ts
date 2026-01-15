import { ref, onMounted } from 'vue'
import { useGameStore } from '@/store/game'

export const useGame = () => {
  const store = useGameStore()
  const loading = ref(false)

  const init = async () => {
    loading.value = true
    await store.loadPlayerData()
    loading.value = false
  }

  onMounted(() => {
    init()
  })

  return {
    store,
    loading,
    init
  }
}
