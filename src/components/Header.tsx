import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import { useUserNFD } from '../hooks/useUserNFD'
import { useModal } from '../hooks/useModal'
import heroImg from '../assets/hero.png'

export const Header: React.FC = () => {
  const { activeAddress, activeWallet } = useWallet()
  const { nfd: siteNfd, isLoading } = useSiteNFD()
  const { nfd: userNfd } = useUserNFD()
  const { openModal } = useModal()
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  const avatarUrl = siteNfd?.properties?.userDefined?.avatar || siteNfd?.properties?.verified?.avatar

  return (
    <header className="site-header sticky top-0 z-100 w-full border-b border-border bg-bg">
      <div className="header-content mx-auto flex max-w-281.5 items-center justify-between px-6 py-3">
        <div className="header-logo flex items-center gap-3">
          {!isLoading && (
            <>
              <img src={avatarUrl || heroImg} alt="Logo" className="mini-avatar fade-in h-8 w-8 rounded-full border border-border object-cover" />
              <span className="site-name fade-in text-[1.1rem] font-semibold text-text-h">{siteNfd?.name || 'NFD Profile'}</span>
            </>
          )}
        </div>
        <div className="wallet-controls">
          <div className="wallet-button-wrapper">
            {!activeAddress ? (
              <button key="connect" className="counter connect-button fade-in" onClick={() => openModal()}>
                Connect Wallet
              </button>
            ) : (
              <div key="account" className="account-dropdown-container fade-in relative">
                <button 
                  className="counter account-button flex items-center gap-2" 
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  {userNfd?.name || `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`}
                  <span className={`dropdown-arrow transition-transform duration-200 ${showAccountDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showAccountDropdown && (
                  <div className="account-dropdown absolute right-0 mt-2 min-w-50 rounded-xl border border-border bg-bg p-1 shadow-custom z-50">
                    <div className="dropdown-info p-3 text-left">
                      <p className="dropdown-label text-[0.75rem] font-bold uppercase tracking-wider text-text-dim">Connected Wallet</p>
                      <p className="dropdown-value font-medium text-text-h">{activeWallet?.metadata.name}</p>
                    </div>
                    <div className="dropdown-divider mx-3 border-t border-border"></div>
                    <button className="dropdown-item w-full bg-none border-none cursor-pointer px-4 py-2.5 text-left text-[0.9rem] text-text transition-colors duration-200 hover:bg-accent-bg hover:text-accent" onClick={() => { openModal(); setShowAccountDropdown(false); }}>
                      Account Details
                    </button>
                    <div className="dropdown-divider mx-3 border-t border-border"></div>
                    <button
                      className="dropdown-item disconnect-button w-full bg-none border-none cursor-pointer px-4 py-2.5 text-left text-[0.9rem] text-red-500 transition-colors duration-200 hover:bg-red-500/10"
                      onClick={() => {
                        activeWallet?.disconnect()
                        setShowAccountDropdown(false)
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
