// Mock 流动性池数据 - 模拟真实的 AMM 流动性池
export const POOLS_DATA = [
  {
    id: 'pool_1',
    name: 'USDC-ETH Pool',
    address: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
    token0: {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '1,500,000.00',
    reserve1: '750.00',
    totalSupply: '33,541.89',
    lpProvider: '0x28c6c06298d161e0db32600b8e0faf8d7c9f0a7c',
    fee: '0.3%',
    k: '1,125,000,000',
    price: '2,000.00',
    volume24h: '45,600,000',
    apr: '12.5%'
  },
  {
    id: 'pool_2',
    name: 'DAI-USDC Pool',
    address: '0xa63b815eafc4f7d0ca4f7f8b9c5b5e5c5b5e5c5b',
    token0: {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18
    },
    token1: {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6
    },
    reserve0: '2,000,000.00',
    reserve1: '2,000,000.00',
    totalSupply: '2,000,000.00',
    lpProvider: '0x19095cb87e0c879e5324cfedb903c44a8d00cbf8',
    fee: '0.01%',
    k: '4,000,000,000,000',
    price: '1.00',
    volume24h: '80,000,000',
    apr: '8.2%'
  },
  {
    id: 'pool_3',
    name: 'UNI-ETH Pool',
    address: '0xb4e16d0168e52d7ea20be61de28030bc4e8c66f3',
    token0: {
      symbol: 'UNI',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '5,000,000.00',
    reserve1: '2,500.00',
    totalSupply: '111,803.43',
    lpProvider: '0xdc6ff44d5d932cbd77b52e5612ba0ce37f9f63ef',
    fee: '0.3%',
    k: '12,500,000,000',
    price: '2,000.00',
    volume24h: '25,300,000',
    apr: '15.8%'
  },
  {
    id: 'pool_4',
    name: 'LINK-ETH Pool',
    address: '0xa6cc3c2531fdaab46d8e4f0e6b0f0c0d0e0f0a0b',
    token0: {
      symbol: 'LINK',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '1,200,000.00',
    reserve1: '800.00',
    totalSupply: '30,983.87',
    lpProvider: '0x12d66f87a04a9e220ce0b6991e216a8073cfd44b',
    fee: '0.3%',
    k: '960,000,000',
    price: '1,500.00',
    volume24h: '18,900,000',
    apr: '14.2%'
  },
  {
    id: 'pool_5',
    name: 'AAVE-ETH Pool',
    address: '0xcda51fdef9f4e7ffa1e3e37e4c0e7d0e0f0a0c0b',
    token0: {
      symbol: 'AAVE',
      address: '0x7Fc66500c84A76Ad7e9c93437E50b11A3E173A8c',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '450,000.00',
    reserve1: '300.00',
    totalSupply: '11,618.95',
    lpProvider: '0xee56e2b3d491590b5b8104686b9b8121322d5dd7',
    fee: '0.3%',
    k: '135,000,000',
    price: '1,500.00',
    volume24h: '12,400,000',
    apr: '13.5%'
  },
  {
    id: 'pool_6',
    name: 'USDT-ETH Pool',
    address: '0x0d4a11d5efac1f0b0b0e0f0a0c0d0e0f0a0c0d0e',
    token0: {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '1,800,000.00',
    reserve1: '900.00',
    totalSupply: '40,250.31',
    lpProvider: '0xc6cde7c39eb2f0361c0d4da0f0b87f8cc2df0ee0',
    fee: '0.3%',
    k: '1,620,000,000',
    price: '2,000.00',
    volume24h: '52,100,000',
    apr: '11.8%'
  },
  {
    id: 'pool_7',
    name: 'CRV-ETH Pool',
    address: '0x1efefbda8b7ea5bfb91bdb9d2d2f0c0e0f0a0b0c',
    token0: {
      symbol: 'CRV',
      address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '8,000,000.00',
    reserve1: '2,000.00',
    totalSupply: '126,491.11',
    lpProvider: '0xef1344de02512cee5908f0ca4f98a337c1b2b0e1',
    fee: '0.3%',
    k: '16,000,000,000',
    price: '4,000.00',
    volume24h: '9,800,000',
    apr: '10.2%'
  },
  {
    id: 'pool_8',
    name: 'SUSHI-ETH Pool',
    address: '0x2f2efab5faa4e2f0e0f0a0b0c0d0e0f0a0b0c0d0e',
    token0: {
      symbol: 'SUSHI',
      address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fe2',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '3,500,000.00',
    reserve1: '1,750.00',
    totalSupply: '78,369.16',
    lpProvider: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
    fee: '0.3%',
    k: '6,125,000,000',
    price: '2,000.00',
    volume24h: '7,600,000',
    apr: '16.1%'
  },
  {
    id: 'pool_9',
    name: 'MKR-ETH Pool',
    address: '0x3f3efab5faa4e2f0e0f0a0b0c0d0e0f0a0b0c0d0e',
    token0: {
      symbol: 'MKR',
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '850,000.00',
    reserve1: '425.00',
    totalSupply: '18,998.33',
    lpProvider: '0xdbf469340e1a7b5dcc00a2ac6c2eef9e6c50a53f',
    fee: '0.3%',
    k: '361,250,000',
    price: '2,000.00',
    volume24h: '3,200,000',
    apr: '19.3%'
  },
  {
    id: 'pool_10',
    name: 'USDC-USDT Pool',
    address: '0x4f4efab5faa4e2f0e0f0a0b0c0d0e0f0a0b0c0d0e',
    token0: {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6
    },
    token1: {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6
    },
    reserve0: '5,000,000.00',
    reserve1: '5,000,000.00',
    totalSupply: '5,000,000.00',
    lpProvider: '0xc6cde7c39eb2f0361c0d4da0f0b87f8cc2df0ee0',
    fee: '0.01%',
    k: '25,000,000,000,000',
    price: '1.00',
    volume24h: '125,000,000',
    apr: '7.1%'
  },
  {
    id: 'pool_11',
    name: 'WBKC-WETH Pool',
    address: '0x605Ea3f67d09bdFf604c7B0d9FE8A477cdF831fb',
    token0: {
      symbol: 'WBKC',
      address: '0x605Ea3f67d09bdFf604c7B0d9FE8A477cdF831fb',
      decimals: 18
    },
    token1: {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18
    },
    reserve0: '2,000,000.00',
    reserve1: '500.00',
    totalSupply: '31,622.77',
    lpProvider: '0x76270242b5E3Ec5282e293e645026d409bCdc019',
    fee: '0.3%',
    k: '1,000,000,000',
    price: '4,000.00',
    volume24h: '5,200,000',
    apr: '18.7%'
  }
];

// 根据地址查找池子
export const getPoolByAddress = (address) => {
  return POOLS_DATA.find(pool => pool.address.toLowerCase() === address.toLowerCase());
};

// 根据交易对查找池子
export const getPoolByTokenPair = (token0, token1) => {
  return POOLS_DATA.find(pool => 
    (pool.token0.symbol === token0 && pool.token1.symbol === token1) ||
    (pool.token0.symbol === token1 && pool.token1.symbol === token0)
  );
};

// 获取包含特定代币的所有池子
export const getPoolsByToken = (tokenSymbol) => {
  return POOLS_DATA.filter(pool =>
    pool.token0.symbol === tokenSymbol || pool.token1.symbol === tokenSymbol
  );
};
