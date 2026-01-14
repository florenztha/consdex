import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider, Contract, formatEther, formatUnits, zeroPadValue } from 'ethers'
import useStore from '../store/useStore'
import { DEFAULT_TOKENS, NEURA_TESTNET } from '../constants/contracts'

// ERC20 ABI
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
]

export function useWallet() {
  const { 
    address, 
    chainId, 
    isConnected, 
    walletType,
    setWallet, 
    disconnect: storeDisconnect,
    setBalances,
    setDynamicTokens,
  } = useStore()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [provider, setProvider] = useState(null)

  // Auto-reconnect on mount
  useEffect(() => {
    const autoReconnect = async () => {
      const storedData = localStorage.getItem('constellation-dex-storage')
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          if (parsed.state?.isConnected && parsed.state?.address) {
            await connect(parsed.state.walletType || 'metamask')
          }
        } catch (err) {
          console.error('Auto-reconnect failed:', err)
        }
      }
    }
    
    autoReconnect()
  }, [])

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null
    
    if (walletType === 'okx' && window.okxwallet) {
      return new BrowserProvider(window.okxwallet)
    }
    if (window.ethereum) {
      return new BrowserProvider(window.ethereum)
    }
    return null
  }, [walletType])

  // Switch to Neura Testnet
  const switchToNeuraTestnet = async (ethereum) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainIdHex }],
      })
      return true
    } catch (switchError) {
      // Jika chain belum ditambahkan, tambahkan chain
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NEURA_TESTNET.chainIdHex,
                chainName: NEURA_TESTNET.name,
                nativeCurrency: NEURA_TESTNET.currency,
                rpcUrls: [NEURA_TESTNET.rpcUrl],
                blockExplorerUrls: [NEURA_TESTNET.blockExplorer]
              }
            ]
          })
          return true
        } catch (addError) {
          console.error('Failed to add Neura Testnet:', addError)
          return false
        }
      }
      console.error('Failed to switch to Neura Testnet:', switchError)
      return false
    }
  }

  // Get all token addresses the user has interacted with
  const getUserTokenAddresses = useCallback(async (addr, prov) => {
    try {
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      
      const paddedAddress = zeroPadValue(addr, 32)
      
      const filterFrom = {
        topics: [transferTopic, paddedAddress],
        fromBlock: 0,
        toBlock: 'latest'
      }
      
      const filterTo = {
        topics: [transferTopic, null, paddedAddress],
        fromBlock: 0,
        toBlock: 'latest'
      }
      
      console.log('[getUserTokenAddresses] Querying logs for address:', addr)
      
      const [logsFrom, logsTo] = await Promise.all([
        prov.getLogs(filterFrom),
        prov.getLogs(filterTo)
      ])
      
      const addresses = new Set()
      
      logsFrom.forEach(log => addresses.add(log.address.toLowerCase()))
      logsTo.forEach(log => addresses.add(log.address.toLowerCase()))
      
      console.log('[getUserTokenAddresses] Found token addresses:', Array.from(addresses))
      
      return Array.from(addresses)
    } catch (err) {
      console.error('[getUserTokenAddresses] Error:', err)
      return []
    }
  }, [])

  // FETCH BALANCES - Diperbaiki seperti di tampilan putih
  const fetchBalances = useCallback(async (addr, prov) => {
    if (!addr || !prov) {
      console.log('[fetchBalances] No address or provider')
      return
    }
    
    console.log('[fetchBalances] Starting balance fetch for:', addr)
    const newBalances = {}
    
    try {
      // 1. Native ANKR balance - seperti di tampilan putih
      try {
        const nativeBalance = await prov.getBalance(addr)
        const formattedNative = formatEther(nativeBalance)
        newBalances['native'] = formattedNative
        newBalances['ANKR'] = formattedNative
        console.log('[fetchBalances] Native ANKR balance:', formattedNative)
      } catch (err) {
        console.error('[fetchBalances] Error fetching native balance:', err)
        newBalances['native'] = '0'
        newBalances['ANKR'] = '0'
      }

      // 2. Filter tokens yang valid - khusus ERC20
      const erc20Tokens = DEFAULT_TOKENS.filter(token => 
        token.address && token.address !== 'native' && token.address !== ''
      )

      console.log(`[fetchBalances] Fetching ${erc20Tokens.length} ERC20 tokens`)

      // 3. Fetch semua balances secara parallel
      const balancePromises = erc20Tokens.map(async (token) => {
        try {
          console.log(`[fetchBalances] Getting balance for ${token.symbol} from ${token.address}`)
          
          // Pastikan address valid
          if (!token.address || !/^0x[0-9a-fA-F]{40}$/.test(token.address)) {
            console.warn(`[fetchBalances] Invalid address for ${token.symbol}: ${token.address}`)
            return null
          }
          
          const contract = new Contract(token.address, ERC20_ABI, prov)
          
          // Coba ambil balance
          const balance = await contract.balanceOf(addr)
          
          // Ambil decimals dari token config, fallback ke 18
          const decimals = token.decimals || 18
          
          const formattedBalance = formatUnits(balance, decimals)
          
          console.log(`[fetchBalances] ${token.symbol} balance:`, formattedBalance)
          
          return {
            symbol: token.symbol,
            address: token.address.toLowerCase(),
            balance: formattedBalance,
            success: true
          }
        } catch (err) {
          console.error(`[fetchBalances] Error fetching ${token.symbol} (${token.address}):`, err.message)
          // Return null agar tidak masuk ke hasil
          return null
        }
      })

      // Wait for all balances
      const results = await Promise.allSettled(balancePromises)
      
      // Process results - hanya ambil yang sukses
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const { symbol, address, balance } = result.value
          
          // Store by symbol (utama)
          newBalances[symbol] = balance
          
          // Also store by address untuk lookup
          newBalances[address] = balance
          
          console.log(`[fetchBalances] Stored ${symbol}: ${balance}`)
        }
      })

      // 4. Tambahkan default values untuk token yang tidak ada balance-nya
      DEFAULT_TOKENS.forEach(token => {
        if (!newBalances[token.symbol]) {
          newBalances[token.symbol] = '0'
        }
      })

      // 5. Fetch dynamic tokens (all tokens user has interacted with)
      console.log('[fetchBalances] Fetching dynamic tokens')
      const allUserAddresses = await getUserTokenAddresses(addr, prov)
      
      // Filter out default tokens
      const defaultAddresses = DEFAULT_TOKENS.map(t => t.address.toLowerCase()).filter(a => a !== 'native')
      const dynamicAddresses = allUserAddresses.filter(addr => !defaultAddresses.includes(addr))
      
      console.log('[fetchBalances] Dynamic addresses:', dynamicAddresses)
      
      const dynamicTokens = []
      
      for (const tokenAddr of dynamicAddresses) {
        try {
          console.log(`[fetchBalances] Fetching info for dynamic token: ${tokenAddr}`)
          
          const contract = new Contract(tokenAddr, ERC20_ABI, prov)
          
          const [name, symbol, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals()
          ])
          
          const balance = await contract.balanceOf(addr)
          const formattedBalance = formatUnits(balance, decimals)
          
          if (parseFloat(formattedBalance) > 0) {  // Only include if has balance
            const tokenInfo = {
              address: tokenAddr,
              symbol,
              name,
              decimals,
              icon: '🪙',  // Default icon
              color: '#6b7280'  // Default color
            }
            
            dynamicTokens.push(tokenInfo)
            
            // Store balance
            newBalances[symbol] = formattedBalance
            newBalances[tokenAddr] = formattedBalance
            
            console.log(`[fetchBalances] Added dynamic token ${symbol}: ${formattedBalance}`)
          }
        } catch (err) {
          console.error(`[fetchBalances] Error fetching dynamic token ${tokenAddr}:`, err.message)
        }
      }
      
      setDynamicTokens(dynamicTokens)

      console.log('[fetchBalances] Final balances:', newBalances)
      setBalances(newBalances)
      
      return newBalances
      
    } catch (err) {
      console.error('[fetchBalances] Critical error:', err)
      throw err
    }
  }, [setBalances])

  // CONNECT
  const connect = async (type = 'metamask') => {
    setIsConnecting(true)
    setError(null)
    
    try {
      let ethereum
      if (type === 'okx') {
        if (!window.okxwallet) {
          throw new Error('OKX Wallet not installed')
        }
        ethereum = window.okxwallet
      } else {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed')
        }
        ethereum = window.ethereum
      }

      // Switch to Neura Testnet
      const switched = await switchToNeuraTestnet(ethereum)
      if (!switched) {
        throw new Error('Please switch to Neura Testnet')
      }

      const prov = new BrowserProvider(ethereum)
      setProvider(prov)
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const network = await prov.getNetwork()
      const signer = await prov.getSigner()
      const addr = await signer.getAddress()
      
      console.log('[connect] Connected:', { addr, chainId: Number(network.chainId), type })
      
      setWallet(addr, Number(network.chainId), type)
      
      // Fetch balances
      await fetchBalances(addr, prov)
      
      // Setup listeners
      ethereum.on('accountsChanged', (newAccounts) => {
        console.log('[accountsChanged]', newAccounts)
        if (newAccounts.length === 0) {
          storeDisconnect()
        } else {
          setWallet(newAccounts[0], Number(network.chainId), type)
          fetchBalances(newAccounts[0], prov)
        }
      })
      
      ethereum.on('chainChanged', (newChainId) => {
        console.log('[chainChanged]', newChainId)
        window.location.reload()
      })
      
    } catch (err) {
      setError(err.message)
      console.error('Connection error:', err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    storeDisconnect()
    setProvider(null)
  }

  const refreshBalances = useCallback(async () => {
    if (!address || !provider) {
      console.log('[refreshBalances] No address or provider')
      return
    }
    console.log('[refreshBalances] Refreshing balances...')
    return await fetchBalances(address, provider)
  }, [address, provider, fetchBalances])

  // Get token balance - diperbaiki
  const getTokenBalance = useCallback((tokenIdentifier) => {
    if (!tokenIdentifier) return '0'
    
    const balances = useStore.getState().balances
    
    // Jika tokenIdentifier adalah string (symbol atau address)
    if (typeof tokenIdentifier === 'string') {
      // Cek sebagai symbol terlebih dahulu
      if (balances[tokenIdentifier] !== undefined) {
        return balances[tokenIdentifier]
      }
      
      // Jika format address, coba cari di balances
      if (tokenIdentifier.startsWith('0x')) {
        const addr = tokenIdentifier.toLowerCase()
        if (balances[addr] !== undefined) {
          return balances[addr]
        }
      }
    }
    
    // Jika tokenIdentifier adalah object token
    if (typeof tokenIdentifier === 'object' && tokenIdentifier.symbol) {
      // Cari berdasarkan symbol
      if (balances[tokenIdentifier.symbol] !== undefined) {
        return balances[tokenIdentifier.symbol]
      }
      
      // Cari berdasarkan address
      if (tokenIdentifier.address) {
        const addr = tokenIdentifier.address.toLowerCase()
        if (balances[addr] !== undefined) {
          return balances[addr]
        }
      }
    }
    
    return '0'
  }, [])

  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    walletType,
    balances: useStore.getState().balances,
    connect,
    disconnect,
    refreshBalances,
    getProvider,
    getTokenBalance,
    provider,
  }
}