import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SwapPage from './pages/SwapPage'
import LiquidityPage from './pages/LiquidityPage'
import PoolsPage from './pages/PoolsPage'
import FarmingPage from './pages/FarmingPage'
import AccountPage from './pages/AccountPage'
import FaucetPage from './pages/FaucetPage'
import TokenDeployPage from './pages/TokenDeployPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SwapPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/liquidity" element={<LiquidityPage />} />
        <Route path="/pools" element={<PoolsPage />} />
        <Route path="/farming" element={<FarmingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/faucet" element={<FaucetPage />} />
        <Route path="/deploy" element={<TokenDeployPage />} />
      </Routes>
    </Layout>
  )
}

export default App
