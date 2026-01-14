import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Wallet State
      address: null,
      chainId: null,
      isConnected: false,
      walletType: null,
      
      // Balances
      balances: {},
      lpBalances: {},
      
      // Tokens
      customTokens: [],
      
      // Settings
      slippage: 0.5,
      deadline: 20,
      
      // Recent Transactions
      recentSwaps: [],
      
      // Faucet Claims
      faucetClaims: {},
      
      // Actions
      setWallet: (address, chainId, walletType) => set({ 
        address, 
        chainId, 
        isConnected: !!address,
        walletType 
      }),
      
      disconnect: () => set({ 
        address: null, 
        chainId: null, 
        isConnected: false,
        walletType: null,
        balances: {},
        lpBalances: {},
      }),
      
      setBalances: (balances) => set({ balances }),
      
      updateBalance: (token, balance) => set((state) => ({
        balances: { ...state.balances, [token]: balance }
      })),
      
      setLpBalances: (lpBalances) => set({ lpBalances }),
      
      addCustomToken: (token) => set((state) => ({
        customTokens: [...state.customTokens.filter(t => t.address !== token.address), token]
      })),
      
      removeCustomToken: (address) => set((state) => ({
        customTokens: state.customTokens.filter(t => t.address !== address)
      })),
      
      setSlippage: (slippage) => set({ slippage }),
      
      setDeadline: (deadline) => set({ deadline }),
      
      addRecentSwap: (swap) => set((state) => ({
        recentSwaps: [swap, ...state.recentSwaps].slice(0, 50)
      })),
      
      setFaucetClaim: (token, timestamp) => set((state) => ({
        faucetClaims: { ...state.faucetClaims, [token]: timestamp }
      })),
      
      canClaimFaucet: (token) => {
        const claims = get().faucetClaims
        const lastClaim = claims[token]
        if (!lastClaim) return true
        const now = Date.now()
        const oneDayMs = 24 * 60 * 60 * 1000
        return now - lastClaim >= oneDayMs
      },
    }),
    {
      name: 'constellation-dex-storage',
      partialize: (state) => ({
        customTokens: state.customTokens,
        slippage: state.slippage,
        deadline: state.deadline,
        recentSwaps: state.recentSwaps,
        faucetClaims: state.faucetClaims,
      }),
    }
  )
)

export default useStore
