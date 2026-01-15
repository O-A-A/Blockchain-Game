import { getPlayerData, getGameContract } from '@/services/contract'
import { monsters } from '@/game/data/monsters'
import { randRange } from '@/game/utils/random'

/**
 * 简化的前端战斗逻辑：用于展示与预计算。关键验证/结算应放在链上合约中。
 */
export const battle = async (playerAddress: string, monsterId: number) => {
  // 1. 获取玩家链上数据
  const playerData = await getPlayerData(playerAddress)
  if (!playerData) {
    return { isWin: false, error: '无法加载玩家数据' }
  }

  const playerLevel = Math.max(Number(playerData.level) || 1, 1)

  // 2. 获取怪物静态数据。如果指定的怪物等级远高于玩家，则选择更接近玩家等级的怪物
  let monster = monsters.find((m) => m.id === monsterId) || monsters[0]
  if (monster.level > playerLevel + 5) {
    const candidate = monsters
      .slice()
      .reverse()
      .find((m) => m.level <= playerLevel + 2)
    if (candidate) monster = candidate
  }

  // 3. 战斗预计算（带一定随机性）
  // 调整数值尺度：使用等级 * 常数的方式，保证玩家等级对战力有决定性影响
  const playerPower = playerLevel * 15 + randRange(-5, 10)
  const monsterPower = monster.level * 15 + Math.floor((monster.hp + monster.attack) / 10) + randRange(-10, 20)

  const isWin = playerPower >= monsterPower

  // 4. 胜利则发送上链交易以更新玩家等级（示例）
  if (isWin) {
    try {
      const contract = getGameContract()
      await contract.updatePlayerLevel(playerData.id, playerLevel + 1)
    } catch (err) {
      console.warn('尝试上链更新玩家等级失败（可能未部署/地址占位）', err)
    }
  }

    return {
      isWin,
      playerLevel: isWin ? playerLevel + 1 : playerLevel,
      reward: isWin ? { exp: 100, token: 10 } : null,
      debug: {
        playerPower,
        monsterPower,
        monsterId: monster.id,
        monsterLevel: monster.level
      }
    }
}
