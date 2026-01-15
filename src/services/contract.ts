import { ethers } from 'ethers'
import connectionService from './connectionService'
import GameContractAbi from '@/abis/GameContract.json'

// TODO: 将合约地址改为实际部署地址或通过环境变量注入
export const GAME_CONTRACT_ADDRESS = import.meta.env.VITE_GAME_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export const getGameContract = () => {
  const signer = connectionService.getSigner()
  return new ethers.Contract(GAME_CONTRACT_ADDRESS, GameContractAbi as any, signer)
}

export const mintGameNFT = async (tokenId: number) => {
  try {
    await connectionService.ensureConnected()
    const contract = getGameContract()
    const tx = await contract.mintNFT(tokenId)
    await tx.wait()
    return { success: true, txHash: tx.hash }
  } catch (error: any) {
    console.error('铸造NFT失败:', error)
    return { success: false, error: error.message || String(error) }
  }
}

export const getPlayerData = async (address: string) => {
  try {
    await connectionService.ensureConnected()
    const contract = getGameContract()
    const playerData = await contract.getPlayer(address)

    return {
      id: Number(playerData.id?.toString?.() ?? 0),
      level: Number(playerData.level?.toString?.() ?? 0),
      balance: ethers.formatEther(playerData.balance ?? 0),
      nftIds: Array.isArray(playerData.nftIds)
        ? playerData.nftIds.map((id: any) => Number(id?.toString?.() ?? 0))
        : []
    }
  } catch (error: any) {
    console.error('获取角色数据失败:', error)
    return null
  }
}

export default {
  getGameContract,
  mintGameNFT,
  getPlayerData
}
