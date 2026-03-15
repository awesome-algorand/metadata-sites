import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import { useUserNFD } from '../hooks/useUserNFD'
import { useModal } from '../hooks/useModal'
import heroImg from '../assets/hero.png'

export const Header: React.FC = () => {
  const { activeAddress, activeWallet } = useWallet()
  const { siteNfd, isLoading } = useSiteNFD()
  const { userNfd } = useUserNFD()
  const { openModal } = useModal()
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  const avatarUrl = siteNfd?.properties?.userDefined?.avatar || siteNfd?.properties?.verified?.avatar

  return (
    <header className="site-header">
      <div className="header-content">
        <div className="header-logo">
          {!isLoading && (
            <>
              <img src={avatarUrl || heroImg} alt="Logo" className="mini-avatar fade-in" />
              <span className="site-name fade-in">{siteNfd?.name || 'NFD Profile'}</span>
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
              <div key="account" className="account-dropdown-container fade-in">
                <button 
                  className="counter account-button" 
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  {userNfd?.name || `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`}
                  <span className={`dropdown-arrow ${showAccountDropdown ? 'open' : ''}`}>▼</span>
                </button>
                {showAccountDropdown && (
                  <div className="account-dropdown">
                    <div className="dropdown-info">
                      <p className="dropdown-label">Connected Wallet</p>
                      <p className="dropdown-value">{activeWallet?.metadata.name}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => { openModal(); setShowAccountDropdown(false); }}>
                      Account Details
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item disconnect-button"
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
