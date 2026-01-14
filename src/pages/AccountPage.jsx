import React, { useState } from 'react'
import { 
  Wallet, 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  Search,
  TrendingUp,
  Coins,
  Droplets
} from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { DEFAULT_TOKENS, ZODIAC_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import TokenLogo from '../components/TokenLogo'
import TokenSelect from '../components/TokenSelect'
import WalletModal from '../components/WalletModal'

function AccountPage() {
  const { address, isConnected, balances } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendToken, setSendToken] = useState(DEFAULT_TOKENS[0])
  const [sendAmount, setSendAmount] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [showTokenSelect, setShowTokenSelect] = useState(false)
  const [explorerSearch, setExplorerSearch] = useState('')
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getBalance = (token) => {
    if (!token) return '0'
    const key = token.isNative ? 'native' : token.address
    return balances[key] || '0'
  }

  const allTokens = [
    ...DEFAULT_TOKENS,
    ...ZODIAC_TOKENS.map((z, i) => ({
      address: `0x${(i + 100).toString(16).padStart(40, '0')}`,
      symbol: z.symbol,
      name: z.name,
      decimals: 18,
      icon: z.icon,
      color: z.color,
    })),
  ]

  const handleSend = async () => {
    // Mock send transaction
    console.log('Sending', sendAmount, sendToken.symbol, 'to', sendTo)
    setShowSendModal(false)
    setSendAmount('')
    setSendTo('')
  }

  const handleExplorerSearch = () => {
    if (explorerSearch) {
      window.open(`${NEURA_TESTNET.blockExplorer}/search?q=${explorerSearch}`, '_blank')
    }
  }

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
                  {address.slice(0, 10)}...{address.slice(-8)}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Balance</p>
              <p className="text-xl font-bold">
                ${(parseFloat(getBalance(DEFAULT_TOKENS[0])) * 0.5 + 
                   parseFloat(getBalance(DEFAULT_TOKENS[2])) + 
                   parseFloat(getBalance(DEFAULT_TOKENS[3]))).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <Droplets className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">LP Tokens</p>
              <p className="text-xl font-bold">3 Pools</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Staked</p>
              <p className="text-xl font-bold">$1,250.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="card mb-6">
        <h3 className="font-semibold text-lg mb-4">Token Balances</h3>
        <div className="space-y-3">
          {allTokens.map((token) => {
            const balance = getBalance(token)
            return (
              <div
                key={token.address || token.symbol}
                className="flex items-center justify-between p-3 bg-surface-light rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <TokenLogo token={token} size="md" />
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-text-secondary">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{parseFloat(balance).toFixed(4)}</p>
                  <p className="text-sm text-text-secondary">
                    ${(parseFloat(balance) * (token.symbol === 'ANKR' ? 0.5 : 1)).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
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
              className="input-field w-full pl-10"
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
                    <span className="font-semibold">{sendToken.symbol}</span>
                  </div>
                  <span className="text-text-secondary">
                    Balance: {parseFloat(getBalance(sendToken)).toFixed(4)}
                  </span>
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
