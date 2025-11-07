// connectionService.ts - 管理区块链节点连接
import { ethers, type BrowserProvider, type JsonRpcSigner } from 'ethers'

/**
 * 区块链连接服务
 * 管理与浏览器钱包（如MetaMask）的连接
 */
class ConnectionService {
  private provider: BrowserProvider | null = null
  private signer: JsonRpcSigner | null = null
  private account: string | null = null

  constructor() {
    // 监听账户变化
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.handleAccountsChanged(accounts)
        } else {
          // 用户断开连接
          this.disconnect()
        }
      })
    }
  }

  private async handleAccountsChanged(accounts: string[]) {
    this.account = accounts[0]
    if (this.provider) {
      this.signer = await this.provider.getSigner()
    }
    // 可以选择性地发出事件，通知应用账户已更改
    console.log('钱包地址已切换:', this.account)
    // 更新本地存储
    sessionStorage.setItem('currentAddress', this.account)
    // 刷新页面以重新加载状态
    window.location.reload()
  }

  /**
   * 连接到浏览器钱包
   */
  async connect(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('未检测到MetaMask，请安装MetaMask插件')
    }

    try {
      // 创建provider
      this.provider = new ethers.BrowserProvider(window.ethereum)

      // 请求用户授权
      const accounts = await this.provider.send('eth_requestAccounts', [])
      if (accounts.length === 0) {
        throw new Error('用户拒绝了连接请求')
      }
      this.account = accounts[0]

      // 获取signer
      this.signer = await this.provider.getSigner()

      console.log('成功连接到MetaMask')
      console.log('钱包地址:', this.account)

      // 保存连接状态
      if (this.account) {
        sessionStorage.setItem('currentAddress', this.account)
      }
    } catch (error) {
      this.disconnect()
      throw new Error(`连接钱包失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.provider = null
    this.signer = null
    this.account = null

    // 清除会话存储
    sessionStorage.removeItem('currentAddress')
    console.log('已断开连接')
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.provider !== null && this.signer !== null && this.account !== null
  }

  /**
   * 获取Provider实例
   */
  getProvider(): BrowserProvider {
    if (!this.provider) {
      throw new Error('未连接到钱包，请先调用connect()')
    }
    return this.provider
  }

  /**
   * 获取Signer实例 (替代旧的getWallet)
   */
  getSigner(): JsonRpcSigner {
    if (!this.signer) {
      throw new Error('钱包未初始化或未连接，请先调用connect()')
    }
    return this.signer
  }

  /**
   * 获取当前钱包地址
   */
  getAddress(): string {
    return this.account || ''
  }

  /**
   * 从会话存储恢复连接
   */
  async restoreFromSession(): Promise<boolean> {
    if (this.isConnected()) {
      return true
    }

    if (typeof window.ethereum === 'undefined') {
      return false
    }

    try {
      const savedAddress = sessionStorage.getItem('currentAddress')
      if (!savedAddress) {
        return false
      }

      this.provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await this.provider.listAccounts()

      // 检查已保存的地址是否仍在MetaMask的账户列表中
      const accountIsConnected = accounts.some(
        (acc) => acc.address.toLowerCase() === savedAddress.toLowerCase()
      )

      if (accountIsConnected) {
        this.account = savedAddress
        this.signer = await this.provider.getSigner()
        console.log('从会话恢复连接成功:', this.account)
        return true
      } else {
        this.disconnect()
        return false
      }
    } catch (error) {
      console.error('从会话恢复连接失败:', error)
      this.disconnect()
      return false
    }
  }

  /**
   * 确保连接可用（如果未连接则尝试恢复）
   */
  async ensureConnected(): Promise<void> {
    if (this.isConnected()) {
      return
    }

    const restored = await this.restoreFromSession()
    if (!restored) {
      // 如果无法从会话恢复，可以尝试发起新的连接请求
      // 或者抛出错误，让UI引导用户点击“连接钱包”
      await this.connect()
      if (!this.isConnected()) {
        throw new Error('未连接到钱包，请连接您的MetaMask钱包')
      }
    }
  }

  /**
   * 获取区块号
   */
  async getBlockNumber(): Promise<number> {
    const provider = this.getProvider()
    return await provider.getBlockNumber()
  }

  /**
   * 获取当前连接钱包的余额（以 Ether 为单位的字符串）
   *
   * 返回值：例如 "0.1234"（单位：ether）
   */
  async getBalance(): Promise<string> {
    const provider = this.getProvider()

    const address = this.account

    if (address === null) {
      return "0"
    }

    // 获取余额（返回 bigint）
    const balance = await provider.getBalance(address)

    // 将余额格式化为 ether 单位的字符串
    try {
      return ethers.formatEther(balance)
    } catch (e) {
      return "0"
    }
  }
}

// 导出单例实例
export const connectionService = new ConnectionService()
export default connectionService

