import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
      
      // Tokens
      customTokens: [],
      dynamicTokens: [],
      
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
        walletType,
        balances: {} // Reset balances when wallet changes
      }),
      
      disconnect: () => set({ 
        address: null, 
        chainId: null, 
        isConnected: false,
        walletType: null,
        balances: {},
      }),
      
      setBalances: (balances) => set({ balances }),
      
      setDynamicTokens: (dynamicTokens) => set({ dynamicTokens }),
      
      updateBalance: (tokenAddress, balance) => set((state) => ({
        balances: { 
          ...state.balances, 
          [tokenAddress.toLowerCase()]: balance 
        }
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customTokens: state.customTokens,
        slippage: state.slippage,
        deadline: state.deadline,
        recentSwaps: state.recentSwaps,
        faucetClaims: state.faucetClaims,
        address: state.address,
        walletType: state.walletType,
        chainId: state.chainId,
        isConnected: state.isConnected,
      }),
    }
  )
)

export default useStore