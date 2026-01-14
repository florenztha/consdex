export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: '0x10B',
  name: 'Neura Testnet',
  rpcUrl: 'https://testnet.rpc.neuraprotocol.io/',
  blockExplorer: 'https://testnet-blockscout.infra.neuraprotocol.io/',
  currency: {
    name: 'ANKR',
    symbol: 'ANKR',
    decimals: 18,
  },
}

export const CONTRACTS = {
  SWAP_ROUTER: '0x6836F8A9a66ab8430224aa9b4E6D24dc8d7d5d77',
  FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // UniswapV2 Factory pattern
  ztUSD: '0x9423c6C914857e6DaAACe3b585f4640231505128',
  USDT: '0x3A631ee99eF7fE2D248116982b14e7615ac77502',
  wANKR: '0x422F5Eae5fEE2D248116982b14e7615ac77502',
  CONS: '0x0000000000000000000000000000000000000001', // Constellation Token (to be deployed)
  MASTER_CHEF: '0x0000000000000000000000000000000000000002', // MasterChef (to be deployed)
  TOKEN_FACTORY: '0x0000000000000000000000000000000000000003', // Token Factory (to be deployed)
}

export const ZODIAC_TOKENS = [
  { symbol: 'ARIES', name: 'Aries Token', icon: '♈', color: '#ef4444' },
  { symbol: 'TAURUS', name: 'Taurus Token', icon: '♉', color: '#84cc16' },
  { symbol: 'GEMINI', name: 'Gemini Token', icon: '♊', color: '#f59e0b' },
  { symbol: 'CANCER', name: 'Cancer Token', icon: '♋', color: '#06b6d4' },
  { symbol: 'LEO', name: 'Leo Token', icon: '♌', color: '#f97316' },
  { symbol: 'VIRGO', name: 'Virgo Token', icon: '♍', color: '#8b5cf6' },
  { symbol: 'LIBRA', name: 'Libra Token', icon: '♎', color: '#ec4899' },
  { symbol: 'SCORPIO', name: 'Scorpio Token', icon: '♏', color: '#dc2626' },
  { symbol: 'SAGITTARIUS', name: 'Sagittarius Token', icon: '♐', color: '#9333ea' },
  { symbol: 'CAPRICORN', name: 'Capricorn Token', icon: '♑', color: '#475569' },
  { symbol: 'AQUARIUS', name: 'Aquarius Token', icon: '♒', color: '#0ea5e9' },
  { symbol: 'PISCES', name: 'Pisces Token', icon: '♓', color: '#14b8a6' },
]

export const DEFAULT_TOKENS = [
  {
    address: 'native',
    symbol: 'ANKR',
    name: 'ANKR',
    decimals: 18,
    logo: null,
    isNative: true,
  },
  {
    address: CONTRACTS.wANKR,
    symbol: 'wANKR',
    name: 'Wrapped ANKR',
    decimals: 18,
    logo: null,
  },
  {
    address: CONTRACTS.ztUSD,
    symbol: 'ztUSD',
    name: 'ztUSD Stablecoin',
    decimals: 18,
    logo: null,
  },
  {
    address: CONTRACTS.USDT,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    logo: null,
  },
]

export const FAUCET_DAILY_LIMIT = 500
export const ZODIAC_TOTAL_SUPPLY = 21000000
