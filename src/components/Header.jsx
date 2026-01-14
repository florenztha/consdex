import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Wallet, ChevronDown, ExternalLink, Copy, Check } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { NEURA_TESTNET } from '../constants/contracts'
import WalletModal from './WalletModal'

function Header() {
  const { address, isConnected, disconnect, chainId } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isWrongNetwork = chainId && chainId !== NEURA_TESTNET.chainId

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-xl">✦</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Constellation
              </h1>
              <p className="text-xs text-text-secondary -mt-1">DEX</p>
            </div>
          </Link>

          {/* Network Badge & Wallet */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                isWrongNetwork ? 'bg-error/20 text-error' : 'bg-success/20 text-success'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-error' : 'bg-success'} animate-pulse`} />
                {isWrongNetwork ? 'Wrong Network' : 'Neura Testnet'}
              </div>
            )}

            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-surface-light border border-border rounded-xl px-4 py-2 hover:border-primary/50 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <span className="font-medium">{formatAddress(address)}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 glass rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm text-text-secondary mb-1">Connected Wallet</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{formatAddress(address)}</span>
                        <button onClick={copyAddress} className="p-1 hover:bg-surface rounded">
                          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <a
                        href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Explorer
                      </a>
                      <button
                        onClick={() => {
                          disconnect()
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors text-error"
                      >
                        <X className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-surface-light rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
    </>
  )
}

export default Header
