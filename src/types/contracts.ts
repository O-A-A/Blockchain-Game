// contracts.ts - 合约相关的类型定义

/**
 * 合约类型枚举
 */
export enum ContractType {
  ERC20 = 0,      // 标准ERC20代币
  WBKC = 1,       // 包装BKC代币
  AMM = 2         // AMM流动性池
}

/**
 * 基础合约信息
 */
export interface BaseContractInfo {
  address: string           // 合约地址
  type: ContractType        // 合约类型
  deployedBlock: number     // 部署区块号
  deployedTime: number      // 部署时间戳
  owner: string             // 合约拥有者
}

/**
 * ERC20代币合约信息
 */
export interface ERC20ContractInfo extends BaseContractInfo {
  type: ContractType.ERC20
  name: number              // 代币名称（实际是uint256）
  totalSupply: number       // 总供应量
  imgUrl: number            // 图片URL（uint256）
}

/**
 * WBKC代币合约信息
 */
export interface WBKCContractInfo extends BaseContractInfo {
  type: ContractType.WBKC
  name: number            
  imgUrl: number      
  totalSupply: number
}

/**
 * AMM池子合约信息
 */
export interface AMMContractInfo extends BaseContractInfo {
  type: ContractType.AMM
  name: number
  imgUrl: number
  tokenA: string            // Token A地址
  tokenB: string            // Token B地址
  reserves?: {              // 储备量
    tokenA: string
    tokenB: string
  }
  totalLPSupply?: string    // LP代币总供应量
  fee?: string              // 手续费率
}

/**
 * 联合类型：所有合约信息
 */
export type ContractInfo = ERC20ContractInfo | WBKCContractInfo | AMMContractInfo

/**
 * 合约扫描进度
 */
export interface ScanProgress {
  isScanning: boolean
  currentBlock: number
  totalBlocks: number
  foundContracts: number
  startTime: number
  estimatedTimeRemaining?: number
}

/**
 * 合约部署参数 - ERC20
 */
export interface DeployERC20Params {
  name: number           
  totalSupply: number     
  imgUrl: number     
}

/**
 * 合约部署参数 - WBKC
 */
export interface DeployWBKCParams {
  name: number         
  imgUrl: number
}

/**
 * 合约部署参数 - AMM
 */
export interface DeployAMMParams {
  tokenA: string            // Token A地址
  tokenB: string            // Token B地址
  poolName: number 
  imgUrl: number
}

/**
 * 合约部署结果
 */
export interface DeployResult {
  success: boolean
  contractAddress?: string
  transactionHash: string
  contractInfo?: ContractInfo
  error?: string
}

/**
 * 合约过滤选项
 */
export interface ContractFilterOptions {
  type?: ContractType | ContractType[]
  searchQuery?: string      // 搜索名称或地址
  owner?: string            // 按拥有者筛选
}

