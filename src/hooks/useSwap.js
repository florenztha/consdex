import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import useStore from '../store/useStore'
import { CONTRACTS } from '../constants/contracts'
import { ROUTER_ABI, ERC20_ABI } from '../constants/abis'

export function useSwap() {
  const { address, getProvider } = useWallet()
  const { slippage, addRecentSwap } = useStore()
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState(null)

  const getAmountsOut = useCallback(async (amountIn, path) => {
    try {
      const provider = getProvider()
      if (!provider) return null
      
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, provider)
      const amounts = await router.getAmountsOut(amountIn, path)
      return amounts
    } catch (err) {
      console.error('getAmountsOut error:', err)
      return null
    }
  }, [getProvider])

  const approveToken = async (tokenAddress, amount) => {
    const provider = getProvider()
    const signer = await provider.getSigner()
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    
    const allowance = await token.allowance(address, CONTRACTS.SWAP_ROUTER)
    if (allowance < amount) {
      const tx = await token.approve(CONTRACTS.SWAP_ROUTER, ethers.MaxUint256)
      await tx.wait()
    }
  }

  const swap = async (tokenIn, tokenOut, amountIn, amountOutMin) => {
    setIsSwapping(true)
    setError(null)
    
    try {
      const provider = getProvider()
      const signer = await provider.getSigner()
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, signer)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20
      const path = [tokenIn.address, tokenOut.address]
      
      let tx
      
      if (tokenIn.isNative) {
        // ETH -> Token
        tx = await router.swapExactETHForTokens(
          amountOutMin,
          [CONTRACTS.wANKR, tokenOut.address],
          address,
          deadline,
          { value: amountIn }
        )
      } else if (tokenOut.isNative) {
        // Token -> ETH
        await approveToken(tokenIn.address, amountIn)
        tx = await router.swapExactTokensForETH(
          amountIn,
          amountOutMin,
          [tokenIn.address, CONTRACTS.wANKR],
          address,
          deadline
        )
      } else {
        // Token -> Token
        await approveToken(tokenIn.address, amountIn)
        tx = await router.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          address,
          deadline
        )
      }
      
      const receipt = await tx.wait()
      
      addRecentSwap({
        hash: receipt.hash,
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn: ethers.formatUnits(amountIn, tokenIn.decimals),
        amountOut: ethers.formatUnits(amountOutMin, tokenOut.decimals),
        timestamp: Date.now(),
        status: 'success',
      })
      
      return receipt
    } catch (err) {
      setError(err.message)
      addRecentSwap({
        hash: '',
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn: ethers.formatUnits(amountIn, tokenIn.decimals),
        amountOut: '0',
        timestamp: Date.now(),
        status: 'failed',
      })
      throw err
    } finally {
      setIsSwapping(false)
    }
  }

  const calculatePriceImpact = (amountIn, amountOut, reserveIn, reserveOut) => {
    if (!reserveIn || !reserveOut || reserveIn === 0n) return 0
    
    const spotPrice = Number(reserveOut) / Number(reserveIn)
    const executionPrice = Number(amountOut) / Number(amountIn)
    const impact = ((spotPrice - executionPrice) / spotPrice) * 100
    
    return Math.max(0, impact)
  }

  return {
    swap,
    getAmountsOut,
    calculatePriceImpact,
    isSwapping,
    error,
    slippage,
  }
}
