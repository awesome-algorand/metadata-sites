import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import { useModal } from '../hooks/useModal'

export const TippingActions: React.FC = () => {
  const { nfd: siteNfd, isLoading } = useSiteNFD()
  const { openModal } = useModal()

  const handleTipClick = (amount: number) => {
    openModal(amount === 0 ? undefined : amount)
  }

  if (isLoading) return null

  if (!siteNfd?.depositAccount) return null

  return (
    <div className="profile-actions fade-in flex flex-col items-center gap-6 mt-6">
      <div className="tip-section text-center">
        <p className="mb-4 text-text">Support the owner by sending a tip in ALGO</p>
        <div className="tip-options flex flex-wrap justify-center gap-3">
          {[1, 10, 100].map((algoAmount) => (
            <button
              key={algoAmount}
              className="counter tip-button min-w-25 font-bold"
              onClick={() => handleTipClick(algoAmount * 1000000)}
            >
              {algoAmount} ALGO
            </button>
          ))}
          <button
            className="counter tip-button min-w-25 font-bold"
            onClick={() => handleTipClick(0)} // 0 as a flag for custom/any
          >
            Custom
          </button>
        </div>
      </div>
    </div>
  )
}
