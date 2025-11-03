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

      const result = await contract[options.functionName](...args)

      return result
    } catch (error: any) {
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

      // 构建 overrides
      const overrides: any = { gasLimit: 300000 }
      if (options.value) {
        overrides.value = ethers.parseEther(options.value)
      }

      // 发送交易
      const tx = await contract[options.functionName](...args, overrides)

      // 等待确认
      const receipt = await tx.wait()

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

    // 并行获取所有信息（使用 allSettled 容错）
    const results = await Promise.allSettled([
      this.callViewFunction({ address, abi, functionName: 'coin_name' }),
      this.callViewFunction({ address, abi, functionName: 'totalSupply' }),
      this.callViewFunction({ address, abi, functionName: 'img_coin_url' }),
      this.callViewFunction({ address, abi, functionName: 'coinOwner' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    const coinName = results[0].status === 'fulfilled' ? results[0].value : BigInt(0)
    const totalSupply = results[1].status === 'fulfilled' ? results[1].value : BigInt(0)
    const imgUrl = results[2].status === 'fulfilled' ? results[2].value : BigInt(0)
    const owner = results[3].status === 'fulfilled' ? results[3].value : ethers.ZeroAddress
    const contractType = results[4].status === 'fulfilled' ? results[4].value : BigInt(0)

    const name = this.uint256ToString(coinName) || 'NaN'
    const symbol = this.deriveSymbolFromName(name)

    return {
      address,
      name,
      symbol,
      decimals: 18, // 默认18位精度
      totalSupply: totalSupply.toString(),
      url: this.uint256ToString(imgUrl) || '',
      owner,
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

  async getAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint> {
    const abi = this.getAbi('erc20');
    const allowance = await this.callViewFunction({
      address: tokenAddress,
      abi,
      functionName: 'allowanceOf',
      args: [owner, spender]
    });
    return BigInt(allowance);
  }

  async checkAndApprove(tokenAddress: string, spender: string, requiredAmount: string): Promise<boolean> {
    const wallet = connectionService.getWallet();
    const owner = wallet.address;
    const requiredAmountBigInt = BigInt(requiredAmount);

    const currentAllowance = await this.getAllowance(tokenAddress, owner, spender);

    if (currentAllowance < requiredAmountBigInt) {
      console.log(`Allowance is low. Current: ${currentAllowance}, Required: ${requiredAmountBigInt}. Approving...`);
      const approveAmount = ethers.MaxUint256.toString();
      const approveResult = await this.approveERC20(tokenAddress, spender, approveAmount);

      if (!approveResult.success || !approveResult.receipt) {
        throw new Error(`Approve transaction failed to be sent or was reverted: ${approveResult.error}`);
      }

      if (approveResult.receipt.status !== 1) {
        throw new Error(`Approve transaction for token ${tokenAddress} was reverted by the EVM.`);
      }

      console.log(`Successfully approved token ${tokenAddress} for spender ${spender}. Transaction: ${approveResult.hash}`);
      return true; // Approved and confirmed
    }

    console.log("Allowance is sufficient.");
    return true; // Already approved
  }

  /**
   * WBKC 代币相关操作
   */
  async getWBKCInfo(address: string) {
    const abi = this.getAbi('wbkc')

    // 并行获取所有信息（使用 allSettled 容错）
    const results = await Promise.allSettled([
      this.callViewFunction({ address, abi, functionName: 'coin_name' }),
      this.callViewFunction({ address, abi, functionName: 'totalSupply' }),
      this.callViewFunction({ address, abi, functionName: 'img_coin_url' }),
      this.callViewFunction({ address, abi, functionName: 'coinOwner' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    const coinName = results[0].status === 'fulfilled' ? results[0].value : BigInt(0)
    const totalSupply = results[1].status === 'fulfilled' ? results[1].value : BigInt(0)
    const imgUrl = results[2].status === 'fulfilled' ? results[2].value : BigInt(0)
    const owner = results[3].status === 'fulfilled' ? results[3].value : ethers.ZeroAddress
    const contractType = results[4].status === 'fulfilled' ? results[4].value : BigInt(1)

    const name = this.uint256ToString(coinName) || 'NaN'

    return {
      address,
      name,
      symbol: 'WBKC', // WBKC 固定符号
      decimals: 18, // 默认18位精度
      totalSupply: totalSupply.toString(),
      url: this.uint256ToString(imgUrl) || '',
      owner,
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

    const [poolName, tokenA, tokenB, poolInfo, imgUrl, contractType] = await Promise.all([
      this.callViewFunction({ address, abi, functionName: 'POOL_NAME' }),
      this.callViewFunction({ address, abi, functionName: 'tokenAAddress' }),
      this.callViewFunction({ address, abi, functionName: 'tokenBAddress' }),
      this.callViewFunction({ address, abi, functionName: 'getPoolInfo' }),
      this.callViewFunction({ address, abi, functionName: 'pool_img_url' }),
      this.callViewFunction({ address, abi, functionName: 'contract_type' })
    ])

    // poolInfo 返回: [tokenABalance, tokenBBalance, totalLPSupply, k]
    return {
      address,
      poolName: this.uint256ToString(poolName),
      tokenA,
      tokenB,
      reserveA: poolInfo[0].toString(),
      reserveB: poolInfo[1].toString(),
      totalLPSupply: poolInfo[2].toString(),
      url: this.uint256ToString(imgUrl),
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
   * 从名称派生代币符号
   */
  private deriveSymbolFromName(name: string): string {
    // 简单实现：取前几个字符并转大写
    if (!name || name.length === 0) return 'UNKNOWN'
    if (name.length <= 6) return name.toUpperCase()
    return name.substring(0, 6).toUpperCase()
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
      return String(value)
    }
  }
}

// 导出单例
export const contractInteractionService = new ContractInteractionService()
export default contractInteractionService
