import React, { useState, useMemo } from 'react'
import { X, Search, Plus, ExternalLink, Star, AlertCircle } from 'lucide-react'
import { DEFAULT_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import useStore from '../store/useStore'
import TokenLogo from './TokenLogo'

function TokenSelect({ isOpen, onClose, onSelect, excludeToken }) {
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importAddress, setImportAddress] = useState('')
  const [importError, setImportError] = useState('')
  const { customTokens, addCustomToken } = useStore()

  const allTokens = useMemo(() => {
    return [...DEFAULT_TOKENS, ...customTokens]
  }, [customTokens])

  const filteredTokens = useMemo(() => {
    return allTokens.filter(token => {
      if (excludeToken && token.address?.toLowerCase() === excludeToken.address?.toLowerCase()) {
        return false
      }
      if (!search) return true
      
      const searchLower = search.toLowerCase()
      return (
        token.symbol?.toLowerCase().includes(searchLower) ||
        token.name?.toLowerCase().includes(searchLower) ||
        token.address?.toLowerCase().includes(searchLower)
      )
    })
  }, [allTokens, search, excludeToken])

  const handleImport = () => {
    if (!importAddress) {
      setImportError('Please enter a token address')
      return
    }

    // Basic address validation
    if (!/^0x[0-9a-fA-F]{40}$/.test(importAddress)) {
      setImportError('Invalid token address')
      return
    }

    // Check if token already exists
    if (allTokens.some(t => t.address.toLowerCase() === importAddress.toLowerCase())) {
      setImportError('Token already exists')
      return
    }

    const newToken = {
      address: importAddress.toLowerCase(),
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      icon: '?',
      color: '#6b7280',
      isCustom: true,
    }
    
    addCustomToken(newToken)
    setImportAddress('')
    setImportError('')
    setShowImport(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose} 
      />
      
      <div className="relative glass rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slideDown">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Select Token</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-light rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search token name or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.address || token.symbol}
                onClick={() => {
                  onSelect(token)
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-light transition-all duration-200 group"
              >
                <TokenLogo token={token} size="md" />
                <div className="flex-1 text-left">
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
                    {token.isCustom && (
                      <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{token.name}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-light flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary mb-4">No tokens found</p>
              <button
                onClick={() => setShowImport(true)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Import Custom Token
              </button>
            </div>
          )}
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="p-4 border-t border-border animate-fadeIn">
            <p className="text-sm text-text-secondary mb-2">Import Custom Token</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="0x..."
                value={importAddress}
                onChange={(e) => {
                  setImportAddress(e.target.value)
                  setImportError('')
                }}
                className="input-field w-full font-mono"
              />
              {importError && (
                <p className="text-error text-sm">{importError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowImport(false)
                    setImportAddress('')
                    setImportError('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importAddress || !!importError}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setShowImport(!showImport)}
            className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-white transition-colors py-2"
          >
            {showImport ? (
              <>
                <X className="w-4 h-4" />
                Close Import
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Import Custom Token
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenSelect