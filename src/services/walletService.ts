// 钱包服务 - 使用 ethers.js 处理钱包操作
import { ethers } from 'ethers'
import storageService from './storageService'
import type { WalletInfo } from '@/types/wallet'

export const walletService = {
  /**
   * 创建新钱包
   */
  createWallet(): WalletInfo {
    try {
      const wallet = ethers.Wallet.createRandom()
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error: any) {
      throw new Error(`创建钱包失败: ${error.message}`)
    }
  },

  /**
   * 从私钥导入钱包
   */
  importFromPrivateKey(privateKey: string): WalletInfo {
    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey
      }

      const wallet = new ethers.Wallet(privateKey)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      }
    } catch (error: any) {
      throw new Error(`导入钱包失败: ${error.message}`)
    }
  },

  /**
   * 从助记词恢复钱包
   */
  recoverFromMnemonic(mnemonic: string): WalletInfo {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error: any) {
      throw new Error(`恢复钱包失败: ${error.message}`)
    }
  },

  /**
   * 加密并保存钱包（使用 ethers.js 的 Keystore 格式）
   */
  async encryptAndSave(privateKey: string, password: string): Promise<void> {
    try {
      const wallet = new ethers.Wallet(privateKey)
      
      const encryptedJson = await wallet.encrypt(password, {
        scrypt: { N: 131072 }
      })
      
      storageService.saveEncryptedKeystore(encryptedJson)
      storageService.saveWalletAddress(wallet.address)
    } catch (error: any) {
      throw new Error(`保存钱包失败: ${error.message}`)
    }
  },

  /**
   * 解锁钱包
   */
  async unlockWallet(password: string): Promise<WalletInfo | null> {
    try {
      const encryptedJson = storageService.getEncryptedKeystore()
      if (!encryptedJson) {
        return null
      }
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error: any) {
      throw new Error('密码错误或钱包数据损坏')
    }
  },

  /**
   * 创建钱包实例（连接到 provider）
   */
  createWalletInstance(privateKey: string, provider: ethers.Provider): ethers.Wallet {
    try {
      return new ethers.Wallet(privateKey, provider)
    } catch (error: any) {
      throw new Error(`创建钱包实例失败: ${error.message}`)
    }
  },

  /**
   * 检查是否有已保存的钱包
   */
  hasWallet(): boolean {
    return storageService.hasWallet()
  },

  /**
   * 验证私钥格式
   */
  isValidPrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey
      }
      new ethers.Wallet(privateKey)
      return true
    } catch {
      return false
    }
  },

  /**
   * 验证助记词格式
   */
  isValidMnemonic(mnemonic: string): boolean {
    try {
      ethers.Wallet.fromPhrase(mnemonic)
      return true
    } catch {
      return false
    }
  },

  /**
   * 验证地址格式
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address)
  },

  /**
   * 导出 Keystore 文件
   */
  exportKeystore(address: string): string | null {
    const savedAddress = storageService.getWalletAddress()
    if (savedAddress?.toLowerCase() !== address.toLowerCase()) {
      return null
    }
    return storageService.getEncryptedKeystore()
  },

  /**
   * 导入 Keystore 文件
   */
  async importKeystore(keystoreJson: string, password: string): Promise<WalletInfo> {
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password)
      storageService.saveEncryptedKeystore(keystoreJson)
      storageService.saveWalletAddress(wallet.address)
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      }
    } catch (error: any) {
      throw new Error(`导入 Keystore 失败: ${error.message}`)
    }
  },

  /**
   * 清除钱包数据
   */
  clearWallet(): void {
    storageService.clearEncryptedKeystore()
    storageService.clearWalletAddress()
  }
}

export default walletService


