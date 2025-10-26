// 存储服务 - 封装 localStorage 操作
class StorageService {
  private ENCRYPTED_KEYSTORE_KEY = 'encryptedKeystore'
  private WALLET_ADDRESS_KEY = 'walletAddress'

  /**
   * 保存加密的 Keystore
   */
  saveEncryptedKeystore(keystoreJson: string): void {
    localStorage.setItem(this.ENCRYPTED_KEYSTORE_KEY, keystoreJson)
  }

  /**
   * 获取加密的 Keystore
   */
  getEncryptedKeystore(): string | null {
    return localStorage.getItem(this.ENCRYPTED_KEYSTORE_KEY)
  }

  /**
   * 清除加密的 Keystore
   */
  clearEncryptedKeystore(): void {
    localStorage.removeItem(this.ENCRYPTED_KEYSTORE_KEY)
  }

  /**
   * 保存钱包地址
   */
  saveWalletAddress(address: string): void {
    localStorage.setItem(this.WALLET_ADDRESS_KEY, address)
  }

  /**
   * 获取钱包地址
   */
  getWalletAddress(): string | null {
    return localStorage.getItem(this.WALLET_ADDRESS_KEY)
  }

  /**
   * 清除钱包地址
   */
  clearWalletAddress(): void {
    localStorage.removeItem(this.WALLET_ADDRESS_KEY)
  }

  /**
   * 检查是否有已保存的钱包
   */
  hasWallet(): boolean {
    return !!this.getWalletAddress() && !!this.getEncryptedKeystore()
  }
}

export const storageService = new StorageService()
export default storageService
