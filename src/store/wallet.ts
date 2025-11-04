import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import contractInteractionService from '@/services/contractInteractionService'

export interface SwapResult {
    txHash: string
    outputAmount: string
}

export const useWalletStore = defineStore('wallet', () => {
    // 状态
    const address = ref<string | null>(localStorage.getItem('walletAddress')) // 从本地存储初始化地址
    const isLoggedIn = ref<boolean>(!!localStorage.getItem('walletAddress')) // 根据本地存储判断初始登录状态
    const wbkcBalance = ref<string>('0') // wBKC余额
    const e20cBalance = ref<string>('0') // E20C余额
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const transactions = ref<Array<any>>([]) // 交易记录
    
    // 计算属性
    const usdValue = computed(() => {
        try {
            // wBKC 到 USD 的汇率：1 wBKC = 0.1 USD
            if (!address.value) return '0.00';
            const balanceNum = parseFloat(wbkcBalance.value);
            if (isNaN(balanceNum)) return '0.00';
            return (balanceNum * 0.1).toFixed(2)
        } catch {
            return '0.00'
        }
    })

    // 设置钱包地址
    const setAddress = (newAddress: string | null) => {
        address.value = newAddress;
        if (newAddress) {
            localStorage.setItem('walletAddress', newAddress);
        } else {
            localStorage.removeItem('walletAddress');
        }
        isLoggedIn.value = !!newAddress; // 地址存在即视为登录
    }

    // 设置登录状态
    const setLoggedIn = (loggedIn: boolean) => {
        isLoggedIn.value = loggedIn;
        // 如果设置为未登录，同时清除地址
        if (!loggedIn) {
            setAddress(null);
        }
    }

    // 刷新余额 - 使用blockchain.js
    const refreshBalances = async () => {
        if (!isLoggedIn.value || !address.value) {
            // 未登录时清空余额显示
            wbkcBalance.value = '0';
            e20cBalance.value = '0';
            return;
        }

        isLoading.value = true;
        error.value = null;

        try {
            // 从 contractsStore 获取已部署的合约
            const { useContractsStore } = await import('@/store/contracts');
            const contractsStore = useContractsStore();
            
            // 获取第一个 WBKC 和 ERC20 合约（如果有的话）
            const wbkcToken = contractsStore.wbkcTokens[0];
            const erc20Token = contractsStore.erc20Tokens[0];
            
            // 只查询已部署的合约余额
            let wbkcResult = '0';
            let e20cResult = '0';
            
            if (wbkcToken) {
                wbkcResult = await contractInteractionService.getERC20Balance(wbkcToken.address, address.value);
            }
            
            if (erc20Token) {
                e20cResult = await contractInteractionService.getERC20Balance(erc20Token.address, address.value);
            }

            // 直接使用原始余额值，不进行任何转换
            wbkcBalance.value = wbkcResult;
            e20cBalance.value = e20cResult;
            
        } catch (err: any) {
            error.value = '获取余额失败，请稍后再试';
        } finally {
            isLoading.value = false;
        }
    }

    // 获取预计兑换金额
    const getEstimatedOutput = async (fromCurrency: string, amount: string) => {
        if (!amount || parseFloat(amount) <= 0) return '0';
        
        try {
            // 从 contractsStore 获取第一个 AMM 池
            const { useContractsStore } = await import('@/store/contracts');
            const contractsStore = useContractsStore();
            const ammPool = contractsStore.ammPools[0];
            
            if (!ammPool) {
                return '0';
            }
            
            // 直接使用原始数值，但修正代币映射关系
            let outputAmount;
            
            if (fromCurrency === 'wBKC') {
                // wBKC对应代币B，调用getAmountAOut
                outputAmount = await contractInteractionService.callViewFunction({
                    address: ammPool.address,
                    abi: contractInteractionService.getAbi('amm'),
                    functionName: 'getAmountAOut',
                    args: [amount]
                });
            } else {
                // E20C对应代币A，调用getAmountBOut
                outputAmount = await contractInteractionService.callViewFunction({
                    address: ammPool.address,
                    abi: contractInteractionService.getAbi('amm'),
                    functionName: 'getAmountBOut',
                    args: [amount]
                });
            }
            
            // 不进行fromWei转换，直接返回原始输出量
            return outputAmount.toString();
        } catch (err) {
            return '0';
        }
    }

    // 获取当前汇率
    const getCurrentRates = async () => {
        try {
            // 从 contractsStore 获取第一个 AMM 池
            const { useContractsStore } = await import('@/store/contracts');
            const contractsStore = useContractsStore();
            const ammPool = contractsStore.ammPools[0];
            
            if (!ammPool) {
                return {
                    wbkcToE20c: '0.5',
                    e20cToWbkc: '2',
                    rateAToB: '2',
                    rateBToA: '0.5'
                };
            }
            
            // 获取池子信息来计算汇率
            const poolInfo = await contractInteractionService.getAMMInfo(ammPool.address);
            
            // 计算汇率: rateAToB = reserveB / reserveA, rateBToA = reserveA / reserveB
            const reserveA = parseFloat(poolInfo.reserveA);
            const reserveB = parseFloat(poolInfo.reserveB);
            
            const rateAToB = reserveA > 0 ? (reserveB / reserveA).toFixed(4) : '2';
            const rateBToA = reserveB > 0 ? (reserveA / reserveB).toFixed(4) : '0.5';
            
            return {
                // 修正映射关系：wBKC对应B，E20C对应A
                wbkcToE20c: rateBToA,  // B→A: wBKC→E20C
                e20cToWbkc: rateAToB,  // A→B: E20C→wBKC
                rateAToB: rateAToB,    // 保留原字段，表示A→B (E20C→wBKC)
                rateBToA: rateBToA     // 保留原字段，表示B→A (wBKC→E20C)
            };
        } catch (err) {
            return {
                wbkcToE20c: '0.5',
                e20cToWbkc: '2',
                rateAToB: '2',
                rateBToA: '0.5'
            };
        }
    }

    // 获取两种代币之间的汇率 (为了兼容SwapView)
    const getExchangeRate = async (fromCurrency: string, toCurrency: string) => {
        try {
            const rates = await getCurrentRates()
            
            if (fromCurrency === 'wBKC' && toCurrency === 'E20C') {
                // wBKC -> E20C, 使用rates.wbkcToE20c
                const rate = rates.wbkcToE20c
                // 现在汇率是简单的数字字符串
                if (typeof rate === 'string') {
                    return parseFloat(rate).toFixed(2)
                }
                return '0.50' // 默认值：1 wBKC = 0.5 E20C
            } else if (fromCurrency === 'E20C' && toCurrency === 'wBKC') {
                // E20C -> wBKC, 使用rates.e20cToWbkc  
                const rate = rates.e20cToWbkc
                // 现在汇率是简单的数字字符串
                if (typeof rate === 'string') {
                    return parseFloat(rate).toFixed(2)
                }
                return '2.00' // 默认值：1 E20C = 2 wBKC
            }
            
            return '1.00' // 默认汇率
        } catch (error) {
            // 返回默认汇率
            if (fromCurrency === 'wBKC' && toCurrency === 'E20C') {
                return '0.50'
            } else if (fromCurrency === 'E20C' && toCurrency === 'wBKC') {
                return '2.00'
            }
            return '1.00'
        }
    }

    // 初始化钱包
    const init = async () => {
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
            address.value = storedAddress;
            isLoggedIn.value = true;
            
            // 恢复交易记录
            loadTransactionsFromStorage();
            
            // 刷新余额（需要先连接到区块链）
            await refreshBalances();
        } else {
            address.value = null;
            isLoggedIn.value = false;
        }
    }
    
    // 从localStorage加载交易记录
    const loadTransactionsFromStorage = () => {
        try {
            const savedTxs = localStorage.getItem(`transactions_${address.value}`);
            if (savedTxs) {
                transactions.value = JSON.parse(savedTxs);
            }
        } catch (error) {
            // 加载失败，忽略
        }
    }
    
    // 保存交易记录到localStorage
    const saveTransactionsToStorage = () => {
        try {
            if (address.value) {
                localStorage.setItem(`transactions_${address.value}`, JSON.stringify(transactions.value));
            }
        } catch (error) {
            // 保存失败，忽略
        }
    }

    // 重置钱包状态
    const resetWalletState = () => {
        // 清除当前地址的交易记录
        if (address.value) {
            localStorage.removeItem(`transactions_${address.value}`);
        }
        
        setAddress(null);
        isLoggedIn.value = false;
        wbkcBalance.value = '0';
        e20cBalance.value = '0';
        isLoading.value = false;
        error.value = null;
        transactions.value = [];
        
        // 清除所有会话和持久化数据
        sessionStorage.clear();
        localStorage.removeItem('walletPassword');
        localStorage.removeItem('nodeUrl');
        localStorage.removeItem('encryptedPrivateKey');
        localStorage.removeItem('walletAddress');
    }

    return {
        address,
        isLoggedIn,
        wbkcBalance,
        e20cBalance,
        isLoading,
        error,
        transactions,
        usdValue,
        refreshBalances,
        getEstimatedOutput,
        getCurrentRates,
        getExchangeRate,
        init,
        setAddress,
        setLoggedIn,
        resetWalletState
    }
})