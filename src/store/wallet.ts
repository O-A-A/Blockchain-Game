import { defineStore } from 'pinia'
import { ref } from 'vue'
import contractInteractionService from '@/services/contractInteractionService'

export interface SwapResult {
    txHash: string
    outputAmount: string
}

export const useWalletStore = defineStore('wallet', () => {
    // 状态
    const address = ref<string | null>("")
    const isLoggedIn = ref(false)
    const wbkcBalance = ref<string>('0') // wBKC余额
    const e20cBalance = ref<string>('0') // E20C余额
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const transactions = ref<Array<any>>([]) // 交易记录

    // 设置钱包地址
    const setAddress = (newAddress: string | null) => {
        address.value = newAddress;
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
            console.log(err)
        } finally {
            isLoading.value = false;
        }
    }

    // 初始化钱包
    const init = async () => {
        address.value = "";
        isLoggedIn.value = false;
    }

    // 重置钱包状态
    const resetWalletState = () => {
        setAddress(null);
        isLoggedIn.value = false;
        wbkcBalance.value = '0';
        e20cBalance.value = '0';
        isLoading.value = false;
        error.value = null;
        transactions.value = [];
        
        // 清除所有会话和持久化数据
        sessionStorage.clear();
    }

    return {
        address,
        isLoggedIn,
        wbkcBalance,
        e20cBalance,
        isLoading,
        error,
        transactions,
        refreshBalances,
        init,
        setAddress,
        setLoggedIn,
        resetWalletState
    }
})