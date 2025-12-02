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
      onProgress?.('检查连接状态...')
      await connectionService.ensureConnected()

      onProgress?.('准备部署参数...')

      const signer = connectionService.getSigner()

      // ✅ 检查 signer 是否为 null
      if (!signer) {
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
      const factory = new ethers.ContractFactory(erc20Abi, bytecode, signer)

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
      const ownerAddress = await signer.getAddress()
      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 0,
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: ownerAddress,
        name: params.name,
        totalSupply: params.totalSupply,
        imgUrl: params.imgUrl || 0n,
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
      await connectionService.ensureConnected()

      onProgress?.('准备部署参数...')

      const signer = connectionService.getSigner()
      const contractsStore = useContractsStore()

      // 加载bytecode
      const bytecode = await this.loadBytecode('wbkc')

      // 参数处理：直接传递字符串，让 ethers.js 自动转换
      const nameParam = params.name || ''
      const imgUrlParam = params.imgUrl || ''

      onProgress?.('创建合约工厂...')

      const factory = new ethers.ContractFactory(wbkcAbi, bytecode, signer)

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
      const ownerAddress = await signer.getAddress()

      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 1, // WBKC
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: ownerAddress,
        name: params.name,
        imgUrl: params.imgUrl || 0n,
        totalSupply: totalSupply.toString()
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
      await connectionService.ensureConnected()

      onProgress?.('验证代币地址...')

      // 验证代币地址
      if (!ethers.isAddress(params.tokenA) || !ethers.isAddress(params.tokenB)) {
        throw new Error('无效的代币地址')
      }

      if (params.tokenA.toLowerCase() === params.tokenB.toLowerCase()) {
        throw new Error('不能使用相同的代币创建池子')
      }

      onProgress?.('准备部署参数...')

      const signer = connectionService.getSigner()
      const contractsStore = useContractsStore()

      // 加载bytecode
      const bytecode = await this.loadBytecode('amm')

      // 参数处理：直接传递字符串，让 ethers.js 自动转换
      const poolNameParam = params.poolName || ''
      const imgUrlParam = params.imgUrl || ''

      onProgress?.('创建合约工厂...')

      const factory = new ethers.ContractFactory(ammAbi, bytecode, signer)

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
      const ownerAddress = await signer.getAddress()

      const contractInfo: ContractInfo = {
        address: contractAddress,
        type: 2, // AMM
        deployedBlock: receipt.blockNumber || 0,
        deployedTime: Date.now(),
        owner: ownerAddress,
        name: params.poolName,
        imgUrl: params.imgUrl || 0n,
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
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error)
      // 包含原始错误信息以便排查
      throw new Error(`无法加载合约bytecode: ${contractType} - ${message}`)
    }
  }
}

// 导出单例
export const contractDeployService = new ContractDeployService()
export default contractDeployService

