import React, { useState, useEffect } from 'react'
import { Plus, Minus, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'
import { useWallet } from '../hooks/useWallet'
import { useLiquidity } from '../hooks/useLiquidity'
import useStore from '../store/useStore'
import { DEFAULT_TOKENS } from '../constants/contracts'
import TokenSelect from '../components/TokenSelect'
import TokenLogo from '../components/TokenLogo'
import WalletModal from '../components/WalletModal'

function LiquidityPage() {
  const { address, isConnected, balances, refreshBalances } = useWallet()
  const { getPair, addLiquidity, removeLiquidity, createPair, isLoading, error } = useLiquidity()
  const { slippage } = useStore()
  
  const [mode, setMode] = useState('add') // 'add' or 'remove'
  const [tokenA, setTokenA] = useState(DEFAULT_TOKENS[0])
  const [tokenB, setTokenB] = useState(DEFAULT_TOKENS[2])
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [showTokenSelect, setShowTokenSelect] = useState(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [pairInfo, setPairInfo] = useState(null)
  const [pairExists, setPairExists] = useState(true)

  const getBalance = (token) => {
    if (!token) return '0'
    const key = token.isNative ? 'native' : token.address
    return balances[key] || '0'
  }

  useEffect(() => {
    const fetchPairInfo = async () => {
      if (!tokenA || !tokenB) return
      
      const info = await getPair(
        tokenA.isNative ? CONTRACTS.wANKR : tokenA.address,
        tokenB.isNative ? CONTRACTS.wANKR : tokenB.address
      )
      
      setPairInfo(info)
      setPairExists(!!info)
    }
    
    fetchPairInfo()
  }, [tokenA, tokenB, getPair])

  const handleAmountAChange = (value) => {
    setAmountA(value)
    if (pairInfo && value) {
      // Calculate proportional amount B based on reserves
      const ratio = Number(pairInfo.reserve1) / Number(pairInfo.reserve0)
      setAmountB((parseFloat(value) * ratio).toFixed(6))
    }
  }

  const handleAmountBChange = (value) => {
    setAmountB(value)
    if (pairInfo && value) {
      const ratio = Number(pairInfo.reserve0) / Number(pairInfo.reserve1)
      setAmountA((parseFloat(value) * ratio).toFixed(6))
    }
  }

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return
    
    try {
      const amountAWei = ethers.parseUnits(amountA, tokenA.decimals)
      const amountBWei = ethers.parseUnits(amountB, tokenB.decimals)
      
      await addLiquidity(tokenA, tokenB, amountAWei, amountBWei, slippage)
      setAmountA('')
      setAmountB('')
      refreshBalances()
    } catch (err) {
      console.error('Add liquidity error:', err)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!lpAmount) return
    
    try {
      const lpAmountWei = ethers.parseUnits(lpAmount, 18)
      await removeLiquidity(tokenA, tokenB, lpAmountWei, slippage)
      setLpAmount('')
      refreshBalances()
    } catch (err) {
      console.error('Remove liquidity error:', err)
    }
  }

  const handleCreatePair = async () => {
    try {
      await createPair(tokenA, tokenB)
      setPairExists(true)
    } catch (err) {
      console.error('Create pair error:', err)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Liquidity</h1>
        <p className="text-text-secondary">Add or remove liquidity to earn fees</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('add')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'add'
              ? 'bg-gradient-to-r from-primary to-secondary text-white'
              : 'bg-surface-light text-text-secondary hover:text-white'
          }`}
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Add Liquidity
        </button>
        <button
          onClick={() => setMode('remove')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'remove'
              ? 'bg-gradient-to-r from-primary to-secondary text-white'
              : 'bg-surface-light text-text-secondary hover:text-white'
          }`}
        >
          <Minus className="w-5 h-5 inline mr-2" />
          Remove
        </button>
      </div>

      {/* Main Card */}
      <div className="card">
        {mode === 'add' ? (
          <>
            {/* Token A Input */}
            <div className="bg-surface-light rounded-xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Token A</span>
                <span className="text-sm text-text-secondary">
                  Balance: {parseFloat(getBalance(tokenA)).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-xl font-semibold outline-none"
                />
                <button
                  onClick={() => setShowTokenSelect('A')}
                  className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all"
                >
                  <TokenLogo token={tokenA} size="sm" />
                  <span className="font-semibold">{tokenA.symbol}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-1">
              <div className="p-2 bg-surface border border-border rounded-xl">
                <Plus className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Token B Input */}
            <div className="bg-surface-light rounded-xl p-4 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Token B</span>
                <span className="text-sm text-text-secondary">
                  Balance: {parseFloat(getBalance(tokenB)).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amountB}
                  onChange={(e) => handleAmountBChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-xl font-semibold outline-none"
                />
                <button
                  onClick={() => setShowTokenSelect('B')}
                  className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all"
                >
                  <TokenLogo token={tokenB} size="sm" />
                  <span className="font-semibold">{tokenB.symbol}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pair Info */}
            {pairInfo && (
              <div className="mt-4 p-3 bg-surface-light rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pool Reserves</span>
                  <span>
                    {ethers.formatUnits(pairInfo.reserve0, 18).slice(0, 10)} / {ethers.formatUnits(pairInfo.reserve1, 18).slice(0, 10)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Your LP Balance</span>
                  <span>{ethers.formatUnits(pairInfo.lpBalance, 18).slice(0, 10)} LP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pool Share</span>
                  <span>
                    {pairInfo.totalSupply > 0n
                      ? ((Number(pairInfo.lpBalance) / Number(pairInfo.totalSupply)) * 100).toFixed(4)
                      : '0'}%
                  </span>
                </div>
              </div>
            )}

            {/* No Pair Warning */}
            {!pairExists && (
              <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning">Pair doesn't exist</p>
                    <p className="text-sm text-text-secondary mt-1">
                      This trading pair hasn't been created yet. You can create it and be the first liquidity provider.
                    </p>
                    <button
                      onClick={handleCreatePair}
                      disabled={isLoading}
                      className="mt-3 btn-secondary text-sm"
                    >
                      {isLoading ? 'Creating...' : 'Create Pair'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            {isConnected ? (
              <button
                onClick={handleAddLiquidity}
                disabled={!amountA || !amountB || isLoading || !pairExists}
                className="btn-primary w-full mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Adding Liquidity...
                  </span>
                ) : (
                  'Add Liquidity'
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="btn-primary w-full mt-4"
              >
                Connect Wallet
              </button>
            )}
          </>
        ) : (
          <>
            {/* Remove Liquidity */}
            <div className="bg-surface-light rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">LP Tokens to Remove</span>
                <span className="text-sm text-text-secondary">
                  Balance: {pairInfo ? ethers.formatUnits(pairInfo.lpBalance, 18).slice(0, 10) : '0'}
                </span>
              </div>
              <input
                type="number"
                value={lpAmount}
                onChange={(e) => setLpAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-xl font-semibold outline-none"
              />
              <div className="flex gap-2 mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      if (pairInfo) {
                        const amount = (Number(ethers.formatUnits(pairInfo.lpBalance, 18)) * pct / 100).toFixed(6)
                        setLpAmount(amount)
                      }
                    }}
                    className="flex-1 py-1 text-xs bg-surface rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Token Pair Display */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <TokenLogo token={tokenA} size="md" />
                <span className="font-semibold">{tokenA.symbol}</span>
              </div>
              <span className="text-text-secondary">/</span>
              <div className="flex items-center gap-2">
                <TokenLogo token={tokenB} size="md" />
                <span className="font-semibold">{tokenB.symbol}</span>
              </div>
            </div>

            {/* Estimated Output */}
            {lpAmount && pairInfo && (
              <div className="mt-4 p-3 bg-surface-light rounded-xl space-y-2 text-sm">
                <p className="text-text-secondary mb-2">You will receive (estimated):</p>
                <div className="flex justify-between">
                  <span>{tokenA.symbol}</span>
                  <span>
                    {(parseFloat(lpAmount) * Number(ethers.formatUnits(pairInfo.reserve0, 18)) / Number(ethers.formatUnits(pairInfo.totalSupply, 18))).toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{tokenB.symbol}</span>
                  <span>
                    {(parseFloat(lpAmount) * Number(ethers.formatUnits(pairInfo.reserve1, 18)) / Number(ethers.formatUnits(pairInfo.totalSupply, 18))).toFixed(6)}
                  </span>
                </div>
              </div>
            )}

            {/* Remove Button */}
            {isConnected ? (
              <button
                onClick={handleRemoveLiquidity}
                disabled={!lpAmount || isLoading}
                className="btn-primary w-full mt-4 disabled:opacity-50 bg-gradient-to-r from-error to-warning"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Removing...
                  </span>
                ) : (
                  'Remove Liquidity'
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="btn-primary w-full mt-4"
              >
                Connect Wallet
              </button>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-error/20 border border-error/30 rounded-xl text-error text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Token Select Modal */}
      <TokenSelect
        isOpen={!!showTokenSelect}
        onClose={() => setShowTokenSelect(null)}
        onSelect={(token) => {
          if (showTokenSelect === 'A') {
            setTokenA(token)
          } else {
            setTokenB(token)
          }
        }}
        excludeToken={showTokenSelect === 'A' ? tokenB : tokenA}
      />

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default LiquidityPage
