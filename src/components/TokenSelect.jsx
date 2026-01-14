import React, { useState, useMemo } from 'react'
import { X, Search, Plus, ExternalLink } from 'lucide-react'
import { DEFAULT_TOKENS, ZODIAC_TOKENS, NEURA_TESTNET } from '../constants/contracts'
import useStore from '../store/useStore'

function TokenSelect({ isOpen, onClose, onSelect, excludeToken }) {
  const [search, setSearch] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importAddress, setImportAddress] = useState('')
  const { customTokens, addCustomToken } = useStore()

  const allTokens = useMemo(() => {
    const zodiacTokensList = ZODIAC_TOKENS.map((z, i) => ({
      address: `0x${(i + 100).toString(16).padStart(40, '0')}`,
      symbol: z.symbol,
      name: z.name,
      decimals: 18,
      logo: null,
      icon: z.icon,
      color: z.color,
      isZodiac: true,
    }))
    
    return [...DEFAULT_TOKENS, ...zodiacTokensList, ...customTokens]
  }, [customTokens])

  const filteredTokens = useMemo(() => {
    return allTokens.filter(token => {
      if (excludeToken && token.address === excludeToken.address) return false
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      )
    })
  }, [allTokens, search, excludeToken])

  const handleImport = () => {
    if (!importAddress) return
    
    const newToken = {
      address: importAddress,
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      logo: null,
      isCustom: true,
    }
    
    addCustomToken(newToken)
    setImportAddress('')
    setShowImport(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">Select Token</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-light rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => {
                onSelect(token)
                onClose()
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-light transition-colors"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ 
                  background: token.color 
                    ? `linear-gradient(135deg, ${token.color}, ${token.color}88)` 
                    : 'linear-gradient(135deg, #9E7FFF, #38bdf8)' 
                }}
              >
                {token.icon || token.symbol.charAt(0)}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{token.symbol}</p>
                <p className="text-sm text-text-secondary">{token.name}</p>
              </div>
              {token.isZodiac && (
                <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                  Zodiac
                </span>
              )}
            </button>
          ))}

          {filteredTokens.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">No tokens found</p>
              <button
                onClick={() => setShowImport(true)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Import Token
              </button>
            </div>
          )}
        </div>

        {showImport && (
          <div className="p-4 border-t border-border">
            <p className="text-sm text-text-secondary mb-2">Import by address</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x..."
                value={importAddress}
                onChange={(e) => setImportAddress(e.target.value)}
                className="input-field flex-1"
              />
              <button onClick={handleImport} className="btn-primary">
                Import
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setShowImport(!showImport)}
            className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Import Custom Token
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenSelect
