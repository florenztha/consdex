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
  CONS: '0xaf81C23Fa79c2c18b8B7040Ad504c5d805b76D39',
  FACTORY: '0x17Dce18f059a9Eb5bcf12EFC0Ac93c397dBda5Ad',
  ROUTER: '0x2B2fDbd1246fc9c3c2C82C4b4631d0E3d304cBCE',
  MASTER_CHEF: '0x2064D57ac8CFB9E401906c3aaaf64AF58F247306',
  FAUCET: '0xd77E4AcE4ef32e635deA0ffe6D325875DCdC4c00',
  ZODIAC_TOKENS: {
    ARIES: '0x4F6A1cD449200a52B211efC9dc039d31c61A5d63',
    TAURUS: '0x341102Db4535042d57C7BE39386312E9aeD0a978',
    GEMINI: '0xCA9f0b7487C00457d7370CcB4eB1934dB7CF65cA',
    CANCER: '0x652091155c6eB5Bc62C70538B112B71A63732B74',
    LEO: '0xA717a156CDfC293De1ec9e6EfAc18160F9c27d64',
    VIRGO: '0xD6E64EaFf66cd210059B0902A4644c375dF74544',
    LIBRA: '0x36aA8C7D246b9b2e72AEdD898a851A504f991D1e',
    SCORPIO: '0x39ec0e0DF63dee2a0F01588b6630A35Bd7093cca',
    SAGITTARIUS: '0x44Ab5449e9a3927C6552bB8Def7C0b46175Db969',
    CAPRICORN: '0xA56B8a072CDD519Fd1FD82c5eb016522433EB2FA',
    AQUARIUS: '0xD5E6300FE07964Ab17ee5Cd5B37270CEA28fA33e',
    PISCES: '0xA548A3C06bE31D4cC63b41D0dAeA64848494DbE4'
  },
  // SESUAIKAN DENGAN TAMPILAN PUTIH
  wANKR: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8',
  ZTUSD: '0x9423c6C914857e6DaAACe3b585f4640231505128',
  USDT: '0x3A631ee99eF7fE2D248116982b14E7615ac77502'
}

// Zodiac tokens metadata
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

// Stable tokens metadata - SESUAIKAN DENGAN TAMPILAN PUTIH
export const STABLE_TOKENS = [
  { 
    symbol: 'ztUSD', 
    name: 'Zotto USD', 
    decimals: 18, 
    color: '#4f46e5', 
    icon: '💵',
    address: '0x9423c6C914857e6DaAACe3b585f4640231505128'
  },
  { 
    symbol: 'USDT', 
    name: 'Tether USD', 
    decimals: 18,  // DARI 6 MENJADI 18 seperti di tampilan putih
    color: '#26a17b', 
    icon: '💲',
    address: '0x3A631ee99eF7fE2D248116982b14E7615ac77502'
  },
  { 
    symbol: 'wANKR', 
    name: 'Wrapped ANKR', 
    decimals: 18, 
    color: '#3b82f6', 
    icon: '🔷',
    address: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8'
  },
]

// Semua tokens dalam satu array
export const DEFAULT_TOKENS = [
  // Native token ANKR - SAMA DENGAN TAMPILAN PUTIH
  {
    address: 'native',  // GUNAKAN 'native' BUKAN '0x000...'
    symbol: 'ANKR',
    name: 'ANKR',
    decimals: 18,
    icon: '⟠',  // SAMA DENGAN PUTIH
    isNative: true,
    color: '#3B82F6'
  },
  // wANKR token - TAMBAHKAN SEPERTI DI TAMPILAN PUTIH
  {
    address: CONTRACTS.wANKR.toLowerCase(),
    symbol: 'wANKR',
    name: 'Wrapped ANKR',
    decimals: 18,
    icon: '🔷',  // SAMA DENGAN PUTIH
    color: '#3b82f6'
  },
  // ztUSD token
  {
    address: CONTRACTS.ZTUSD.toLowerCase(),
    symbol: 'ztUSD',
    name: 'Zotto USD',
    decimals: 18,
    icon: '💵',  // SAMA DENGAN PUTIH
    color: '#4f46e5',
    isStable: true
  },
  // USDT token
  {
    address: CONTRACTS.USDT.toLowerCase(),
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,  // 18 SEPERTI DI TAMPILAN PUTIH
    icon: '💲',  // SAMA DENGAN PUTIH
    color: '#26a17b',
    isStable: true
  },
  // CONS token
  {
    address: CONTRACTS.CONS.toLowerCase(),
    symbol: 'CONS',
    name: 'Constellation Token',
    decimals: 18,
    icon: '⭐',  // SAMA DENGAN PUTIH
    color: '#9E7FFF'
  },
  // Zodiac tokens (12 tokens)
  ...ZODIAC_TOKENS.map(token => ({
    address: CONTRACTS.ZODIAC_TOKENS[token.symbol].toLowerCase(),
    symbol: token.symbol,
    name: token.name,
    decimals: 18,
    icon: token.icon,
    color: token.color,
    isZodiac: true,
    initialBalance: '21000000.0000'
  }))
]

// Helper untuk akses cepat token
export const TOKEN_BY_SYMBOL = DEFAULT_TOKENS.reduce((acc, token) => {
  acc[token.symbol] = token;
  return acc;
}, {});

export const TOKEN_BY_ADDRESS = DEFAULT_TOKENS.reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {});

export const FAUCET_DAILY_LIMIT = 500;
export const ZODIAC_TOTAL_SUPPLY = 21000000;