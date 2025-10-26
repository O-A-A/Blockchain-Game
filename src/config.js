// DEX配置文件
// 请根据您的实际部署情况填写以下配置信息

export const CONFIG = {
    // 区块链网络配置 - 默认值，用户登录时会覆盖
    DEFAULT_RPC_URL: 'http://127.0.0.1:8545',
    
    // 注意：合约地址和详细配置应从 contractsStore 中获取
    // 完整的ABI文件位于 src/abis/ 目录下
};

// 导出配置
export default CONFIG;
