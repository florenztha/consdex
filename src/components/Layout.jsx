import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import StarBackground from './StarBackground'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarBackground />
      <div className="relative z-10">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
