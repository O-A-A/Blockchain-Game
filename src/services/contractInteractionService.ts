// contractInteractionService.ts - 通用合约交互服务
import { ethers } from 'ethers'
import connectionService from './connectionService'

// 导入ABIs
import erc20Abi from '@/abis/e20c.json'
import wbkcAbi from '@/abis/wbkc.json'
import ammAbi from '@/abis/amm.json'

export interface CallContractOptions {
  address: string
  abi: any
  functionName: string
  args?: any[]
  value?: string // ETH value to send (in ether, not wei)
}

export interface TransactionResult {
  success: boolean
  hash?: string
  receipt?: ethers.TransactionReceipt
  error?: string
}

/**
 * 合约交互服务
 * 提供通用的合约调用功能
 */
class ContractInteractionService {
  /**
   * 获取对应类型的ABI
   */
  getAbi(contractType: 'erc20' | 'wbkc' | 'amm') {
    switch (contractType) {
      case 'erc20':
        return erc20Abi
      case 'wbkc':
        return wbkcAbi
      case 'amm':
        return ammAbi
      default:
        throw new Error(`未知的合约类型: ${contractType}`)
    }
  }

  /**
   * 创建合约实例
   */
  getContract(address: string, abi: any): ethers.Contract {
    const wallet = connectionService.getWallet()
    return new ethers.Contract(address, abi, wallet)
  }

  /**
   * 调用只读方法（view/pure）
   */
  async callViewFunction(options: CallContractOptions): Promise<any> {
    try {
      await connectionService.ensureConnected()

      const contract = this.getContract(options.address, options.abi)
      const args = options.args || []

      console.log(`[调用只读函数] ${options.functionName}`, {
        address: options.address,
        args
      })

      const result = await contract[options.functionName](...args)

      console.log(`[只读函数结果]`, result)

      return result
    } catch (error: any) {
      console.error(`调用只读函数失败:`, error)
      throw error
    }
  }

  /**
   * 发送交易（state-changing 函数）
   */
  async sendTransaction(options: CallContractOptions): Promise<TransactionResult> {
    try {
      await connectionService.ensureConnected()

      const contract = this.getContract(options.address, options.abi)
      const args = options.args || []

      console.log(`[发送交易] ${options.functionName}`, {
        address: options.address,
        args,
        value: options.value
      })

      // 构建 overrides
      const overrides: any = {}
      if (options.value) {
        overrides.value = ethers.parseEther(options.value)
        console.log(`[交易附带ETH]`, options.value, 'ETH')
      }

      // 发送交易
      const tx = await contract[options.functionName](...args, overrides)

      console.log(`[交易已发送] 哈希:`, tx.hash)

      // 等待确认
      const receipt = await tx.wait()

      console.log(`[交易已确认] 区块:`, receipt.blockNumber, 'Gas:', receipt.gasUsed.toString())

      return {
        success: true,
        hash: tx.hash,
        receipt
      }
    } catch (error: any) {
      console.error(`发送交易失败:`, error)
      return {
        success: false,
        error: error.message || '交易失败'
      }
    }
  }

  /**
   * ERC20 代币相关操作
   */
  async getERC20Info(address: string) {
    const abi = this.getAbi('erc20')

    // 并行获取所有信息
    const [name, symbol, decimals, totalSupply, url, contractType] = await Promise.all([
      this.callViewFunction({ address, abi, functionName: 'name' }),
      this.callViewFunction({ address, abi, functionName: 'symbol' }),
      this.callViewFunction({ address, abi, functionName: 'decimals' }),
      this.callViewFunction({ address, abi, functionName: 'totalSupply' }),
      this.callViewFunction({ address, abi, functionName: 'url' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    return {
      address,
      name: this.uint256ToString(name),
      symbol: this.uint256ToString(symbol),
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      url: this.uint256ToString(url),
      contractType: Number(contractType)
    }
  }

  async getERC20Balance(tokenAddress: string, accountAddress: string): Promise<string> {
    const abi = this.getAbi('erc20')
    const balance = await this.callViewFunction({
      address: tokenAddress,
      abi,
      functionName: 'balanceOf',
      args: [accountAddress]
    })
    return balance.toString()
  }

  async transferERC20(tokenAddress: string, to: string, amount: string): Promise<TransactionResult> {
    const abi = this.getAbi('erc20')
    return await this.sendTransaction({
      address: tokenAddress,
      abi,
      functionName: 'transfer',
      args: [to, amount]
    })
  }

  async approveERC20(tokenAddress: string, spender: string, amount: string): Promise<TransactionResult> {
    const abi = this.getAbi('erc20')
    return await this.sendTransaction({
      address: tokenAddress,
      abi,
      functionName: 'approve',
      args: [spender, amount]
    })
  }

  /**
   * WBKC 代币相关操作
   */
  async getWBKCInfo(address: string) {
    const abi = this.getAbi('wbkc')

    const [name, symbol, decimals, totalSupply, url, contractType] = await Promise.all([
      this.callViewFunction({ address, abi, functionName: 'name' }),
      this.callViewFunction({ address, abi, functionName: 'symbol' }),
      this.callViewFunction({ address, abi, functionName: 'decimals' }),
      this.callViewFunction({ address, abi, functionName: 'totalSupply' }),
      this.callViewFunction({ address, abi, functionName: 'url' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    return {
      address,
      name: this.uint256ToString(name),
      symbol: this.uint256ToString(symbol),
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      url: this.uint256ToString(url),
      contractType: Number(contractType)
    }
  }

  async mintWBKC(address: string, ethAmount: string): Promise<TransactionResult> {
    const abi = this.getAbi('wbkc')
    return await this.sendTransaction({
      address,
      abi,
      functionName: 'mintToken',
      args: [],
      value: ethAmount // 附带ETH
    })
  }

  async burnWBKC(address: string, amount: string): Promise<TransactionResult> {
    const abi = this.getAbi('wbkc')
    return await this.sendTransaction({
      address,
      abi,
      functionName: 'burnToken',
      args: [amount]
    })
  }

  /**
   * AMM 池子相关操作
   */
  async getAMMInfo(address: string) {
    const abi = this.getAbi('amm')

    const [poolName, tokenA, tokenB, reserveA, reserveB, url, contractType] = await Promise.all([
      this.callViewFunction({ address, abi, functionName: 'pool_name' }),
      this.callViewFunction({ address, abi, functionName: 'tokenA' }),
      this.callViewFunction({ address, abi, functionName: 'tokenB' }),
      this.callViewFunction({ address, abi, functionName: 'reserveA' }),
      this.callViewFunction({ address, abi, functionName: 'reserveB' }),
      this.callViewFunction({ address, abi, functionName: 'url' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    return {
      address,
      poolName: this.uint256ToString(poolName),
      tokenA,
      tokenB,
      reserveA: reserveA.toString(),
      reserveB: reserveB.toString(),
      url: this.uint256ToString(url),
      contractType: Number(contractType)
    }
  }

  async addLiquidity(
    poolAddress: string,
    amountA: string,
    amountB: string
  ): Promise<TransactionResult> {
    const abi = this.getAbi('amm')
    return await this.sendTransaction({
      address: poolAddress,
      abi,
      functionName: 'addLiquidity',
      args: [amountA, amountB]
    })
  }

  async removeLiquidity(poolAddress: string, liquidity: string): Promise<TransactionResult> {
    const abi = this.getAbi('amm')
    return await this.sendTransaction({
      address: poolAddress,
      abi,
      functionName: 'removeLiquidity',
      args: [liquidity]
    })
  }

  async swapAForB(poolAddress: string, amountA: string): Promise<TransactionResult> {
    const abi = this.getAbi('amm')
    return await this.sendTransaction({
      address: poolAddress,
      abi,
      functionName: 'swapAForB',
      args: [amountA]
    })
  }

  async swapBForA(poolAddress: string, amountB: string): Promise<TransactionResult> {
    const abi = this.getAbi('amm')
    return await this.sendTransaction({
      address: poolAddress,
      abi,
      functionName: 'swapBForA',
      args: [amountB]
    })
  }

  async getAmountBOut(poolAddress: string, amountA: string): Promise<string> {
    const abi = this.getAbi('amm')
    const result = await this.callViewFunction({
      address: poolAddress,
      abi,
      functionName: 'getAmountBOut',
      args: [amountA]
    })
    return result.toString()
  }

  async getAmountAOut(poolAddress: string, amountB: string): Promise<string> {
    const abi = this.getAbi('amm')
    const result = await this.callViewFunction({
      address: poolAddress,
      abi,
      functionName: 'getAmountAOut',
      args: [amountB]
    })
    return result.toString()
  }

  /**
   * 将 uint256 转换为字符串（处理编码的字符串）
   */
  private uint256ToString(value: any): string {
    try {
      // 如果已经是普通字符串，直接返回
      if (typeof value === 'string' && !value.startsWith('0x')) {
        return value
      }

      // 如果是 BigInt 或数字
      const numValue = typeof value === 'bigint' ? value : BigInt(value)

      // 如果数值很小，可能是直接存储的数字，返回字符串形式
      if (numValue < BigInt('0x10000000000000000')) {
        return numValue.toString()
      }

      // 转为 hex string
      const hexStr = '0x' + numValue.toString(16).padStart(64, '0')

      // 转为 bytes
      const bytes = ethers.getBytes(hexStr)

      // 移除尾部的0
      let endIndex = bytes.length
      while (endIndex > 0 && bytes[endIndex - 1] === 0) {
        endIndex--
      }

      if (endIndex === 0) return ''

      // 转为字符串
      const trimmedBytes = bytes.slice(0, endIndex)
      return ethers.toUtf8String(trimmedBytes)
    } catch (error) {
      console.error('uint256ToString 转换失败:', error, value)
      return String(value)
    }
  }
}

// 导出单例
export const contractInteractionService = new ContractInteractionService()
export default contractInteractionService
