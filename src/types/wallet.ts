// 钱包相关类型定义

export interface WalletInfo {
  address: string
  privateKey: string
  mnemonic?: string
}

export interface StorageKeys {
  ENCRYPTED_KEYSTORE: string
  WALLET_ADDRESS: string
}
