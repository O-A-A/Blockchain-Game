// blockchain.js - 与区块链和智能合约交互的服务
import CONFIG from '@/config.js';
import blockchainMock from './blockchainMock.js';
import connectionService from './connectionService';
import { ethers } from 'ethers';

// 根据配置选择是使用Mock还是真实实现

// 以下为真实实现的代码
// Web3 utils for conversions
function toWei(ether) {
    // Convert ether (or token amount) to wei
    if (typeof ether === 'number') {
        ether = ether.toString();
    }
    // 使用ethers.js的parseEther
    return ethers.parseEther(ether).toString();
}

function fromWei(weiValue) {
    // Convert wei to ether
    // 使用ethers.js的formatEther
    if (typeof weiValue === 'string' || typeof weiValue === 'bigint') {
        return ethers.formatEther(weiValue);
    }
    return '0';
}

// Keccak-256 hash function for creating function selectors
function keccak256(message) {
    // Using window.ethereum or a crypto library would be better
    // For demonstration purposes, we're using a simplified version
    let hash = '';
    // Function selectors for our common functions
    const functionSelectors = {
        'swapAForB(uint256)': '0x73d0335f',
        'swapBForA(uint256)': '0x23373ce9',
        'getPoolInfo()': '0x6deac0f3',
        'getAmountBOut(uint256)': '0xcfb4dafb',
        'getAmountAOut(uint256)': '0x5c83925a',
        'getExchangeRate()': '0x66331bba'
    };
    
    return functionSelectors[message] || '0x00000000'; // Default fallback
}

// Function to get nonce for an address
async function getNonce(address) {
    try {
        const response = await fetch(CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getTransactionCount',
                params: [address, 'latest'],
                id: 1
            })
        });
        const data = await response.json();

        if (data.error) {
            return 0;
        }

        const nonce = data.result ? parseInt(data.result, 16) : 0;
        return isNaN(nonce) ? 0 : nonce;
    } catch (error) {
        return 0;
    }
}

// Send transaction to blockchain
async function sendTransaction(transaction) {
    try {
        // 如果提供了私钥，则直接使用eth_sendTransaction
        // 注意：在生产环境中应避免硬编码私钥
        const response = await fetch(CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_sendTransaction',
                params: [transaction],
                id: 1
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || '交易失败');
        }
        
        return data.result;
    } catch (error) {
        throw error;
    }
}

// Call a read-only contract method
async function callContractMethod(contractAddress, method, params = []) {
    // Get function selector
    const functionSelector = keccak256(method);
    
    // Encode parameters
    let encodedParams = '';
    params.forEach(param => {
        if (typeof param === 'number' || typeof param === 'bigint') {
            // Convert to hex and pad to 32 bytes
            encodedParams += BigInt(param).toString(16).padStart(64, '0');
        } else if (param.startsWith('0x')) {
            // Already hex, just pad
            encodedParams += param.slice(2).padStart(64, '0');
        }
    });
    
    // Prepare data
    const data = functionSelector + encodedParams;
    
    try {
        const response = await fetch(CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                    to: contractAddress,
                    data: data
                }, 'latest'],
                id: 1
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error.message || '合约调用失败');
        }
        
        return result.result;
    } catch (error) {
        throw error;
    }
}

const blockchainService = {
    // Convert between wei and ether
    toWei,
    fromWei,
    
    // 通用的代币余额查询方法（支持任何 ERC20/WBKC 合约）
    async getTokenBalance(userAddress, contractAddress) {
        try {
            if (!connectionService.isConnected()) {
                console.warn('未连接到区块链节点');
                return '0';
            }
            
            // 检查合约地址是否有效
            if (!contractAddress || contractAddress === '0x0' || contractAddress === '0x0000000000000000000000000000000000000000') {
                console.warn('合约地址无效');
                return '0';
            }
            
            // 使用 ERC20 标准的 balanceOf ABI
            const erc20BalanceAbi = [
                {
                    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
            
            const balance = await connectionService.callContract(
                contractAddress,
                erc20BalanceAbi,
                'balanceOf',
                userAddress
            );
            
            return balance.toString();
        } catch (error) {
            // 如果是 BAD_DATA 错误，说明合约不存在，静默处理
            if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
                console.warn(`合约 ${contractAddress} 不存在或地址无效`);
                return '0';
            }
            console.error(`获取代币余额失败 (${contractAddress}):`, error);
            return '0';
        }
    },
    
    // 保留旧方法用于向后兼容，但现在它们调用通用方法
    async getWbkcBalance(address) {
        // 已废弃：应该使用 getTokenBalance(address, contractAddress)
        console.warn('getWbkcBalance 已废弃，请使用 getTokenBalance');
        return '0';
    },
    
    async getE20cBalance(address) {
        // 已废弃：应该使用 getTokenBalance(address, contractAddress)
        console.warn('getE20cBalance 已废弃，请使用 getTokenBalance');
        return '0';
    },
    
    // AMM Contract interaction methods
    async swapAforB(amountInWei) {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            
            // E20C -> wBKC (swapAForB)
            const tx = await connectionService.sendContractTransaction(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'swapAForB',
                amountInWei
            );
            
            // 等待交易确认
            await tx.wait();
            
            return tx.hash;
        } catch (error) {
            console.error('swapAforB失败:', error);
            throw error;
        }
    },
    
    async swapBforA(amountInWei) {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            
            // wBKC -> E20C (swapBForA)
            const tx = await connectionService.sendContractTransaction(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'swapBForA',
                amountInWei
            );
            
            // 等待交易确认
            await tx.wait();
            
            return tx.hash;
        } catch (error) {
            console.error('swapBforA失败:', error);
            throw error;
        }
    },
    
    // Read-only methods
    async getAmountBOut(amountInWei) {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            const result = await connectionService.callContract(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'getAmountBOut',
                amountInWei
            );
            
            return result.toString();
        } catch (error) {
            console.error('getAmountBOut失败:', error);
            return '0';
        }
    },
    
    async getAmountAOut(amountInWei) {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            const result = await connectionService.callContract(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'getAmountAOut',
                amountInWei
            );
            
            return result.toString();
        } catch (error) {
            console.error('getAmountAOut失败:', error);
            return '0';
        }
    },
    
    async getExchangeRate() {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            const result = await connectionService.callContract(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'getExchangeRate'
            );
            
            // result应该是包含两个值的数组或对象
            return {
                rateAToB: result[0]?.toString() || '0',
                rateBToA: result[1]?.toString() || '0'
            };
        } catch (error) {
            console.error('getExchangeRate失败:', error);
            return { rateAToB: '0', rateBToA: '0' };
        }
    },
    
    async getPoolInfo() {
        try {
            if (!connectionService.isConnected()) {
                throw new Error('未连接到区块链节点');
            }
            
            const ammAbi = (await import('@/abis/amm.json')).default;
            const result = await connectionService.callContract(
                CONFIG.CONTRACTS.AMM,
                ammAbi,
                'getPoolInfo'
            );
            
            // result应该是包含四个值的数组或对象
            return {
                tokenABalance: result[0]?.toString() || '0',
                tokenBBalance: result[1]?.toString() || '0',
                totalLPSupply: result[2]?.toString() || '0',
                k: result[3]?.toString() || '0'
            };
        } catch (error) {
            console.error('获取池信息失败:', error);
            return {
                tokenABalance: '0',
                tokenBBalance: '0',
                totalLPSupply: '0',
                k: '0'
            };
        }
    }
};

// 根据配置决定导出真实实现还是Mock实现
export default CONFIG.USE_MOCK_DATA ? blockchainMock : blockchainService;