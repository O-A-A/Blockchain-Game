// contracts.ts - 合约信息管理Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ContractInfo,
  ERC20ContractInfo,
  WBKCContractInfo,
  AMMContractInfo,
  ContractType,
  ScanProgress,
} from '@/types/contracts'

const STORAGE_KEY = 'brokerfi_contracts'
const LAST_SCAN_BLOCK_KEY = 'brokerfi_last_scan_block'

export const useContractsStore = defineStore('contracts', () => {
  // ==================== 状态 ====================
  
  // 所有合约列表
  const contracts = ref<ContractInfo[]>([])
  
  // 扫描进度
  const scanProgress = ref<ScanProgress>({
    isScanning: false,
    currentBlock: 0,
    totalBlocks: 0,
    foundContracts: 0,
    startTime: 0
  })
  
  // 最后扫描的区块号
  const lastScanBlock = ref<number>(0)
  
  // 错误信息
  const error = ref<string | null>(null)
  
  // ==================== 计算属性 ====================
  
  // ERC20代币列表
  const erc20Tokens = computed(() => 
    contracts.value.filter(c => c && c.type === 0) as ERC20ContractInfo[]
  )
  
  // WBKC代币列表
  const wbkcTokens = computed(() => 
    contracts.value.filter(c => c && c.type === 1) as WBKCContractInfo[]
  )
  
  // AMM池子列表
  const ammPools = computed(() => 
    contracts.value.filter(c => c && c.type === 2) as AMMContractInfo[]
  )
  
  // 所有代币（ERC20 + WBKC）
  const allTokens = computed(() => [
    ...erc20Tokens.value,
    ...wbkcTokens.value
  ])
  
  // 是否正在扫描
  const isScanning = computed(() => scanProgress.value.isScanning)
  
  // 扫描进度百分比
  const scanProgressPercent = computed(() => {
    if (scanProgress.value.totalBlocks === 0) return 0
    return Math.floor(
      (scanProgress.value.currentBlock / scanProgress.value.totalBlocks) * 100
    )
  })
  
  // ==================== 方法 ====================
  
  /**
   * 添加合约
   */
  function addContract(contract: ContractInfo) {
    // 验证传入的合约对象
    if (!contract || !contract.address) {
      return
    }

    // 检查是否已存在（过滤掉 null 元素）
    const exists = contracts.value.some(c => c && c.address && c.address.toLowerCase() === contract.address.toLowerCase())
    if (exists) {
      return
    }

    contracts.value.push(contract)
    saveToStorage()
  }
  
  /**
   * 批量添加合约
   */
  function addContracts(newContracts: ContractInfo[]) {
    newContracts.forEach(contract => {
      // 跳过无效的合约对象
      if (!contract || !contract.address) {
        return
      }

      const exists = contracts.value.some(
        c => c && c.address && c.address.toLowerCase() === contract.address.toLowerCase()
      )
      if (!exists) {
        contracts.value.push(contract)
      }
    })
    saveToStorage()
  }
  
  /**
   * 更新合约信息
   */
  function updateContract(address: string, updates: Partial<ContractInfo>) {
    const index = contracts.value.findIndex(
      c => c && c.address && c.address.toLowerCase() === address.toLowerCase()
    )
    if (index !== -1) {
      contracts.value[index] = { ...contracts.value[index], ...updates } as ContractInfo
      saveToStorage()
    }
  }

  /**
   * 删除合约
   */
  function removeContract(address: string) {
    contracts.value = contracts.value.filter(
      c => c && c.address && c.address.toLowerCase() !== address.toLowerCase()
    )
    saveToStorage()
  }
  
  /**
   * 根据地址获取合约
   */
  function getContractByAddress(address: string): ContractInfo | undefined {
    return contracts.value.find(
      c => c && c.address && c.address.toLowerCase() === address.toLowerCase()
    )
  }
  
  /**
   * 根据类型获取合约列表
   */
  function getContractsByType(type: ContractType): ContractInfo[] {
    return contracts.value.filter(c => c && c.type === type)
  }
  
  /**
   * 更新扫描进度
   */
  function updateScanProgress(progress: Partial<ScanProgress>) {
    scanProgress.value = { ...scanProgress.value, ...progress }
  }
  
  /**
   * 开始扫描
   */
  function startScan(totalBlocks: number) {
    scanProgress.value = {
      isScanning: true,
      currentBlock: 0,
      totalBlocks,
      foundContracts: 0,
      startTime: Date.now()
    }
  }
  
  /**
   * 完成扫描
   */
  function completeScan(lastBlock: number) {
    scanProgress.value.isScanning = false
    lastScanBlock.value = lastBlock
    localStorage.setItem(LAST_SCAN_BLOCK_KEY, lastBlock.toString())
  }
  
  /**
   * 清空所有合约
   */
  function clearAllContracts() {
    contracts.value = []
    lastScanBlock.value = 0
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_SCAN_BLOCK_KEY)
  }
  
  /**
   * 保存到localStorage
   */
  function saveToStorage() {
    try {
      const data = {
        contracts: contracts.value,
        lastScanBlock: lastScanBlock.value,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      error.value = '保存失败'
    }
  }
  
  /**
   * 从localStorage加载
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // 过滤掉 null 或无效的合约对象
        const validContracts = (data.contracts || []).filter((c: any) => c && c.address)
        contracts.value = validContracts
        lastScanBlock.value = data.lastScanBlock || 0
      }

      // 加载最后扫描区块
      const lastBlock = localStorage.getItem(LAST_SCAN_BLOCK_KEY)
      if (lastBlock) {
        lastScanBlock.value = parseInt(lastBlock)
      }
    } catch (err) {
      error.value = '加载失败'
    }
  }
  
  /**
   * 导出合约数据（JSON格式）
   */
  function exportContracts(): string {
    return JSON.stringify({
      contracts: contracts.value,
      lastScanBlock: lastScanBlock.value,
      exportTime: Date.now()
    }, null, 2)
  }
  
  /**
   * 导入合约数据
   */
  function importContracts(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (data.contracts && Array.isArray(data.contracts)) {
        contracts.value = data.contracts
        lastScanBlock.value = data.lastScanBlock || 0
        saveToStorage()
        return true
      }
      return false
    } catch (err) {
      error.value = '导入失败'
      return false
    }
  }
  
  // ==================== 初始化 ====================
  
  // 从localStorage加载数据
  loadFromStorage()
  
  // ==================== 返回 ====================
  
  return {
    // 状态
    contracts,
    scanProgress,
    lastScanBlock,
    error,
    
    // 计算属性
    erc20Tokens,
    wbkcTokens,
    ammPools,
    allTokens,
    isScanning,
    scanProgressPercent,
    
    // 方法
    addContract,
    addContracts,
    updateContract,
    removeContract,
    getContractByAddress,
    getContractsByType,
    updateScanProgress,
    startScan,
    completeScan,
    clearAllContracts,
    saveToStorage,
    loadFromStorage,
    exportContracts,
    importContracts
  }
})

