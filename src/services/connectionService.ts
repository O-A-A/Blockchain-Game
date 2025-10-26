// connectionService.ts - 管理区块链节点连接
import { ethers } from 'ethers'

/**
 * 区块链连接服务
 * 管理节点URL、provider和wallet实例
 */
class ConnectionService {
    private provider: ethers.JsonRpcProvider | null = null
    private wallet: ethers.Wallet | null = null
    private nodeUrl: string = ''
    private privateKey: string = ''

    /**
     * 连接到节点
     * @param nodeUrl 节点RPC地址
     * @param privateKey 私钥
     */
    async connect(nodeUrl: string, privateKey: string): Promise<void> {
        try {
            // 创建provider
            this.provider = new ethers.JsonRpcProvider(nodeUrl)
            
            // 测试连接
            await this.provider.getBlockNumber()
            
            // 创建wallet
            this.wallet = new ethers.Wallet(privateKey, this.provider)
            
            // 保存连接信息
            this.nodeUrl = nodeUrl
            this.privateKey = privateKey
            
            console.log('成功连接到节点:', nodeUrl)
            console.log('钱包地址:', this.wallet.address)
        } catch (error) {
            this.provider = null
            this.wallet = null
            throw new Error(`连接节点失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this.provider = null
        this.wallet = null
        this.nodeUrl = ''
        this.privateKey = ''
        
        // 清除会话存储
        sessionStorage.removeItem('currentNodeUrl')
        sessionStorage.removeItem('currentPrivateKey')
        sessionStorage.removeItem('currentAddress')
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.provider !== null && this.wallet !== null
    }

    /**
     * 获取Provider实例
     */
    getProvider(): ethers.JsonRpcProvider {
        if (!this.provider) {
            throw new Error('未连接到节点，请先调用connect()')
        }
        return this.provider
    }

    /**
     * 获取Wallet实例
     */
    getWallet(): ethers.Wallet {
        if (!this.wallet) {
            throw new Error('钱包未初始化，请先调用connect()')
        }
        return this.wallet
    }

    /**
     * 获取当前节点URL
     */
    getNodeUrl(): string {
        return this.nodeUrl
    }

    /**
     * 获取当前钱包地址
     */
    getAddress(): string {
        return this.wallet?.address || ''
    }

    /**
     * 从会话存储恢复连接
     */
    async restoreFromSession(): Promise<boolean> {
        try {
            // 如果已经连接，直接返回true
            if (this.isConnected()) {
                return true
            }
            
            const savedNodeUrl = sessionStorage.getItem('currentNodeUrl')
            const savedPrivateKey = sessionStorage.getItem('currentPrivateKey')
            
            if (savedNodeUrl && savedPrivateKey) {
                await this.connect(savedNodeUrl, savedPrivateKey)
                return true
            }
            return false
        } catch (error) {
            console.error('从会话恢复连接失败:', error)
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
            throw new Error('未连接到区块链节点，请重新登录')
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
     * 获取账户余额（ETH）
     */
    async getBalance(address?: string): Promise<string> {
        const provider = this.getProvider()
        const addr = address || this.getAddress()
        const balance = await provider.getBalance(addr)
        return ethers.formatEther(balance)
    }

    /**
     * 发送交易
     */
    async sendTransaction(to: string, value: string): Promise<ethers.TransactionResponse> {
        const wallet = this.getWallet()
        const tx = {
            to,
            value: ethers.parseEther(value)
        }
        return await wallet.sendTransaction(tx)
    }

    /**
     * 创建合约实例
     */
    getContract(address: string, abi: any): ethers.Contract {
        const wallet = this.getWallet()
        return new ethers.Contract(address, abi, wallet)
    }

    /**
     * 调用合约只读方法
     */
    async callContract(address: string, abi: any, method: string, ...params: any[]): Promise<any> {
        const contract = this.getContract(address, abi)
        return await contract[method](...params)
    }

    /**
     * 发送合约交易
     */
    async sendContractTransaction(
        address: string, 
        abi: any, 
        method: string, 
        ...params: any[]
    ): Promise<ethers.TransactionResponse> {
        const contract = this.getContract(address, abi)
        return await contract[method](...params)
    }
}

// 导出单例实例
export const connectionService = new ConnectionService()
export default connectionService

