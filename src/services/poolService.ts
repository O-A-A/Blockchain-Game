// poolService.ts - AMM 池子服务
import { ethers } from 'ethers'
import connectionService from './connectionService'
import contractInteractionService from './contractInteractionService'
import { useContractsStore } from '@/store/contracts'
import { formatBalance } from '@/utils/formatters'

export interface PoolInfo {
  address: string
  name: string
  token0: TokenInfo
  token1: TokenInfo
  reserve0: string // 格式化后的数量
  reserve1: string // 格式化后的数量
  fee: string
  price: string // token0/token1 的价格
  userLpBalance?: string
  userLpBalanceRaw?: string
  totalLpSupply: string
  totalLpSupplyRaw: string
}

export interface TokenInfo {
  address: string
  name: string
}

/**
 * AMM 池子服务
 */
class PoolService {
  /**
   * 获取所有 AMM 池子列表
   */
  async getAllPools(): Promise<PoolInfo[]> {
    try {
      await connectionService.ensureConnected()
      const contractsStore = useContractsStore()

      // 获取所有 AMM 类型的合约
      const ammContracts = contractsStore.contracts.filter(c => c.type === 2)

      if (ammContracts.length === 0) {
        console.log('未找到 AMM 合约')
        return []
      }

      console.log(`找到 ${ammContracts.length} 个 AMM 合约`)

      // 并行获取所有池子的信息
      const poolsPromises = ammContracts.map(contract =>
        this.getPoolInfo(contract.address).catch(() => null)
      )

      const pools = await Promise.all(poolsPromises)

      // 过滤掉失败的请求
      const validPools = pools.filter(pool => pool !== null) as PoolInfo[]

      console.log(`找到 ${ammContracts.length} 个 AMM 合约，成功加载 ${validPools.length} 个池子`)

      if (validPools.length === 0 && ammContracts.length > 0) {
        console.warn(`⚠️ ${ammContracts.length} 个 AMM 合约无法读取详细信息（可能未初始化或版本不兼容）`)
      }

      return validPools
    } catch (error) {
      console.error('获取池子列表失败:', error)
      return [] // 返回空数组而不是抛出错误
    }
  }

  /**
   * 获取单个池子的详细信息
   */
  async getPoolInfo(poolAddress: string, userAddress?: string): Promise<PoolInfo> {
    try {
      await connectionService.ensureConnected()

      const abi = contractInteractionService.getAbi('amm')

      // 如果没有提供用户地址，使用当前钱包地址
      if (!userAddress) {
        userAddress = connectionService.getAddress()
      }

      // 并行获取池子基本信息（使用错误处理）
      const results = await Promise.allSettled([
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'POOL_NAME'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'tokenAAddress'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'tokenBAddress'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'getPoolInfo'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'FEE_RATE'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'FEE_DENOMINATOR'
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'userLpToken',
          args: [userAddress]
        }).catch(() => BigInt(0)), // 如果失败返回 0
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'lpTokenTotalSupply'
        }).catch(() => BigInt(0)) // 如果失败返回 0
      ])

      const poolName = results[0].status === 'fulfilled' ? results[0].value : BigInt(0)
      const tokenAAddress = (results[1].status === 'fulfilled' ? results[1].value : ethers.ZeroAddress) as string
      const tokenBAddress = (results[2].status === 'fulfilled' ? results[2].value : ethers.ZeroAddress) as string
      const poolInfo = (results[3].status === 'fulfilled' ? results[3].value : [BigInt(0), BigInt(0), BigInt(0), BigInt(0)]) as any[]
      const feeRate = results[4].status === 'fulfilled' ? results[4].value : BigInt(3)
      const feeDenominator = results[5].status === 'fulfilled' ? results[5].value : BigInt(1000)
      const userLpBalance = results[6].status === 'fulfilled' ? (results[6].value as bigint) : BigInt(0)
      const totalLpSupply = results[7].status === 'fulfilled' ? (results[7].value as bigint) : BigInt(0)

      // 检查是否读取到有效数据
      const isValid = tokenAAddress !== ethers.ZeroAddress && tokenBAddress !== ethers.ZeroAddress

      // 如果无法读取完整信息，返回基本的占位池子
      if (!isValid) {
        return {
          address: poolAddress,
          name: String(poolName),
          token0: {
            address: tokenAAddress,
            name: 'NaN',
          },
          token1: {
            address: tokenBAddress,
            name: 'NaN',
          },
          reserve0: 'NaN',
          reserve1: 'NaN',
          fee: 'NaN',
          price: 'NaN',
          userLpBalance: 'NaN',
          userLpBalanceRaw: '0',
          totalLpSupply: 'NaN',
          totalLpSupplyRaw: '0'
        }
      }

      // 获取代币信息
      const [token0Info, token1Info] = await Promise.all([
        this.getTokenInfo(tokenAAddress),
        this.getTokenInfo(tokenBAddress)
      ])

      // poolInfo 返回: [tokenABalance, tokenBBalance, totalLPSupply, k]
      const reserve0Raw = poolInfo[0].toString()
      const reserve1Raw = poolInfo[1].toString()

      // 计算价格 (token0/token1)
      const price = this.calculatePrice(reserve0Raw, reserve1Raw)

      // 计算手续费百分比
      const feePercent = (Number(feeRate) / Number(feeDenominator) * 100).toFixed(2)

      // 格式化 LP 余额
      const userLpBalanceFormatted = userLpBalance.toString()
      const totalLpSupplyFormatted = totalLpSupply.toString()

      return {
        address: poolAddress,
        name: String(poolName),
        token0: token0Info,
        token1: token1Info,
        reserve0: reserve0Raw,
        reserve1: reserve1Raw,
        fee: `${feePercent}%`,
        price: formatBalance(price),
        userLpBalance: formatBalance(userLpBalanceFormatted),
        userLpBalanceRaw: userLpBalance.toString(),
        totalLpSupply: formatBalance(totalLpSupplyFormatted),
        totalLpSupplyRaw: totalLpSupply.toString()
      }
    } catch (error) {
      // 静默处理，避免重复日志
      throw error
    }
  }

  /**
   * 获取代币信息
   */
  private async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      // 先尝试从已扫描的合约中查找
      const contractsStore = useContractsStore()
      const contract = contractsStore.contracts.find(c =>
        c.address.toLowerCase() === tokenAddress.toLowerCase()
      )

      if (contract && (contract.type === 0 || contract.type === 1)) {
        // ERC20 或 WBKC
        const info = contract.type === 0
          ? await contractInteractionService.getERC20Info(tokenAddress)
          : await contractInteractionService.getWBKCInfo(tokenAddress)

        return {
          address: tokenAddress,
          name: info.name,
        }
      }

      // 如果没有找到，尝试直接读取
      const info = await contractInteractionService.getERC20Info(tokenAddress)
      return {
        address: tokenAddress,
        name: info.name,
      }
    } catch (error) {
      // 返回默认值
      return {
        address: tokenAddress,
        name: 'Unknown Token',
      }
    }
  }

  /**
   * 获取代币余额
   */
  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<string> {
    try {
      return await contractInteractionService.getERC20Balance(tokenAddress, accountAddress)
    } catch (error) {
      throw error
    }
  }

  /**
   * 计算价格
   */
  private calculatePrice(reserve0: string, reserve1: string): string {
    try {
      const reserve0Num = Number(reserve0)
      const reserve1Num = Number(reserve1)

      if (reserve1Num === 0) return '0'

      return (reserve0Num / reserve1Num).toString()
    } catch (error) {
      return '0'
    }
  }
}

// 导出单例
export const poolService = new PoolService()
export default poolService

