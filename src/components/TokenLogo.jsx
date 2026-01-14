import React from 'react'

function TokenLogo({ token, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
  }

  const getGradient = () => {
    if (token?.color) {
      return `linear-gradient(135deg, ${token.color}, ${token.color}88)`
    }
    
    const colors = {
      ANKR: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      wANKR: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      ztUSD: 'linear-gradient(135deg, #10B981, #059669)',
      USDT: 'linear-gradient(135deg, #22C55E, #16A34A)',
      CONS: 'linear-gradient(135deg, #9E7FFF, #F472B6)',
    }
    
    return colors[token?.symbol] || 'linear-gradient(135deg, #9E7FFF, #38bdf8)'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold`}
      style={{ background: getGradient() }}
    >
      {token?.icon || token?.symbol?.charAt(0) || '?'}
    </div>
  )
}

export default TokenLogo
