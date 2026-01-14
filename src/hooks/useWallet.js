import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import useStore from '../store/useStore'
import { NEURA_TESTNET, DEFAULT_TOKENS, CONTRACTS } from '../constants/contracts'
import { ERC20_ABI } from '../constants/abis'

export function useWallet() {
  const { 
    address, 
    chainId, 
    isConnected, 
    walletType,
    setWallet, 
    disconnect: storeDisconnect,
    setBalances,
    updateBalance,
    balances,
  } = useStore()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const getProvider = useCallback(() => {
    if (walletType === 'okx' && window.okxwallet) {
      return new ethers.BrowserProvider(window.okxwallet)
    }
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum)
    }
    return null
  }, [walletType])

  const switchToNeura = async (provider) => {
    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: NEURA_TESTNET.chainIdHex }
      ])
    } catch (switchError) {
      if (switchError.code === 4902) {
        await provider.send('wallet_addEthereumChain', [{
          chainId: NEURA_TESTNET.chainIdHex,
          chainName: NEURA_TESTNET.name,
          nativeCurrency: NEURA_TESTNET.currency,
          rpcUrls: [NEURA_TESTNET.rpcUrl],
          blockExplorerUrls: [NEURA_TESTNET.blockExplorer],
        }])
      } else {
        throw switchError
      }
    }
  }

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

      const provider = new ethers.BrowserProvider(ethereum)
      await switchToNeura(provider)
      
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      
      setWallet(accounts[0], Number(network.chainId), type)
      
      // Fetch balances
      await fetchBalances(accounts[0], provider)
      
    } catch (err) {
      setError(err.message)
      console.error('Connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    storeDisconnect()
  }

  const fetchBalances = async (addr, provider) => {
    if (!addr || !provider) return
    
    try {
      const newBalances = {}
      
      // Native balance
      const nativeBalance = await provider.getBalance(addr)
      newBalances['native'] = ethers.formatEther(nativeBalance)
      
      // Token balances
      for (const token of DEFAULT_TOKENS) {
        if (token.isNative) continue
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(addr)
          newBalances[token.address] = ethers.formatUnits(balance, token.decimals)
        } catch (e) {
          newBalances[token.address] = '0'
        }
      }
      
      setBalances(newBalances)
    } catch (err) {
      console.error('Error fetching balances:', err)
    }
  }

  const refreshBalances = useCallback(async () => {
    if (!address) return
    const provider = getProvider()
    if (provider) {
      await fetchBalances(address, provider)
    }
  }, [address, getProvider])

  // Listen for account/chain changes
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== address) {
        setWallet(accounts[0], chainId, walletType)
        refreshBalances()
      }
    }

    const handleChainChanged = (newChainId) => {
      const chainIdNum = parseInt(newChainId, 16)
      setWallet(address, chainIdNum, walletType)
    }

    const ethereum = walletType === 'okx' ? window.okxwallet : window.ethereum
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (ethereum) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [address, chainId, walletType])

  // Auto-refresh balances
  useEffect(() => {
    if (!isConnected) return
    
    const interval = setInterval(refreshBalances, 3000)
    return () => clearInterval(interval)
  }, [isConnected, refreshBalances])

  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    walletType,
    balances,
    connect,
    disconnect,
    refreshBalances,
    getProvider,
  }
}
