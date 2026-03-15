import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import heroImg from '../assets/hero.png'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'

export const ProfileHero: React.FC = () => {
  const { siteNfd, isLoading } = useSiteNFD()
  
  if (isLoading) return null

  const avatarUrl = siteNfd?.properties?.userDefined?.avatar || siteNfd?.properties?.verified?.avatar
  const bannerUrl = siteNfd?.properties?.userDefined?.banner || siteNfd?.properties?.verified?.banner
  const metadataName = siteNfd?.properties?.userDefined?.name

  return (
    <div className="fade-in">
      {bannerUrl && (
        <div className="banner-container">
          <img src={bannerUrl} alt="NFD Banner" className="banner" />
        </div>
      )}
      <div className="hero">
        {avatarUrl ? (
          <img src={avatarUrl} className="base avatar" width="170" height="170" alt="NFD Avatar" />
        ) : (
          <>
            <img src={heroImg} className="base" width="170" height="179" alt="" />
            <img src={reactLogo} className="framework" alt="React logo" />
            <img src={viteLogo} className="vite" alt="Vite logo" />
          </>
        )}
      </div>
      <h1 className="hero-name">{metadataName || siteNfd?.name || 'NFD Profile'}</h1>
    </div>
  )
}
