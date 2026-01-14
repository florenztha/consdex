import React, { useState, useEffect } from 'react'
import { 
  Wallet, 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  Search,
  TrendingUp,
  Coins,
  Droplets,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { DEFAULT_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import TokenLogo from '../components/TokenLogo'
import TokenSelect from '../components/TokenSelect'
import WalletModal from '../components/WalletModal'
import useStore from '../store/useStore'

function AccountPage() {
  const { address, isConnected, balances, refreshBalances, getTokenBalance } = useWallet()
  const { dynamicTokens } = useStore()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendToken, setSendToken] = useState(DEFAULT_TOKENS[0])
  const [sendAmount, setSendAmount] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [showTokenSelect, setShowTokenSelect] = useState(false)
  const [explorerSearch, setExplorerSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refresh balances on mount
  useEffect(() => {
    if (isConnected) {
      refreshBalances()
    }
  }, [isConnected])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // GET BALANCE FUNCTION - SEDERHANA DAN PASTI BEKERJA
  const getBalance = (token) => {
    if (!token) return '0'
    
    // Coba ambil dari balances store berdasarkan symbol
    const storeBalances = useStore.getState().balances
    
    // Priority 1: Cari langsung dengan symbol
    if (storeBalances[token.symbol] !== undefined) {
      return storeBalances[token.symbol]
    }
    
    // Priority 2: Jika token native, cari 'native' atau 'ANKR'
    if (token.isNative) {
      return storeBalances['native'] || storeBalances['ANKR'] || '0'
    }
    
    // Priority 3: Cari dengan address lowercase
    if (token.address) {
      const addr = token.address.toLowerCase()
      if (storeBalances[addr] !== undefined) {
        return storeBalances[addr]
      }
    }
    
    return '0'
  }

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalances()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // All tokens including dynamic
  const allTokens = [...DEFAULT_TOKENS, ...dynamicTokens]

  // Filter tokens berdasarkan category dan search
  const filteredTokens = allTokens.filter(token => {
    // Filter by category
    if (filter === 'zodiac' && !token.isZodiac) return false
    if (filter === 'stable' && !token.isStable) return false
    if (filter === 'native' && !token.isNative && token.symbol !== 'CONS') return false
    if (filter === 'other' && (token.isZodiac || token.isStable || token.isNative || token.symbol === 'CONS')) return false
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const handleSend = async () => {
    // Mock send function - bisa diimplementasi nanti
    console.log('Sending', sendAmount, sendToken.symbol, 'to', sendTo)
    
    // Untuk demo: tampilkan alert
    alert(`Mengirim ${sendAmount} ${sendToken.symbol} ke ${sendTo}`)
    
    setShowSendModal(false)
    setSendAmount('')
    setSendTo('')
    
    // Refresh balances setelah send
    await refreshBalances()
  }

  const handleExplorerSearch = () => {
    if (explorerSearch.trim()) {
      // Validasi jika itu address atau tx hash
      if (explorerSearch.startsWith('0x')) {
        window.open(`${NEURA_TESTNET.blockExplorer}/search?q=${explorerSearch}`, '_blank')
      } else {
        // Jika bukan address, coba cari sebagai block number
        window.open(`${NEURA_TESTNET.blockExplorer}/block/${explorerSearch}`, '_blank')
      }
    }
  }

  // Debug log untuk melihat balances
  useEffect(() => {
    if (isConnected && balances) {
      console.log('[AccountPage] Current balances:', balances)
      console.log('[AccountPage] Dynamic tokens:', dynamicTokens)
      console.log('[AccountPage] All tokens count:', allTokens.length)
      console.log('[AccountPage] Filtered tokens count:', filteredTokens.length)
      
      // Log setiap token dengan balance-nya
      filteredTokens.forEach(token => {
        console.log(`[AccountPage] ${token.symbol}:`, {
          address: token.address,
          balance: getBalance(token),
          isNative: token.isNative,
          isStable: token.isStable
        })
      })
    }
  }, [balances, filteredTokens, isConnected, dynamicTokens, allTokens])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Wallet className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-text-secondary mb-6">
          Connect your wallet to view your account details, balances, and transaction history.
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
        <h1 className="text-2xl font-display font-bold">Account</h1>
        <p className="text-text-secondary">Manage your wallet and assets</p>
      </div>

      {/* Wallet Info */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                </p>
                <button onClick={copyAddress} className="p-1 hover:bg-surface-light rounded">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSendModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
            <a
              href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Explorer
            </a>
          </div>
        </div>
      </div>

      {/* Stats - Hanya token count, tanpa total value karena belum ada harga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Tokens</p>
              <p className="text-xl font-bold">{DEFAULT_TOKENS.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Network</p>
              <p className="text-xl font-bold">Neura Testnet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-lg">Token Balances</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 w-40"
              />
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`p-2 bg-surface-light rounded-xl hover:bg-surface ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh balances"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {/* Filter buttons */}
            <div className="flex gap-1 bg-surface-light p-1 rounded-xl">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('native')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === 'native' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Native
              </button>
              <button
                onClick={() => setFilter('stable')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === 'stable' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Stable
              </button>
              <button
                onClick={() => setFilter('zodiac')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === 'zodiac' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Zodiac
              </button>
              <button
                onClick={() => setFilter('other')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === 'other' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Other
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug Info - bisa dihapus nanti */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-surface-light rounded-xl text-xs">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Debug Info:</span>
            </div>
            <div className="font-mono text-xs break-all">
              Wallet: {address}<br/>
              Total tokens in list: {DEFAULT_TOKENS.length}<br/>
              Filtered tokens: {filteredTokens.length}<br/>
              Balances in store: {Object.keys(balances).length}
            </div>
          </div>
        )}
        
        {/* Token List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const balance = getBalance(token)
              const balanceNum = parseFloat(balance)
              
              return (
                <div
                  key={token.address || token.symbol}
                  className="flex items-center justify-between p-4 bg-surface-light rounded-xl hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TokenLogo token={token} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{token.symbol}</p>
                        {token.isZodiac && (
                          <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                            Zodiac
                          </span>
                        )}
                        {token.isStable && (
                          <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                            Stable
                          </span>
                        )}
                        {token.isNative && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-xs rounded-full">
                            Native
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {balanceNum >= 1000000
                        ? `${(balanceNum / 1000000).toFixed(2)}M`
                        : balanceNum >= 1000
                        ? `${(balanceNum / 1000).toFixed(2)}K`
                        : balanceNum > 0
                        ? balanceNum.toLocaleString('en-US', {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 8
                          })
                        : '0.0000'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {token.address ? `(${token.address.slice(0, 6)}...${token.address.slice(-4)})` : 'Native Token'}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
              <p className="text-text-secondary">No tokens found</p>
              <p className="text-sm text-text-secondary mt-1">
                Try changing your filter or search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Explorer Search */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Block Explorer</h3>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search address, tx hash, block..."
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleExplorerSearch()}
              className="input-field w-full pl-10 font-mono text-sm"
            />
          </div>
          <button onClick={handleExplorerSearch} className="btn-primary">
            Search
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={NEURA_TESTNET.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-surface-light rounded-lg text-sm hover:bg-surface transition-colors"
          >
            Home
          </a>
          <a
            href={`${NEURA_TESTNET.blockExplorer}/blocks`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-surface-light rounded-lg text-sm hover:bg-surface transition-colors"
          >
            Blocks
          </a>
          <a
            href={`${NEURA_TESTNET.blockExplorer}/txs`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-surface-light rounded-lg text-sm hover:bg-surface transition-colors"
          >
            Transactions
          </a>
          <a
            href={`${NEURA_TESTNET.blockExplorer}/tokens`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-surface-light rounded-lg text-sm hover:bg-surface transition-colors"
          >
            Tokens
          </a>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSendModal(false)} />
          <div className="relative glass rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-display font-bold mb-6">Send Tokens</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Token</label>
                <button
                  onClick={() => setShowTokenSelect(true)}
                  className="w-full flex items-center justify-between p-3 bg-surface-light rounded-xl hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TokenLogo token={sendToken} size="md" />
                    <div className="text-left">
                      <span className="font-semibold">{sendToken.symbol}</span>
                      <p className="text-xs text-text-secondary">
                        Balance: {getBalance(sendToken)}
                      </p>
                    </div>
                  </div>
                  <span className="text-text-secondary">▼</span>
                </button>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">Amount</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.0"
                  className="input-field w-full"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const balance = parseFloat(getBalance(sendToken))
                        const amount = (balance * pct / 100).toFixed(6)
                        setSendAmount(amount)
                      }}
                      className="flex-1 py-1 text-xs bg-surface-light rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">Recipient Address</label>
                <input
                  type="text"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="0x..."
                  className="input-field w-full font-mono"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!sendAmount || !sendTo}
                className="btn-primary w-full disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <TokenSelect
        isOpen={showTokenSelect}
        onClose={() => setShowTokenSelect(false)}
        onSelect={(token) => {
          setSendToken(token)
          setShowTokenSelect(false)
        }}
      />

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}

export default AccountPage