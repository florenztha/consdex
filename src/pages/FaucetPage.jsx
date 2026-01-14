import React, { useState } from 'react'
import { Droplet, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import useStore from '../store/useStore'
import { ZODIAC_TOKENS, FAUCET_DAILY_LIMIT } from '../constants/contracts'
import TokenLogo from '../components/TokenLogo'
import WalletModal from '../components/WalletModal'

function FaucetPage() {
  const { address, isConnected } = useWallet()
  const { faucetClaims, setFaucetClaim, canClaimFaucet } = useStore()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [claimingToken, setClaimingToken] = useState(null)
  const [claimSuccess, setClaimSuccess] = useState(null)

  const zodiacTokens = ZODIAC_TOKENS.map((z, i) => ({
    ...z,
    address: `0x${(i + 100).toString(16).padStart(40, '0')}`,
    decimals: 18,
  }))

  const getTimeUntilNextClaim = (token) => {
    const lastClaim = faucetClaims[token]
    if (!lastClaim) return null
    
    const nextClaim = lastClaim + 24 * 60 * 60 * 1000
    const now = Date.now()
    
    if (now >= nextClaim) return null
    
    const diff = nextClaim - now
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
    
    return `${hours}h ${minutes}m`
  }

  const handleClaim = async (token) => {
    if (!canClaimFaucet(token.symbol)) return
    
    setClaimingToken(token.symbol)
    
    // Simulate faucet claim
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setFaucetClaim(token.symbol, Date.now())
    setClaimSuccess(token.symbol)
    setClaimingToken(null)
    
    setTimeout(() => setClaimSuccess(null), 3000)
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Droplet className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">Zodiac Token Faucet</h1>
        <p className="text-text-secondary mb-6">
          Connect your wallet to claim free Zodiac tokens. Each token can be claimed once per day.
        </p>
        <button
          onClick={() => setShowWalletModal(true)}
          className="btn-primary"
        >
          Connect Wallet
        </button>
        <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Zodiac Token Faucet</h1>
        <p className="text-text-secondary">Claim {FAUCET_DAILY_LIMIT} tokens per day for each Zodiac token</p>
      </div>

      {/* Info Card */}
      <div className="card mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Droplet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Faucet Rules</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Claim up to {FAUCET_DAILY_LIMIT} tokens per Zodiac token per day</li>
              <li>• Tokens are sent from the deployment wallet</li>
              <li>• Use these tokens for testing swaps, liquidity, and farming</li>
              <li>• Each Zodiac token has a total supply of 21,000,000</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zodiacTokens.map((token) => {
          const canClaim = canClaimFaucet(token.symbol)
          const timeUntil = getTimeUntilNextClaim(token.symbol)
          const isClaiming = claimingToken === token.symbol
          const isSuccess = claimSuccess === token.symbol
          
          return (
            <div
              key={token.symbol}
              className="card hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: `linear-gradient(135deg, ${token.color}, ${token.color}88)` }}
                >
                  {token.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{token.symbol}</h3>
                  <p className="text-sm text-text-secondary">{token.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-secondary">Amount</span>
                <span className="font-semibold">{FAUCET_DAILY_LIMIT} {token.symbol}</span>
              </div>

              {isSuccess ? (
                <div className="flex items-center justify-center gap-2 py-3 bg-success/20 text-success rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Claimed Successfully!</span>
                </div>
              ) : canClaim ? (
                <button
                  onClick={() => handleClaim(token)}
                  disabled={isClaiming}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isClaiming ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Claiming...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Droplet className="w-5 h-5" />
                      Claim {FAUCET_DAILY_LIMIT} {token.symbol}
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 bg-surface-light text-text-secondary rounded-xl">
                  <Clock className="w-5 h-5" />
                  <span>Next claim in {timeUntil}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default FaucetPage
