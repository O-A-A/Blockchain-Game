// contractDeployService.ts - 合约部署服务
import { ethers } from 'ethers'
import connectionService from './connectionService'
import { useContractsStore } from '@/store/contracts'
import type {
  DeployERC20Params,
  DeployWBKCParams,
  DeployAMMParams,
  DeployResult,
  ContractInfo
} from '@/types/contracts'

// 导入ABIs和Bytecodes
import erc20Abi from '@/abis/e20c.json'
import wbkcAbi from '@/abis/wbkc.json'
import ammAbi from '@/abis/amm.json'

/**
 * 合约部署服务
 */
class ContractDeployService {
  /**
   * 部署ERC20代币合约
   * @param params 部署参数
   * @param onProgress 进度回调
   */
  async deployERC20(
    params: DeployERC20Params,
    onProgress?: (stage: string) => void
  ): Promise<DeployResult> {
    try {
      // ✅ 确保已连接，如果未连接则尝试从 sessionStorage 恢复
      onProgress?.('检查连接状态...')
      await connectionService.ensureConnected()

      onProgress?.('准备部署参数...')

      const wallet = connectionService.getWallet()

      // ✅ 检查 wallet 是否为 null
      if (!wallet) {
        throw new Error('无法获取钱包实例，请重新登录')
      }

      const contractsStore = useContractsStore()

      // 加载bytecode
      const bytecode = await this.loadBytecode('e20c')

      // 参数处理：直接传递字符串，让 ethers.js 自动转换
      // 完全遵循 app.js 的做法
      const nameParam = params.name || 0
      const imgUrlParam = params.imgUrl || 0

      onProgress?.('创建合约工厂...')

      // 创建合约工厂
      const factory = new ethers.ContractFactory(erc20Abi, bytecode, wallet)

      onProgress?.('发送部署交易...')

      // 部署合约
      const contract = await factory.deploy(nameParam, params.totalSupply, imgUrlParam)

      const deployTx = contract.deploymentTransaction()
      if (!deployTx) {
        throw new Error('部署交易失败：无法获取部署交易')
      }

      onProgress?.('等待交易确认...')

      // 等待部署完成
      await contract.waitForDeployment()
      const contractAddress = await contract.getAddress()
      
      if (!contractAddress) {
        throw new Error('部署失败：无法获取合约地址')
      }

      onProgress?.('读取合约信息...')

      // 创建合约信息对象
      const provider = connectionService.getProvider()
      const receipt = await provider.getTransactionReceipt(deployTx.hash)
      
      if (!receipt) {
        throw new Error('无法获取交易收据')
      }

      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 0, 
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: wallet.address,
        name: params.name,
        totalSupply: params.totalSupply,
        imgUrl: params.imgUrl || 0,
      }

      // 添加到store
      contractsStore.addContract(contractInfo)

      onProgress?.('部署成功！')

      return {
        success: true,
        contractAddress,
        contractInfo,
        transactionHash: deployTx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        transactionHash: '',
        error: error.message || '部署失败'
      }
    }
  }

  /**
   * 部署WBKC代币合约
   * @param params 部署参数
   * @param onProgress 进度回调
   */
  async deployWBKC(
    params: DeployWBKCParams,
    onProgress?: (stage: string) => void
  ): Promise<DeployResult> {
    try {
      if (!connectionService.isConnected()) {
        throw new Error('未连接到区块链节点')
      }

      onProgress?.('准备部署参数...')

      const wallet = connectionService.getWallet()
      const contractsStore = useContractsStore()

      // 加载bytecode
      const bytecode = await this.loadBytecode('wbkc')

      // 参数处理：直接传递字符串，让 ethers.js 自动转换
      const nameParam = params.name || ''
      const imgUrlParam = params.imgUrl || ''

      onProgress?.('创建合约工厂...')

      const factory = new ethers.ContractFactory(wbkcAbi, bytecode, wallet)

      onProgress?.('发送部署交易...')

      const contract = await factory.deploy(nameParam, imgUrlParam)
      const deployTx = contract.deploymentTransaction()
      if (!deployTx) {
        throw new Error('部署交易失败')
      }

      onProgress?.('等待交易确认...')

      await contract.waitForDeployment()
      const contractAddress = await contract.getAddress()

      onProgress?.('读取合约信息...')

      const provider = connectionService.getProvider()
      const receipt = await provider.getTransactionReceipt(deployTx.hash)
      
      if (!receipt) {
        throw new Error('无法获取交易收据')
      }

      // 获取总供应量
      const deployedContract = new ethers.Contract(contractAddress, wbkcAbi, provider)
      const totalSupply = await deployedContract.totalSupply()

      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 1, // WBKC
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: wallet.address,
        name: params.name,
        imgUrl: params.imgUrl || 0,
        totalSupply: totalSupply.toString(),
      }

      contractsStore.addContract(contractInfo)

      onProgress?.('部署成功！')

      return {
        success: true,
        contractAddress,
        contractInfo,
        transactionHash: deployTx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        transactionHash: '',
        error: error.message || '部署失败'
      }
    }
  }

  /**
   * 部署AMM流动性池合约
   * @param params 部署参数
   * @param onProgress 进度回调
   */
  async deployAMM(
    params: DeployAMMParams,
    onProgress?: (stage: string) => void
  ): Promise<DeployResult> {
    try {
      if (!connectionService.isConnected()) {
        throw new Error('未连接到区块链节点')
      }

      onProgress?.('验证代币地址...')

      // 验证代币地址
      if (!ethers.isAddress(params.tokenA) || !ethers.isAddress(params.tokenB)) {
        throw new Error('无效的代币地址')
      }

      if (params.tokenA.toLowerCase() === params.tokenB.toLowerCase()) {
        throw new Error('不能使用相同的代币创建池子')
      }

      onProgress?.('准备部署参数...')

      const wallet = connectionService.getWallet()
      const contractsStore = useContractsStore()

      // 加载bytecode
      const bytecode = await this.loadBytecode('amm')

      // 参数处理：直接传递字符串，让 ethers.js 自动转换
      const poolNameParam = params.poolName || ''
      const imgUrlParam = params.imgUrl || ''

      onProgress?.('创建合约工厂...')

      const factory = new ethers.ContractFactory(ammAbi, bytecode, wallet)

      onProgress?.('发送部署交易...')

      const contract = await factory.deploy(
        params.tokenA,
        params.tokenB,
        poolNameParam,
        imgUrlParam
      )

      const deployTx = contract.deploymentTransaction()
      if (!deployTx) {
        throw new Error('部署交易失败')
      }

      onProgress?.('等待交易确认...')

      await contract.waitForDeployment()
      const contractAddress = await contract.getAddress()

      onProgress?.('读取合约信息...')

      const provider = connectionService.getProvider()
      const receipt = await provider.getTransactionReceipt(deployTx.hash)
      
      if (!receipt) {
        throw new Error('无法获取交易收据')
      }

      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 2, // AMM
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: wallet.address,
        name: params.poolName,
        imgUrl: params.imgUrl || 0,
        tokenA: params.tokenA,
        tokenB: params.tokenB
      }

      contractsStore.addContract(contractInfo)

      onProgress?.('部署成功！')

      return {
        success: true,
        contractAddress,
        contractInfo,
        transactionHash: deployTx.hash
      }
    } catch (error: any) {
      return {
        success: false,
        transactionHash: '',
        error: error.message || '部署失败'
      }
    }
  }

  /**
   * 加载bytecode
   */
  private async loadBytecode(contractType: 'e20c' | 'wbkc' | 'amm'): Promise<string> {
    try {
      // 动态导入bytecode
      const bytecodeModule = await import(`@/abis/${contractType}.bytecode?raw`)
      const bytecode = bytecodeModule.default || bytecodeModule

      if (!bytecode || bytecode.trim().length === 0) {
        throw new Error(`无法加载 ${contractType} 的bytecode`)
      }

      // 确保bytecode以0x开头
      return bytecode.startsWith('0x') ? bytecode : '0x' + bytecode
    } catch (error) {
      throw new Error(`无法加载合约bytecode: ${contractType}`)
    }
  }

  /**
   * 将参数转换为 uint256
   * 如果是纯数字字符串，直接转换；否则编码为 bytes32
   */
  private toUint256Param(value: string): bigint | string {
    if (!value || value.trim().length === 0) {
      return BigInt(0)
    }

    // 如果是纯数字，直接返回让 ethers.js 处理
    if (/^\d+$/.test(value.trim())) {
      return value
    }

    // 否则将字符串编码为 bytes32 格式的 uint256
    const bytes = ethers.toUtf8Bytes(value.substring(0, 31)) // 最多31字节，留一字节给长度
    
    // 填充到32字节
    const paddedBytes = new Uint8Array(32)
    paddedBytes.set(bytes)
    
    // 转换为 hex 字符串，然后转为 BigInt
    const hexStr = ethers.hexlify(paddedBytes)
    return BigInt(hexStr)
  }
  
  /**
   * 将 uint256 转换回字符串
   * 注意：如果合约直接存储的是字符串（ethers.js 自动转换），则直接返回 toString()
   */
  static uint256ToString(value: bigint | string): string {
    try {
      // 如果已经是字符串类型，直接返回
      if (typeof value === 'string' && !value.startsWith('0x')) {
        return value
      }
      
      // 如果是数字或十六进制，尝试转换
      const numValue = typeof value === 'bigint' ? value : BigInt(value)
      
      // 如果数值很小（可能是直接存储的字符串），直接返回字符串形式
      if (numValue < BigInt('0x10000000000000000')) { // 小于一个合理的 bytes32 值
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
      
      // 转为字符串
      if (endIndex === 0) return ''
      const trimmedBytes = bytes.slice(0, endIndex)
      return ethers.toUtf8String(trimmedBytes)
    } catch (error) {
      // 失败时返回原始值的字符串形式
      return String(value)
    }
  }

  /**
   * 从名称派生符号
   */
  private deriveSymbol(name: string): string {
    if (!name) return 'TKN'

    // 取首字母大写
    const words = name.split(/\s+/)
    if (words.length > 1) {
      return words
        .map(w => w.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 6)
    }

    return name.substring(0, 6).toUpperCase()
  }

  /**
   * 估算部署gas费用
   * @param contractType 合约类型
   */
  async estimateDeployGas(contractType: 'erc20' | 'wbkc' | 'amm'): Promise<string> {
    try {
      const provider = connectionService.getProvider()
      const feeData = await provider.getFeeData()

      // 估算的gas消耗量（根据合约复杂度）
      const gasEstimates = {
        erc20: 1500000, // 1.5M gas
        wbkc: 1200000, // 1.2M gas
        amm: 2500000 // 2.5M gas
      }

      const gasLimit = BigInt(gasEstimates[contractType])
      const gasPrice = feeData.gasPrice || BigInt(0)

      const gasCost = gasLimit * gasPrice
      return ethers.formatEther(gasCost)
    } catch (error) {
      return '0'
    }
  }
}

// 导出单例
export const contractDeployService = new ContractDeployService()
export default contractDeployService

