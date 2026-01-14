import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, Droplets, Plus, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { DEFAULT_TOKENS, ZODIAC_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import TokenLogo from '../components/TokenLogo'

// Mock pool data
const MOCK_POOLS = [
  {
    id: 1,
    tokenA: DEFAULT_TOKENS[0],
    tokenB: DEFAULT_TOKENS[2],
    tvl: 125000,
    volume24h: 45000,
    apr: 24.5,
    lpBalance: '1250.00',
  },
  {
    id: 2,
    tokenA: DEFAULT_TOKENS[1],
    tokenB: DEFAULT_TOKENS[3],
    tvl: 89000,
    volume24h: 32000,
    apr: 18.2,
    lpBalance: '0',
  },
  {
    id: 3,
    tokenA: DEFAULT_TOKENS[0],
    tokenB: DEFAULT_TOKENS[3],
    tvl: 67000,
    volume24h: 28000,
    apr: 21.8,
    lpBalance: '500.00',
  },
  ...ZODIAC_TOKENS.slice(0, 6).map((zodiac, i) => ({
    id: i + 4,
    tokenA: {
      symbol: zodiac.symbol,
      name: zodiac.name,
      icon: zodiac.icon,
      color: zodiac.color,
    },
    tokenB: DEFAULT_TOKENS[2],
    tvl: Math.floor(Math.random() * 50000) + 10000,
    volume24h: Math.floor(Math.random() * 20000) + 5000,
    apr: (Math.random() * 30 + 10).toFixed(1),
    lpBalance: Math.random() > 0.5 ? (Math.random() * 1000).toFixed(2) : '0',
  })),
]

function PoolsPage() {
  const { isConnected } = useWallet()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('tvl')
  const [pools, setPools] = useState(MOCK_POOLS)

  const filteredPools = pools
    .filter(pool => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        pool.tokenA.symbol.toLowerCase().includes(searchLower) ||
        pool.tokenB.symbol.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'tvl') return b.tvl - a.tvl
      if (sortBy === 'volume') return b.volume24h - a.volume24h
      if (sortBy === 'apr') return parseFloat(b.apr) - parseFloat(a.apr)
      return 0
    })

  const formatNumber = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Pools</h1>
        <p className="text-text-secondary">Explore liquidity pools and earn fees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total TVL</p>
              <p className="text-xl font-bold">
                {formatNumber(pools.reduce((acc, p) => acc + p.tvl, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">24h Volume</p>
              <p className="text-xl font-bold">
                {formatNumber(pools.reduce((acc, p) => acc + p.volume24h, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-xl">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Pools</p>
              <p className="text-xl font-bold">{pools.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search pools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'tvl', label: 'TVL' },
            { key: 'volume', label: 'Volume' },
            { key: 'apr', label: 'APR' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-4 py-2 rounded-xl transition-all ${
                sortBy === key
                  ? 'bg-primary text-white'
                  : 'bg-surface-light hover:bg-surface text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pools Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-text-secondary font-medium">Pool</th>
                <th className="text-right py-4 px-4 text-text-secondary font-medium">TVL</th>
                <th className="text-right py-4 px-4 text-text-secondary font-medium">Volume 24h</th>
                <th className="text-right py-4 px-4 text-text-secondary font-medium">APR</th>
                <th className="text-right py-4 px-4 text-text-secondary font-medium">Your LP</th>
                <th className="text-right py-4 px-4 text-text-secondary font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPools.map((pool) => (
                <tr key={pool.id} className="border-b border-border/50 hover:bg-surface-light/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <TokenLogo token={pool.tokenA} size="md" />
                        <TokenLogo token={pool.tokenB} size="md" />
                      </div>
                      <div>
                        <p className="font-semibold">{pool.tokenA.symbol}/{pool.tokenB.symbol}</p>
                        <p className="text-sm text-text-secondary">0.3% fee</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 font-medium">
                    {formatNumber(pool.tvl)}
                  </td>
                  <td className="text-right py-4 px-4 font-medium">
                    {formatNumber(pool.volume24h)}
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="text-success font-semibold">{pool.apr}%</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    {parseFloat(pool.lpBalance) > 0 ? (
                      <span className="text-primary font-medium">{pool.lpBalance} LP</span>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                  <td className="text-right py-4 px-4">
                    <Link
                      to="/liquidity"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No pools found</p>
        </div>
      )}
    </div>
  )
}

export default PoolsPage
