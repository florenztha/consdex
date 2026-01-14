import React, { useState, useEffect, useCallback } from 'react'
import { ArrowDownUp, Settings, RefreshCw, Info, ChevronDown, ExternalLink } from 'lucide-react'
import { ethers } from 'ethers'
import { useWallet } from '../hooks/useWallet'
import { useSwap } from '../hooks/useSwap'
import useStore from '../store/useStore'
import { DEFAULT_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import TokenSelect from '../components/TokenSelect'
import TokenLogo from '../components/TokenLogo'
import WalletModal from '../components/WalletModal'

function SwapPage() {
  const { address, isConnected, balances, refreshBalances } = useWallet()
  const { swap, getAmountsOut, isSwapping, slippage } = useSwap()
  const { recentSwaps, setSlippage } = useStore()
  
  const [tokenIn, setTokenIn] = useState(DEFAULT_TOKENS[0])
  const [tokenOut, setTokenOut] = useState(DEFAULT_TOKENS[2])
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [showTokenSelect, setShowTokenSelect] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)
  const [rate, setRate] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getBalance = (token) => {
    if (!token) return '0'
    const key = token.isNative ? 'native' : token.address
    return balances[key] || '0'
  }

  const calculateOutput = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) === 0) {
      setAmountOut('')
      setRate(null)
      return
    }

    try {
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals)
      
      // Mock calculation for demo
      const mockRate = tokenIn.symbol === 'ANKR' ? 1.5 : 
                       tokenIn.symbol === 'ztUSD' ? 1 :
                       tokenIn.symbol === 'USDT' ? 1 : 0.8
      
      const outputAmount = parseFloat(amountIn) * mockRate
      setAmountOut(outputAmount.toFixed(6))
      setRate(mockRate)
      setPriceImpact(parseFloat(amountIn) > 1000 ? 0.5 : 0.1)
    } catch (err) {
      console.error('Calculate output error:', err)
    }
  }, [amountIn, tokenIn, tokenOut])

  useEffect(() => {
    calculateOutput()
  }, [calculateOutput])

  // Auto refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        refreshBalances()
        calculateOutput()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isConnected, refreshBalances, calculateOutput])

  const handleSwapTokens = () => {
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  const handleAmountButton = (percentage) => {
    const balance = parseFloat(getBalance(tokenIn))
    const amount = (balance * percentage / 100).toFixed(6)
    setAmountIn(amount)
  }

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return
    
    try {
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals)
      const amountOutWei = ethers.parseUnits(amountOut, tokenOut.decimals)
      const minOut = amountOutWei * BigInt(Math.floor((100 - slippage) * 100)) / 10000n
      
      await swap(tokenIn, tokenOut, amountInWei, minOut)
      setAmountIn('')
      setAmountOut('')
      refreshBalances()
    } catch (err) {
      console.error('Swap error:', err)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalances()
    await calculateOutput()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Swap</h1>
          <p className="text-text-secondary">Trade tokens instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 hover:bg-surface-light rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-surface-light rounded-lg transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Slippage Tolerance</h3>
          <div className="flex gap-2">
            {[0.1, 0.5, 1].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  slippage === value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light hover:bg-surface'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
              className="input-field w-20 text-center"
              placeholder="Custom"
            />
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="card">
        {/* Token In */}
        <div className="bg-surface-light rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">You Pay</span>
            <span className="text-sm text-text-secondary">
              Balance: {parseFloat(getBalance(tokenIn)).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <button
              onClick={() => setShowTokenSelect('in')}
              className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all"
            >
              <TokenLogo token={tokenIn} size="sm" />
              <span className="font-semibold">{tokenIn.symbol}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handleAmountButton(pct)}
                className="flex-1 py-1 text-xs bg-surface rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-3 bg-surface border border-border rounded-xl hover:border-primary/50 hover:bg-surface-light transition-all"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* Token Out */}
        <div className="bg-surface-light rounded-xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">You Receive</span>
            <span className="text-sm text-text-secondary">
              Balance: {parseFloat(getBalance(tokenOut)).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountOut}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <button
              onClick={() => setShowTokenSelect('out')}
              className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all"
            >
              <TokenLogo token={tokenOut} size="sm" />
              <span className="font-semibold">{tokenOut.symbol}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rate Info */}
        {rate && (
          <div className="mt-4 p-3 bg-surface-light rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Rate</span>
              <span>1 {tokenIn.symbol} = {rate.toFixed(4)} {tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Price Impact</span>
              <span className={priceImpact > 1 ? 'text-warning' : 'text-success'}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">LP Fee</span>
              <span>0.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Min Received</span>
              <span>{(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut.symbol}</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {isConnected ? (
          <button
            onClick={handleSwap}
            disabled={!amountIn || !amountOut || isSwapping}
            className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Swapping...
              </span>
            ) : !amountIn ? (
              'Enter Amount'
            ) : (
              'Swap'
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
      </div>

      {/* Recent Swaps */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Recent Swaps
        </h3>
        <div className="card max-h-80 overflow-y-auto">
          {recentSwaps.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No recent swaps</p>
          ) : (
            <div className="space-y-2">
              {recentSwaps.slice(0, 50).map((swap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-surface-light rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      swap.status === 'success' ? 'bg-success' : 'bg-error'
                    }`} />
                    <span className="text-sm">
                      {swap.amountIn} {swap.tokenIn} → {swap.amountOut} {swap.tokenOut}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {new Date(swap.timestamp).toLocaleTimeString()}
                    </span>
                    {swap.hash && (
                      <a
                        href={`${NEURA_TESTNET.blockExplorer}/tx/${swap.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Token Select Modal */}
      <TokenSelect
        isOpen={!!showTokenSelect}
        onClose={() => setShowTokenSelect(null)}
        onSelect={(token) => {
          if (showTokenSelect === 'in') {
            setTokenIn(token)
          } else {
            setTokenOut(token)
          }
        }}
        excludeToken={showTokenSelect === 'in' ? tokenOut : tokenIn}
      />

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default SwapPage
