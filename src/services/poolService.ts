// poolService.ts - AMM 池子服务
import { ethers } from 'ethers'
import connectionService from './connectionService'
import contractInteractionService from './contractInteractionService'
import { useContractsStore } from '@/store/contracts'

export interface PoolInfo {
  address: string
  name: string
  token0: TokenInfo
  token1: TokenInfo
  reserve0: string // 格式化后的数量
  reserve1: string // 格式化后的数量
  reserve0Raw: string // 原始wei数量
  reserve1Raw: string // 原始wei数量
  fee: string
  price: string // token0/token1 的价格
  userLpBalance?: string
  userLpBalanceRaw?: string
  totalLpSupply: string
  totalLpSupplyRaw: string
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
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
        console.warn('未找到 AMM 合约，请先扫描区块链')
        return []
      }

      // 并行获取所有池子的信息
      const poolsPromises = ammContracts.map(contract => 
        this.getPoolInfo(contract.address).catch(error => {
          console.error(`获取池子 ${contract.address} 信息失败:`, error)
          return null
        })
      )

      const pools = await Promise.all(poolsPromises)
      
      // 过滤掉失败的请求
      return pools.filter(pool => pool !== null) as PoolInfo[]
    } catch (error) {
      console.error('获取池子列表失败:', error)
      throw error
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
        const wallet = connectionService.getWallet()
        userAddress = wallet.address
      }

      // 并行获取池子基本信息
      const [
        poolName,
        tokenAAddress,
        tokenBAddress,
        poolInfo,
        feeRate,
        feeDenominator,
        userLpBalance,
        totalLpSupply
      ] = await Promise.all([
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
        }),
        contractInteractionService.callViewFunction({
          address: poolAddress,
          abi,
          functionName: 'lpTokenTotalSupply'
        })
      ])

      // 获取代币信息
      const [token0Info, token1Info] = await Promise.all([
        this.getTokenInfo(tokenAAddress),
        this.getTokenInfo(tokenBAddress)
      ])

      // poolInfo 返回: [tokenABalance, tokenBBalance, totalLPSupply, k]
      const reserve0Raw = poolInfo[0].toString()
      const reserve1Raw = poolInfo[1].toString()

      // 格式化储备量
      const reserve0 = ethers.formatUnits(reserve0Raw, token0Info.decimals)
      const reserve1 = ethers.formatUnits(reserve1Raw, token1Info.decimals)

      // 计算价格 (token0/token1)
      const price = this.calculatePrice(reserve0Raw, reserve1Raw, token0Info.decimals, token1Info.decimals)

      // 计算手续费百分比
      const feePercent = (Number(feeRate) / Number(feeDenominator) * 100).toFixed(2)

      // 格式化 LP 余额
      const userLpBalanceFormatted = ethers.formatUnits(userLpBalance.toString(), 18)
      const totalLpSupplyFormatted = ethers.formatUnits(totalLpSupply.toString(), 18)

      return {
        address: poolAddress,
        name: this.uint256ToString(poolName),
        token0: token0Info,
        token1: token1Info,
        reserve0: this.formatNumber(reserve0),
        reserve1: this.formatNumber(reserve1),
        reserve0Raw,
        reserve1Raw,
        fee: `${feePercent}%`,
        price: this.formatNumber(price),
        userLpBalance: this.formatNumber(userLpBalanceFormatted),
        userLpBalanceRaw: userLpBalance.toString(),
        totalLpSupply: this.formatNumber(totalLpSupplyFormatted),
        totalLpSupplyRaw: totalLpSupply.toString()
      }
    } catch (error) {
      console.error(`获取池子 ${poolAddress} 信息失败:`, error)
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
          symbol: info.symbol,
          name: info.name,
          decimals: info.decimals
        }
      }

      // 如果没有找到，尝试直接读取
      const info = await contractInteractionService.getERC20Info(tokenAddress)
      return {
        address: tokenAddress,
        symbol: info.symbol,
        name: info.name,
        decimals: info.decimals
      }
    } catch (error) {
      console.error(`获取代币 ${tokenAddress} 信息失败:`, error)
      // 返回默认值
      return {
        address: tokenAddress,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18
      }
    }
  }

  /**
   * 计算交换输出数量
   */
  async calculateSwapOutput(
    poolAddress: string, 
    inputAmount: string, 
    isTokenAToB: boolean
  ): Promise<string> {
    try {
      const abi = contractInteractionService.getAbi('amm')
      const functionName = isTokenAToB ? 'getAmountBOut' : 'getAmountAOut'
      
      const result = await contractInteractionService.callViewFunction({
        address: poolAddress,
        abi,
        functionName,
        args: [inputAmount]
      })

      return result.toString()
    } catch (error) {
      console.error('计算交换输出失败:', error)
      throw error
    }
  }

  /**
   * 执行交换
   */
  async executeSwap(
    poolAddress: string,
    inputAmount: string,
    isTokenAToB: boolean
  ) {
    try {
      const functionName = isTokenAToB ? 'swapAForB' : 'swapBForA'
      
      return await contractInteractionService.sendTransaction({
        address: poolAddress,
        abi: contractInteractionService.getAbi('amm'),
        functionName,
        args: [inputAmount]
      })
    } catch (error) {
      console.error('执行交换失败:', error)
      throw error
    }
  }

  /**
   * 添加流动性
   */
  async addLiquidity(
    poolAddress: string,
    amountA: string,
    amountB: string
  ) {
    try {
      return await contractInteractionService.addLiquidity(poolAddress, amountA, amountB)
    } catch (error) {
      console.error('添加流动性失败:', error)
      throw error
    }
  }

  /**
   * 移除流动性
   */
  async removeLiquidity(
    poolAddress: string,
    lpTokenAmount: string
  ) {
    try {
      return await contractInteractionService.removeLiquidity(poolAddress, lpTokenAmount)
    } catch (error) {
      console.error('移除流动性失败:', error)
      throw error
    }
  }

  /**
   * 获取 TWAP 价格
   */
  async getTWAPPrice(poolAddress: string): Promise<string> {
    try {
      const abi = contractInteractionService.getAbi('amm')
      
      const result = await contractInteractionService.callViewFunction({
        address: poolAddress,
        abi,
        functionName: 'GetTwapPrice'
      })

      return result.toString()
    } catch (error) {
      console.error('获取 TWAP 价格失败:', error)
      throw error
    }
  }

  /**
   * 执行闪电贷
   */
  async executeFlashSwap(
    poolAddress: string,
    amount: string,
    isTokenA: boolean,
    data: string = '0',
    caller: string
  ) {
    try {
      const functionName = isTokenA ? 'flashSwapTokenA' : 'flashSwapTokenB'
      
      return await contractInteractionService.sendTransaction({
        address: poolAddress,
        abi: contractInteractionService.getAbi('amm'),
        functionName,
        args: [amount, data, caller]
      })
    } catch (error) {
      console.error('执行闪电贷失败:', error)
      throw error
    }
  }

  /**
   * 授权代币给池子
   */
  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ) {
    try {
      return await contractInteractionService.approveERC20(tokenAddress, spenderAddress, amount)
    } catch (error) {
      console.error('授权代币失败:', error)
      throw error
    }
  }

  /**
   * 获取代币余额
   */
  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<string> {
    try {
      return await contractInteractionService.getERC20Balance(tokenAddress, accountAddress)
    } catch (error) {
      console.error('获取代币余额失败:', error)
      throw error
    }
  }

  /**
   * 计算价格
   */
  private calculatePrice(reserve0: string, reserve1: string, decimals0: number, decimals1: number): string {
    try {
      const reserve0Num = Number(ethers.formatUnits(reserve0, decimals0))
      const reserve1Num = Number(ethers.formatUnits(reserve1, decimals1))
      
      if (reserve1Num === 0) return '0'
      
      return (reserve0Num / reserve1Num).toString()
    } catch (error) {
      console.error('计算价格失败:', error)
      return '0'
    }
  }

  /**
   * 格式化数字（添加千分位分隔符）
   */
  private formatNumber(value: string | number): string {
    try {
      const num = typeof value === 'string' ? parseFloat(value) : value
      
      if (isNaN(num)) return '0'
      
      // 如果数字太小，使用科学计数法
      if (num > 0 && num < 0.000001) {
        return num.toExponential(4)
      }
      
      // 保留最多6位小数，并移除尾部的0
      const formatted = num.toFixed(6).replace(/\.?0+$/, '')
      
      // 添加千分位分隔符
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      
      return parts.join('.')
    } catch (error) {
      console.error('格式化数字失败:', error)
      return '0'
    }
  }

  /**
   * 将 uint256 转换为字符串
   */
  private uint256ToString(value: any): string {
    try {
      if (typeof value === 'string' && !value.startsWith('0x')) {
        return value
      }

      const numValue = typeof value === 'bigint' ? value : BigInt(value)

      if (numValue < BigInt('0x10000000000000000')) {
        return numValue.toString()
      }

      const hexStr = '0x' + numValue.toString(16).padStart(64, '0')
      const bytes = ethers.getBytes(hexStr)

      let endIndex = bytes.length
      while (endIndex > 0 && bytes[endIndex - 1] === 0) {
        endIndex--
      }

      if (endIndex === 0) return ''

      const trimmedBytes = bytes.slice(0, endIndex)
      return ethers.toUtf8String(trimmedBytes)
    } catch (error) {
      console.error('uint256ToString 转换失败:', error, value)
      return String(value)
    }
  }
}

// 导出单例
export const poolService = new PoolService()
export default poolService

