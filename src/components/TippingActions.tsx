import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import { useModal } from '../hooks/useModal'

export const TippingActions: React.FC = () => {
  const { siteNfd, isLoading } = useSiteNFD()
  const { openModal } = useModal()

  const handleTipClick = (amount: number) => {
    openModal(amount === 0 ? undefined : amount)
  }

  if (isLoading) return null

  if (!siteNfd?.depositAccount) return null

  return (
    <div className="profile-actions fade-in">
      <div className="tip-section">
        <p>Support the owner by sending a tip in ALGO</p>
        <div className="tip-options">
          {[1, 10, 100].map((algoAmount) => (
            <button
              key={algoAmount}
              className="counter tip-button"
              onClick={() => handleTipClick(algoAmount * 1000000)}
            >
              {algoAmount} ALGO
            </button>
          ))}
          <button
            className="counter tip-button"
            onClick={() => handleTipClick(0)} // 0 as a flag for custom/any
          >
            Custom
          </button>
        </div>
      </div>
    </div>
  )
}
