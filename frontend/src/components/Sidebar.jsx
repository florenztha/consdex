import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  ArrowLeftRight, 
  Droplets, 
  LayoutGrid, 
  Sprout, 
  User, 
  Droplet,
  Rocket,
  Twitter
} from 'lucide-react'

const navItems = [
  { path: '/swap', icon: ArrowLeftRight, label: 'Swap' },
  { path: '/liquidity', icon: Droplets, label: 'Liquidity' },
  { path: '/pools', icon: LayoutGrid, label: 'Pools' },
  { path: '/farming', icon: Sprout, label: 'Farming' },
  { path: '/account', icon: User, label: 'Account' },
  { path: '/faucet', icon: Droplet, label: 'Faucet' },
  { path: '/deploy', icon: Rocket, label: 'Deploy Token' },
]

function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-border/50 hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
                  : 'text-text-secondary hover:text-white hover:bg-surface-light'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <a
          href="https://x.com/nuflorenz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-surface-light transition-all"
        >
          <Twitter className="w-5 h-5" />
          <span className="font-medium">@nuflorenz</span>
        </a>
        <div className="mt-4 px-4">
          <p className="text-xs text-text-secondary">
            Built on Neura Testnet
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Chain ID: 267
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
