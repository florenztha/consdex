import React, { useState } from 'react'
import { Sprout, Coins, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { ZODIAC_TOKENS, DEFAULT_TOKENS } from '../constants/contracts'
import TokenLogo from '../components/TokenLogo'
import WalletModal from '../components/WalletModal'

// Mock farming pools
const FARMING_POOLS = [
  {
    id: 1,
    name: 'CONS Staking',
    type: 'single',
    token: { symbol: 'CONS', name: 'Constellation Token', color: '#9E7FFF' },
    rewardToken: { symbol: 'CONS', name: 'Constellation Token', color: '#9E7FFF' },
    apr: 45.5,
    tvl: 250000,
    earned: '125.50',
    staked: '1000.00',
    multiplier: '2x',
  },
  {
    id: 2,
    name: 'ANKR/ztUSD LP',
    type: 'lp',
    tokenA: DEFAULT_TOKENS[0],
    tokenB: DEFAULT_TOKENS[2],
    rewardToken: { symbol: 'CONS', name: 'Constellation Token', color: '#9E7FFF' },
    apr: 68.2,
    tvl: 180000,
    earned: '89.25',
    staked: '500.00',
    multiplier: '3x',
  },
  ...ZODIAC_TOKENS.slice(0, 6).map((zodiac, i) => ({
    id: i + 3,
    name: `${zodiac.symbol} Staking`,
    type: 'single',
    token: { symbol: zodiac.symbol, name: zodiac.name, icon: zodiac.icon, color: zodiac.color },
    rewardToken: { symbol: 'CONS', name: 'Constellation Token', color: '#9E7FFF' },
    apr: (Math.random() * 50 + 20).toFixed(1),
    tvl: Math.floor(Math.random() * 100000) + 20000,
    earned: (Math.random() * 100).toFixed(2),
    staked: Math.random() > 0.5 ? (Math.random() * 500).toFixed(2) : '0',
    multiplier: `${Math.floor(Math.random() * 3) + 1}x`,
  })),
]

function FarmingPage() {
  const { isConnected } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [expandedPool, setExpandedPool] = useState(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)

  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const handleStake = async (poolId) => {
    setIsStaking(true)
    // Simulate staking
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsStaking(false)
    setStakeAmount('')
  }

  const handleClaim = async (poolId) => {
    // Simulate claiming
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  const handleCompound = async (poolId) => {
    // Simulate compounding
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  const totalEarned = FARMING_POOLS.reduce((acc, p) => acc + parseFloat(p.earned), 0)
  const totalStaked = FARMING_POOLS.reduce((acc, p) => acc + parseFloat(p.staked), 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Farming</h1>
        <p className="text-text-secondary">Stake tokens and LP to earn CONS rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total TVL</p>
              <p className="text-xl font-bold">
                {formatNumber(FARMING_POOLS.reduce((acc, p) => acc + p.tvl, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <Coins className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Your Staked</p>
              <p className="text-xl font-bold">{totalStaked.toFixed(2)} LP</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Earned</p>
              <p className="text-xl font-bold">{totalEarned.toFixed(2)} CONS</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Farms</p>
              <p className="text-xl font-bold">{FARMING_POOLS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Farming Pools */}
      <div className="space-y-4">
        {FARMING_POOLS.map((pool) => (
          <div key={pool.id} className="card overflow-hidden">
            {/* Pool Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {pool.type === 'lp' ? (
                    <>
                      <TokenLogo token={pool.tokenA} size="lg" />
                      <TokenLogo token={pool.tokenB} size="lg" />
                    </>
                  ) : (
                    <TokenLogo token={pool.token} size="lg" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{pool.name}</p>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                      {pool.multiplier}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Earn {pool.rewardToken.symbol}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-text-secondary">APR</p>
                  <p className="text-xl font-bold text-success">{pool.apr}%</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-text-secondary">TVL</p>
                  <p className="font-semibold">{formatNumber(pool.tvl)}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm text-text-secondary">Earned</p>
                  <p className="font-semibold text-primary">{pool.earned} CONS</p>
                </div>
                {expandedPool === pool.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPool === pool.id && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stake Section */}
                  <div className="bg-surface-light rounded-xl p-4">
                    <h4 className="font-semibold mb-3">Stake {pool.type === 'lp' ? 'LP Tokens' : pool.token.symbol}</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.0"
                        className="input-field flex-1"
                      />
                      <button className="btn-secondary text-sm">Max</button>
                    </div>
                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => handleStake(pool.id)}
                            disabled={isStaking || !stakeAmount}
                            className="btn-primary flex-1 disabled:opacity-50"
                          >
                            {isStaking ? 'Staking...' : 'Stake'}
                          </button>
                          <button
                            onClick={() => {}}
                            disabled={parseFloat(pool.staked) === 0}
                            className="btn-secondary flex-1 disabled:opacity-50"
                          >
                            Unstake
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowWalletModal(true)}
                          className="btn-primary flex-1"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                      Your Staked: {pool.staked} {pool.type === 'lp' ? 'LP' : pool.token.symbol}
                    </p>
                  </div>

                  {/* Rewards Section */}
                  <div className="bg-surface-light rounded-xl p-4">
                    <h4 className="font-semibold mb-3">Rewards</h4>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">{pool.earned}</p>
                        <p className="text-sm text-text-secondary">CONS earned</p>
                      </div>
                      <TokenLogo token={pool.rewardToken} size="xl" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaim(pool.id)}
                        disabled={parseFloat(pool.earned) === 0}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        Claim
                      </button>
                      <button
                        onClick={() => handleCompound(pool.id)}
                        disabled={parseFloat(pool.earned) === 0}
                        className="btn-secondary flex-1 disabled:opacity-50"
                      >
                        Compound
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pool Info */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Deposit Fee</p>
                    <p className="font-medium">0%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Withdrawal Fee</p>
                    <p className="font-medium">0%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Performance Fee</p>
                    <p className="font-medium">2%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Reward Per Block</p>
                    <p className="font-medium">0.5 CONS</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default FarmingPage
