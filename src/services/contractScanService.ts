// contractScanService.ts - 合约扫描服务
import { ethers } from 'ethers'
import connectionService from './connectionService'
import { useContractsStore } from '@/store/contracts'
import type {
  ContractInfo,
  ContractType,
  ERC20ContractInfo,
  WBKCContractInfo,
  AMMContractInfo
} from '@/types/contracts'

// 最小ABI - 用于识别合约类型
const MINIMAL_ABI = [
  {
    inputs: [],
    name: 'contract_type',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
]

// ERC20/WBKC读取信息的ABI
const TOKEN_INFO_ABI = [
  {
    inputs: [],
    name: 'coin_name',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'img_coin_url',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'coinOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
]

// AMM读取信息的ABI
const AMM_INFO_ABI = [
  {
    inputs: [],
    name: 'POOL_NAME',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pool_img_url',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tokenAAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tokenBAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'poolOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
]

/**
 * 合约扫描服务
 */
class ContractScanService {
  /**
   * 扫描所有区块，查找合约部署交易
   * @param startBlock 起始区块（默认从上次扫描位置开始）
   * @param endBlock 结束区块（默认最新区块）
   * @param onProgress 进度回调
   */
  async scanContracts(
    startBlock?: number,
    endBlock?: number,
    onProgress?: (current: number, total: number, found: number) => void
  ): Promise<ContractInfo[]> {
    // 确保连接可用
    try {
      await connectionService.ensureConnected()
    } catch (error) {
      throw new Error('未连接到区块链节点，请重新登录或检查网络连接')
    }

    const provider = connectionService.getProvider()
    const contractsStore = useContractsStore()
    const foundContracts: ContractInfo[] = []

    // 确定扫描范围
    const latestBlock = await provider.getBlockNumber()
    const start = startBlock || contractsStore.lastScanBlock || 0
    const end = endBlock || latestBlock

    // 更新扫描状态
    contractsStore.startScan(end - start + 1)

    try {
      // 逐块扫描
      for (let blockNum = start; blockNum <= end; blockNum++) {
        // 每10个区块更新一次进度
        if (blockNum % 10 === 0 || blockNum === end) {
          contractsStore.updateScanProgress({
            currentBlock: blockNum - start,
            foundContracts: foundContracts.length
          })

          if (onProgress) {
            onProgress(blockNum - start, end - start + 1, foundContracts.length)
          }
        }

        try {
          const block = await provider.getBlock(blockNum, true)
          if (!block || !block.transactions) continue

          // 检查每笔交易
          for (const txHash of block.transactions) {
            try {
              // 获取交易收据
              const receipt = await provider.getTransactionReceipt(txHash as string)

              // 检查是否是合约部署交易（to为null）
              if (receipt && receipt.contractAddress) {
                const contractAddress = receipt.contractAddress

                // 识别合约类型
                const contractInfo = await this.identifyAndReadContract(
                  contractAddress,
                  blockNum,
                  block.timestamp
                )

                if (contractInfo) {
                  foundContracts.push(contractInfo)
                  contractsStore.addContract(contractInfo)
                }
              }
            } catch (txError) {
              // 单个交易错误不应中断整个扫描
            }
          }
        } catch (blockError) {
          // 区块错误不应中断整个扫描
        }
      }

      // 完成扫描
      contractsStore.completeScan(end)

      return foundContracts
    } catch (error) {
      console.error('扫描过程中出错:', error)
      contractsStore.updateScanProgress({ isScanning: false })
      throw error
    }
  }

  /**
   * 识别合约类型并读取信息
   * @param address 合约地址
   * @param blockNum 部署区块号
   * @param timestamp 部署时间戳
   */
  async identifyAndReadContract(
    address: string,
    blockNum: number,
    timestamp: number
  ): Promise<ContractInfo | null> {
    try {
      const provider = connectionService.getProvider()

      // 尝试调用contract_type()
      const typeContract = new ethers.Contract(address, MINIMAL_ABI, provider)
      const typeValue = await typeContract.contract_type()
      const type = Number(typeValue) as ContractType

      // 根据类型读取详细信息
      switch (type) {
        case 0: // ERC20
          return await this.readERC20Info(address, blockNum, timestamp)

        case 1: // WBKC
          return await this.readWBKCInfo(address, blockNum, timestamp)

        case 2: // AMM
          return await this.readAMMInfo(address, blockNum, timestamp)

        default:
          return null
      }
    } catch (error) {
      // 如果无法调用contract_type()，说明不是我们的合约
      return null
    }
  }

  /**
   * 读取ERC20代币信息
   */
  private async readERC20Info(
    address: string,
    blockNum: number,
    timestamp: number
  ): Promise<ERC20ContractInfo> {
    const provider = connectionService.getProvider()
    const contract = new ethers.Contract(address, TOKEN_INFO_ABI, provider)

    const [coinName, imgUrl, totalSupply, coinOwner] = await Promise.all([
      contract.coin_name(),
      contract.img_coin_url(),
      contract.totalSupply(),
      contract.coinOwner()
    ])

    return {
      address,
      type: 0,
      deployedBlock: blockNum,
      deployedTime: timestamp,
      owner: coinOwner,
      name: coinName,
      totalSupply: totalSupply,
      imgUrl: imgUrl,
    }
  }

  /**
   * 读取WBKC代币信息
   */
  private async readWBKCInfo(
    address: string,
    blockNum: number,
    timestamp: number
  ): Promise<WBKCContractInfo> {
    const provider = connectionService.getProvider()
    const contract = new ethers.Contract(address, TOKEN_INFO_ABI, provider)

    const [coinName, imgUrl, totalSupply, coinOwner] = await Promise.all([
      contract.coin_name(),
      contract.img_coin_url(),
      contract.totalSupply(),
      contract.coinOwner()
    ])

    return {
      address,
      type: 1,
      deployedBlock: blockNum,
      deployedTime: timestamp,
      owner: coinOwner,
      name: coinName,
      totalSupply: totalSupply,
      imgUrl: imgUrl,
    }
  }

  /**
   * 读取AMM池子信息
   */
  private async readAMMInfo(
    address: string,
    blockNum: number,
    timestamp: number
  ): Promise<AMMContractInfo> {
    const provider = connectionService.getProvider()
    const contract = new ethers.Contract(address, AMM_INFO_ABI, provider)

    // 尝试读取信息，即使部分失败也保留合约记录
    try {
      const [poolName, tokenAAddress, tokenBAddress, owner, imgUrl] = await Promise.all([
        contract.POOL_NAME().catch(() => BigInt(0)),
        contract.tokenAAddress().catch(() => ethers.ZeroAddress),
        contract.tokenBAddress().catch(() => ethers.ZeroAddress),
        contract.poolOwner().catch(() => ethers.ZeroAddress),
        contract.pool_img_url().catch(() => BigInt(0))
      ])

      return {
        address,
        type: 2,
        deployedBlock: blockNum,
        deployedTime: timestamp,
        owner,
        name: poolName,
        imgUrl: imgUrl,
        tokenA: tokenAAddress,
        tokenB: tokenBAddress
      }
    } catch (error) {
      // 即使完全失败，也返回基本的 AMM 合约记录
      console.warn(`AMM 合约 ${address} 读取失败，保留基本信息`)
      return {
        address,
        type: 2,
        deployedBlock: blockNum,
        deployedTime: timestamp,
        owner: ethers.ZeroAddress,
        name: -1,
        imgUrl: -1,
        tokenA: ethers.ZeroAddress,
        tokenB: ethers.ZeroAddress
      }
    }
  }

  /**
   * 从名称派生代币符号（简化版）
   */
  private deriveSymbolFromName(name: string): string {
    // 简单实现：取前几个字符
    // 实际可能需要更复杂的逻辑来解析uint256编码的字符串
    if (name.length <= 10) return name.toUpperCase()
    return name.substring(0, 6).toUpperCase()
  }

  /**
   * 将 uint256 转换为字符串
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

  /**
   * 快速扫描新区块
   * 从上次扫描位置开始扫描到最新区块
   */
  async scanNewBlocks(): Promise<ContractInfo[]> {
    const contractsStore = useContractsStore()
    const lastBlock = contractsStore.lastScanBlock

    if (lastBlock === 0) {
      throw new Error('请先进行完整扫描')
    }

    return await this.scanContracts(lastBlock + 1)
  }

  /**
   * 重新扫描所有区块
   * 清空现有数据并从头开始扫描
   */
  async rescanAll(): Promise<ContractInfo[]> {
    const contractsStore = useContractsStore()
    contractsStore.clearAllContracts()

    return await this.scanContracts(0)
  }

  /**
   * 单独识别一个合约
   * 用于用户手动添加合约地址
   */
  async identifyContract(address: string): Promise<ContractInfo | null> {
    try {
      const provider = connectionService.getProvider()

      // 获取合约部署信息
      const code = await provider.getCode(address)
      if (code === '0x') {
        throw new Error('该地址不是合约地址')
      }

      // 识别并读取合约信息
      return await this.identifyAndReadContract(address, 0, Date.now())
    } catch (error) {
      throw error
    }
  }
}

// 导出单例
export const contractScanService = new ContractScanService()
export default contractScanService

