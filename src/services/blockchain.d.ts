// blockchain.d.ts - blockchain.js 的类型声明文件

declare module '@/services/blockchain' {
  const blockchainService: {
    toWei(ether: string | number): string
    fromWei(weiValue: string | bigint): string
    getTokenBalance(): Promise<never>
    getWbkcBalance(): Promise<never>
    getE20cBalance(): Promise<never>
    swapAforB(): Promise<never>
    swapBforA(): Promise<never>
    getAmountBOut(): Promise<never>
    getAmountAOut(): Promise<never>
    getExchangeRate(): Promise<never>
    getPoolInfo(): Promise<never>
  }

  export default blockchainService
}

