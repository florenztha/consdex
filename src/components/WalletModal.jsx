import React from 'react'
import { X } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

function WalletModal({ isOpen, onClose }) {
  const { connect, isConnecting, error } = useWallet()

  if (!isOpen) return null

  const handleConnect = async (type) => {
    await connect(type)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 bg-surface-light border border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
              alt="MetaMask"
              className="w-10 h-10"
            />
            <div className="text-left">
              <p className="font-semibold">MetaMask</p>
              <p className="text-sm text-text-secondary">Connect using MetaMask</p>
            </div>
          </button>

          <button
            onClick={() => handleConnect('okx')}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 bg-surface-light border border-border rounded-xl hover:border-primary/50 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OKX</span>
            </div>
            <div className="text-left">
              <p className="font-semibold">OKX Wallet</p>
              <p className="text-sm text-text-secondary">Connect using OKX Wallet</p>
            </div>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          By connecting, you agree to the Terms of Service
        </p>
      </div>
    </div>
  )
}

export default WalletModal
