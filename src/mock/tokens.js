// Mock 代币数据 - 模拟真实链上的代币信息
export const TOKENS_DATA = {
  // ERC20 标准代币
  erc20: [
    {
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'ERC20',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      issuer: '0x28c6c06298d161e0db32600b8e0faf8d7c9f0a7c',
      totalSupply: '30,000,000,000',
      decimals: 6,
      color: 'blue-lighten-1'
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      type: 'ERC20',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      issuer: '0xc6cde7c39eb2f0361c0d4da0f0b87f8cc2df0ee0',
      totalSupply: '113,000,000,000',
      decimals: 6,
      color: 'green'
    },
    {
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      type: 'ERC20',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      issuer: '0x19095cb87e0c879e5324cfedb903c44a8d00cbf8',
      totalSupply: '5,000,000,000',
      decimals: 18,
      color: 'orange'
    },
    {
      name: 'Chainlink',
      symbol: 'LINK',
      type: 'ERC20',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      issuer: '0x12d66f87a04a9e220ce0b6991e216a8073cfd44b',
      totalSupply: '1,000,000,000',
      decimals: 18,
      color: 'blue'
    },
    {
      name: 'Uniswap',
      symbol: 'UNI',
      type: 'ERC20',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      issuer: '0xdc6ff44d5d932cbd77b52e5612ba0ce37f9f63ef',
      totalSupply: '1,000,000,000',
      decimals: 18,
      color: 'pink'
    },
    {
      name: 'Aave',
      symbol: 'AAVE',
      type: 'ERC20',
      address: '0x7Fc66500c84A76Ad7e9c93437E50b11A3E173A8c',
      issuer: '0xee56e2b3d491590b5b8104686b9b8121322d5dd7',
      totalSupply: '16,000,000',
      decimals: 18,
      color: 'purple'
    },
    {
      name: 'Curve DAO',
      symbol: 'CRV',
      type: 'ERC20',
      address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      issuer: '0xef1344de02512cee5908f0ca4f98a337c1b2b0e1',
      totalSupply: '3,030,000,000',
      decimals: 18,
      color: 'red'
    },
    {
      name: 'Sushiswap',
      symbol: 'SUSHI',
      type: 'ERC20',
      address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fe2',
      issuer: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
      totalSupply: '250,000,000',
      decimals: 18,
      color: 'red-lighten-2'
    },
    {
      name: 'Maker',
      symbol: 'MKR',
      type: 'ERC20',
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      issuer: '0xdbf469340e1a7b5dcc00a2ac6c2eef9e6c50a53f',
      totalSupply: '1,005,577',
      decimals: 18,
      color: 'teal'
    },
    {
      name: 'ApeCoin',
      symbol: 'APE',
      type: 'ERC20',
      address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      issuer: '0x2fc93484614a6b266d12e2e87757e38271b1b189',
      totalSupply: '1,000,000,000',
      decimals: 18,
      color: 'amber'
    },
    {
      name: 'Arbitrum',
      symbol: 'ARB',
      type: 'ERC20',
      address: '0xB50721BCF8d664c30412Cfbc6cf7a15145234ad1',
      issuer: '0x28d77e1e18d8b8de0a5cbfbdbf0c9e2a5b5e45ab',
      totalSupply: '10,000,000,000',
      decimals: 18,
      color: 'cyan'
    },
    {
      name: 'Optimism',
      symbol: 'OP',
      type: 'ERC20',
      address: '0x4200000000000000000000000000000000000042',
      issuer: '0xab4c122a6cdef9dba63a6eb60aac2d1459c3310a',
      totalSupply: '4,294,967,296',
      decimals: 18,
      color: 'red'
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      type: 'ERC20',
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      issuer: '0xaf2353f3c9bda60b46e4cfeb6819ccb3a0ffc5ec',
      totalSupply: '10,000,000,000',
      decimals: 18,
      color: 'purple-lighten-1'
    },
  ],

  // Wrapped 代币
  wrapped: [
    {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      type: 'Wrapped',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      issuer: '0x0000000000000000000000000000000000000000',
      totalSupply: 'N/A',
      decimals: 18,
      color: 'grey-darken-1',
      baseToken: 'ETH'
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      type: 'Wrapped',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      issuer: '0x0000000000000000000000000000000000000000',
      totalSupply: 'N/A',
      decimals: 8,
      color: 'orange-darken-2',
      baseToken: 'BTC'
    },
    {
      name: 'Wrapped BKC',
      symbol: 'WBKC',
      type: 'Wrapped',
      address: '0x605Ea3f67d09bdFf604c7B0d9FE8A477cdF831fb',
      issuer: '0x0000000000000000000000000000000000000000',
      totalSupply: 'N/A',
      decimals: 18,
      color: 'blue-darken-1',
      baseToken: 'BKC'
    },
    {
      name: 'Wrapped Arbitrum',
      symbol: 'WARB',
      type: 'Wrapped',
      address: '0xe12551Cb9E03B1c20D944943C82fB52A07302E30',
      issuer: '0x0000000000000000000000000000000000000000',
      totalSupply: 'N/A',
      decimals: 18,
      color: 'cyan-darken-1',
      baseToken: 'ARB'
    },
    {
      name: 'Wrapped USDC',
      symbol: 'WUSDC',
      type: 'Wrapped',
      address: '0x06Ef0CA337f1920264C1D98C5c1E36A7D33e84da',
      issuer: '0x0000000000000000000000000000000000000000',
      totalSupply: 'N/A',
      decimals: 6,
      color: 'blue-lighten-1',
      baseToken: 'USDC'
    },
  ]
};

// 合并所有代币
export const ALL_TOKENS = [
  ...TOKENS_DATA.erc20,
  ...TOKENS_DATA.wrapped
];

// 根据地址查找代币
export const getTokenByAddress = (address) => {
  return ALL_TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase());
};

// 根据符号查找代币
export const getTokenBySymbol = (symbol) => {
  return ALL_TOKENS.find(token => token.symbol.toUpperCase() === symbol.toUpperCase());
};
