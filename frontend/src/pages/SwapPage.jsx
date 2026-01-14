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
  const { address, isConnected, getTokenBalance, refreshBalances } = useWallet()
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

  const getBalance = useCallback((token) => {
    if (!token) return '0'
    return getTokenBalance(token.address)
  }, [getTokenBalance])

  const calculateOutput = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) === 0) {
      setAmountOut('')
      setRate(null)
      return
    }

    try {
      // Mock calculation for demo - sebaiknya ganti dengan real calculation
      const mockRates = {
        'ANKR': { 'CONS': 1.5, 'ARIES': 2.0, 'ztUSD': 0.8 },
        'CONS': { 'ANKR': 0.67, 'ARIES': 1.33, 'ztUSD': 0.53 },
        'ARIES': { 'ANKR': 0.5, 'CONS': 0.75, 'ztUSD': 0.4 },
        'ztUSD': { 'ANKR': 1.25, 'CONS': 1.88, 'ARIES': 2.5 },
      }
      
      const mockRate = mockRates[tokenIn.symbol]?.[tokenOut.symbol] || 
                      mockRates[tokenOut.symbol]?.[tokenIn.symbol] ? 
                      1 / mockRates[tokenOut.symbol][tokenIn.symbol] : 1
      
      const outputAmount = parseFloat(amountIn) * mockRate
      setAmountOut(outputAmount.toFixed(6))
      setRate(mockRate)
      
      // Calculate price impact sederhana
      const impact = parseFloat(amountIn) > 1000 ? 0.5 : 
                    parseFloat(amountIn) > 500 ? 0.3 : 
                    parseFloat(amountIn) > 100 ? 0.1 : 0.05
      setPriceImpact(impact)
    } catch (err) {
      console.error('Calculate output error:', err)
    }
  }, [amountIn, tokenIn, tokenOut])

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOutput()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [calculateOutput])

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
    if (!amountIn || !amountOut || parseFloat(amountIn) === 0) return
    
    try {
      const amountInWei = ethers.parseUnits(amountIn, tokenIn.decimals)
      const amountOutWei = ethers.parseUnits(amountOut, tokenOut.decimals)
      const minOut = amountOutWei * BigInt(Math.floor((100 - slippage) * 100)) / 10000n
      
      await swap(tokenIn, tokenOut, amountInWei, minOut)
      
      // Reset form setelah swap
      setAmountIn('')
      setAmountOut('')
      
      // Refresh balances
      await refreshBalances()
      
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
    <div className="max-w-lg mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Swap
          </h1>
          <p className="text-text-secondary text-sm">Trade tokens instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 hover:bg-surface-light rounded-xl transition-all duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh balances"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 hover:bg-surface-light rounded-xl transition-all duration-200 ${
              showSettings ? 'bg-surface-light' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card mb-4 animate-slideDown">
          <h3 className="font-semibold mb-3">Transaction Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Slippage Tolerance</label>
              <div className="flex gap-2">
                {[0.1, 0.5, 1].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      slippage === value
                        ? 'bg-primary text-white'
                        : 'bg-surface-light hover:bg-surface'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    className="input-field w-20 text-center"
                    placeholder="Custom"
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Card */}
      <div className="card relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full translate-y-16 -translate-x-16 blur-3xl" />
        
        {/* Token In */}
        <div className="relative bg-surface-light rounded-xl p-4 mb-2 border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">You Pay</span>
            <span className="text-sm">
              Balance: <span className="font-medium">{parseFloat(getBalance(tokenIn)).toFixed(4)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              min="0"
              step="any"
              className="flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-text-secondary"
            />
            <button
              onClick={() => setShowTokenSelect('in')}
              className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all border border-border"
            >
              <TokenLogo token={tokenIn} size="sm" />
              <span className="font-semibold">{tokenIn.symbol}</span>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handleAmountButton(pct)}
                className="flex-1 py-1.5 text-xs bg-surface rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
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
            className="p-3 bg-surface border-2 border-border rounded-xl hover:border-primary hover:bg-surface-light transition-all hover:scale-105 active:scale-95"
            title="Swap tokens"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        {/* Token Out */}
        <div className="relative bg-surface-light rounded-xl p-4 mt-2 border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">You Receive</span>
            <span className="text-sm">
              Balance: <span className="font-medium">{parseFloat(getBalance(tokenOut)).toFixed(4)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountOut}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-bold outline-none text-text-secondary"
            />
            <button
              onClick={() => setShowTokenSelect('out')}
              className="flex items-center gap-2 bg-surface px-3 py-2 rounded-xl hover:bg-surface-light transition-all border border-border"
            >
              <TokenLogo token={tokenOut} size="sm" />
              <span className="font-semibold">{tokenOut.symbol}</span>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Rate Info */}
        {rate && amountIn && (
          <div className="mt-4 p-3 bg-surface-light rounded-xl space-y-2 text-sm animate-fadeIn">
            <div className="flex justify-between">
              <span className="text-text-secondary">Rate</span>
              <span className="font-medium">1 {tokenIn.symbol} = {rate.toFixed(4)} {tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Price Impact</span>
              <span className={`font-medium ${priceImpact > 1 ? 'text-error' : priceImpact > 0.5 ? 'text-warning' : 'text-success'}`}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">LP Fee</span>
              <span>0.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Min Received</span>
              <span className="font-medium">
                {(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {isConnected ? (
          <button
            onClick={handleSwap}
            disabled={!amountIn || parseFloat(amountIn) === 0 || isSwapping}
            className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Swapping...
              </span>
            ) : !amountIn ? (
              'Enter Amount'
            ) : parseFloat(amountIn) > parseFloat(getBalance(tokenIn)) ? (
              'Insufficient Balance'
            ) : (
              `Swap ${tokenIn.symbol} for ${tokenOut.symbol}`
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowWalletModal(true)}
            className="btn-primary w-full mt-4 hover:shadow-xl hover:shadow-primary/30 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Connect Wallet to Swap
          </button>
        )}
      </div>

      {/* Recent Swaps */}
      {recentSwaps.length > 0 && (
        <div className="mt-6 animate-fadeIn">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Recent Swaps
          </h3>
          <div className="card max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {recentSwaps.slice(0, 10).map((swap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-surface-light rounded-lg hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      swap.status === 'success' ? 'bg-success' : 'bg-error'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {swap.amountIn} {swap.tokenIn} → {swap.amountOut} {swap.tokenOut}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(swap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {swap.hash && (
                    <a
                      href={`${NEURA_TESTNET.blockExplorer}/tx/${swap.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary transition-colors p-1"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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