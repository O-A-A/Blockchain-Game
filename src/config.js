// DEX演示系统配置文件
// 请根据您的实际部署情况填写以下配置信息

export const CONFIG = {
    // 运行模式配置
    // true: 使用Mock数据（演示模式）
    // false: 使用真实区块链交互（生产模式）
    USE_MOCK_DATA: false,
    
    // 区块链网络配置 - 默认值，用户登录时会覆盖
    DEFAULT_RPC_URL: 'http://127.0.0.1:8545',
    
    // 合约地址配置（已废弃）
    // 注意：实际合约地址应从 contractsStore 中获取，不再使用硬编码配置
    // 用户部署合约后，合约信息会自动保存到 contractsStore
    CONTRACTS: {
        // 这些字段仅用于向后兼容，实际应用中不使用
        WBKC: '',
        E20C: '',
        AMM: ''
    },
    
    // 合约ABI (只包含需要使用的接口)
    ABIS: {
        // wBKC代币合约ABI (只保留余额查询)
        WBKC: [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ],
        
        // E20C代币合约ABI (只保留余额查询)
        E20C: [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
        ],
        
        // AMM兑换合约ABI (只保留需要使用的方法)
        AMM: [
            {
                "constant": false,
                "inputs": [{"name": "amountIn", "type": "uint256"}],
                "name": "swapAForB",
                "outputs": [{"name": "amountOut", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [{"name": "amountIn", "type": "uint256"}],
                "name": "swapBForA",
                "outputs": [{"name": "amountOut", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getPoolInfo",
                "outputs": [
                    {"name": "tokenABalance", "type": "uint256"},
                    {"name": "tokenBBalance", "type": "uint256"},
                    {"name": "totalLPSupply", "type": "uint256"},
                    {"name": "k", "type": "uint256"}
                ],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "amountAIn", "type": "uint256"}],
                "name": "getAmountBOut",
                "outputs": [{"name": "amountBOut", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "amountBIn", "type": "uint256"}],
                "name": "getAmountAOut",
                "outputs": [{"name": "amountAOut", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getExchangeRate",
                "outputs": [
                    {"name": "rateAToB", "type": "uint256"},
                    {"name": "rateBToA", "type": "uint256"}
                ],
                "type": "function"
            }
        ]
    },
    
    // 代币配置
    TOKENS: {
        WBKC: {
            symbol: 'wBKC',
            decimals: 18,
            name: 'Wrapped BKC'
        },
        E20C: {
            symbol: 'E20C',
            decimals: 18,
            name: 'E20C Token'
        }
    }
};

// 导出配置
export default CONFIG;
