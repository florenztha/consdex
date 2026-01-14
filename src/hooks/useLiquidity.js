import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import { CONTRACTS } from '../constants/contracts'
import { ROUTER_ABI, FACTORY_ABI, PAIR_ABI, ERC20_ABI } from '../constants/abis'

export function useLiquidity() {
  const { address, getProvider } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getPair = useCallback(async (tokenA, tokenB) => {
    try {
      const provider = getProvider()
      if (!provider) return null
      
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, provider)
      const factoryAddress = await router.factory()
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider)
      
      const pairAddress = await factory.getPair(tokenA, tokenB)
      if (pairAddress === ethers.ZeroAddress) return null
      
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider)
      const [reserve0, reserve1] = await pair.getReserves()
      const token0 = await pair.token0()
      const totalSupply = await pair.totalSupply()
      const lpBalance = address ? await pair.balanceOf(address) : 0n
      
      return {
        address: pairAddress,
        token0,
        reserve0,
        reserve1,
        totalSupply,
        lpBalance,
      }
    } catch (err) {
      console.error('getPair error:', err)
      return null
    }
  }, [address, getProvider])

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

  const addLiquidity = async (tokenA, tokenB, amountA, amountB, slippage = 0.5) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const provider = getProvider()
      const signer = await provider.getSigner()
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, signer)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20
      const slippageMultiplier = BigInt(Math.floor((100 - slippage) * 100))
      
      const amountAMin = (amountA * slippageMultiplier) / 10000n
      const amountBMin = (amountB * slippageMultiplier) / 10000n
      
      let tx
      
      if (tokenA.isNative) {
        await approveToken(tokenB.address, amountB)
        tx = await router.addLiquidityETH(
          tokenB.address,
          amountB,
          amountBMin,
          amountAMin,
          address,
          deadline,
          { value: amountA }
        )
      } else if (tokenB.isNative) {
        await approveToken(tokenA.address, amountA)
        tx = await router.addLiquidityETH(
          tokenA.address,
          amountA,
          amountAMin,
          amountBMin,
          address,
          deadline,
          { value: amountB }
        )
      } else {
        await approveToken(tokenA.address, amountA)
        await approveToken(tokenB.address, amountB)
        tx = await router.addLiquidity(
          tokenA.address,
          tokenB.address,
          amountA,
          amountB,
          amountAMin,
          amountBMin,
          address,
          deadline
        )
      }
      
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeLiquidity = async (tokenA, tokenB, liquidity, slippage = 0.5) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const provider = getProvider()
      const signer = await provider.getSigner()
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, signer)
      
      // Get pair and approve LP tokens
      const routerContract = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, provider)
      const factoryAddress = await routerContract.factory()
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider)
      const pairAddress = await factory.getPair(
        tokenA.isNative ? CONTRACTS.wANKR : tokenA.address,
        tokenB.isNative ? CONTRACTS.wANKR : tokenB.address
      )
      
      await approveToken(pairAddress, liquidity)
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20
      
      let tx
      
      if (tokenA.isNative || tokenB.isNative) {
        const token = tokenA.isNative ? tokenB : tokenA
        tx = await router.removeLiquidityETH(
          token.address,
          liquidity,
          0,
          0,
          address,
          deadline
        )
      } else {
        tx = await router.removeLiquidity(
          tokenA.address,
          tokenB.address,
          liquidity,
          0,
          0,
          address,
          deadline
        )
      }
      
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createPair = async (tokenA, tokenB) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const provider = getProvider()
      const signer = await provider.getSigner()
      const router = new ethers.Contract(CONTRACTS.SWAP_ROUTER, ROUTER_ABI, provider)
      const factoryAddress = await router.factory()
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer)
      
      const tx = await factory.createPair(
        tokenA.isNative ? CONTRACTS.wANKR : tokenA.address,
        tokenB.isNative ? CONTRACTS.wANKR : tokenB.address
      )
      
      const receipt = await tx.wait()
      return receipt
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getPair,
    addLiquidity,
    removeLiquidity,
    createPair,
    isLoading,
    error,
  }
}
