// formatters.ts - 格式化工具函数

/**
 * 格式化地址显示（显示前6位和后4位）
 * @param address 地址
 * @param prefixLength 前缀长度，默认6
 * @param suffixLength 后缀长度，默认4
 * @returns 格式化后的地址，如 "0x1234...5678"
 */
export function formatAddress(
  address: string | null | undefined,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address) return ''
  if (address.length <= prefixLength + suffixLength) return address
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}

/**
 * 格式化地址显示（显示前10位和后8位，用于详细显示）
 * @param address 地址
 * @returns 格式化后的地址
 */
export function formatAddressLong(address: string | null | undefined): string {
  return formatAddress(address, 10, 8)
}

/**
 * 格式化余额显示
 * @param balance 余额（字符串或数字）
 * @param decimals 小数位数，默认6
 * @returns 格式化后的余额字符串
 */
export function formatBalance(
  balance: string | number | bigint | null | undefined,
  decimals: number = 3
): string {
  try {
    if (!balance && balance !== 0) return '0'
    
    // 转换为字符串
    const balanceStr = typeof balance === 'bigint' 
      ? balance.toString() 
      : typeof balance === 'number' 
        ? balance.toString() 
        : balance
    
    if (!balanceStr || balanceStr === '0') return '0'
    
    // 解析为数字
    const num = parseFloat(balanceStr)

    if (num === 0) return '0'

    // 定义大数单位
    const Q = 1_000_000_000_000_000
    const T = 1_000_000_000_000
    const B = 1_000_000_000
    const M = 1_000_000

    // 格式化大数
    if (num >= Q) {
      return `${(num / Q).toFixed(decimals).replace(/\.?0+$/, '')}Q`
    }
    if (num >= T) {
      return `${(num / T).toFixed(decimals).replace(/\.?0+$/, '')}T`
    }
    if (num >= B) {
      return `${(num / B).toFixed(decimals).replace(/\.?0+$/, '')}B`
    }
    if (num >= M) {
      return `${(num / M).toFixed(decimals).replace(/\.?0+$/, '')}M`
    }

    // 如果数字太小，使用科学计数法
    if (num > 0 && num < 0.000001) {
      return num.toExponential(4)
    }

    // 保留指定位数小数，并移除尾部的0
    const fixed = num.toFixed(decimals).replace(/\.?0+$/, '')

    // 添加千分位分隔符
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return parts.join('.')
  } catch (err) {
    return '0'
  }
}

/**
 * 格式化大整数余额（不丢失精度）
 * @param balance 余额（BigInt 或字符串）
 * @param decimals 代币精度，默认18
 * @param displayDecimals 显示小数位数，默认6
 * @returns 格式化后的余额字符串
 */
export function formatBigIntBalance(
  balance: bigint | string,
  decimals: number = 18,
  displayDecimals: number = 6
): string {
  try {
    const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance
    
    if (balanceBigInt === BigInt(0)) return '0'
    
    // 转换为小数
    const divisor = BigInt(10 ** decimals)
    const quotient = balanceBigInt / divisor
    const remainder = balanceBigInt % divisor
    
    // 处理小数部分
    const remainderStr = remainder.toString().padStart(decimals, '0')
    const decimalPart = remainderStr.slice(0, displayDecimals).replace(/0+$/, '')
    
    // 组合整数和小数部分
    const integerPart = quotient.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    if (decimalPart) {
      return `${integerPart}.${decimalPart}`
    }
    
    return integerPart
  } catch (err) {
    return '0'
  }
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒或秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(timestamp: number | string | Date): string {
  try {
    let date: Date
    
    if (timestamp instanceof Date) {
      date = timestamp
    } else {
      const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
      // 判断是秒还是毫秒（如果小于13位数字，认为是秒）
      date = ts < 1000000000000 ? new Date(ts * 1000) : new Date(ts)
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      // 今天
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (diffDays === 1) {
      // 昨天
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (diffDays < 7) {
      // 一周内
      return `${diffDays}天前`
    } else {
      // 一周前
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  } catch (err) {
    return ''
  }
}

/**
 * 格式化USD价值
 * @param amount 数量
 * @param rate 汇率
 * @returns 格式化后的USD价值字符串
 */
export function formatUsdValue(amount: number | string, rate: number = 1): string {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '$0.00'
    
    const usdValue = numAmount * rate
    return `$${usdValue.toFixed(2)}`
  } catch (err) {
    return '$0.00'
  }
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间的小数或百分比数字）
 * @param decimals 小数位数，默认2
 * @returns 格式化后的百分比字符串，如 "12.34%"
 */
export function formatPercentage(value: number | string, decimals: number = 2): string {
  try {
    let num = typeof value === 'string' ? parseFloat(value) : value
    
    // 如果值在0-1之间，转换为百分比
    if (num > 0 && num <= 1) {
      num = num * 100
    }
    
    if (isNaN(num)) return '0%'
    
    return `${num.toFixed(decimals)}%`
  } catch (err) {
    return '0%'
  }
}

