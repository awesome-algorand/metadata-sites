import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import heroImg from '../assets/hero.png'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'

export const ProfileHero: React.FC = () => {
  const { nfd: siteNfd, isLoading } = useSiteNFD()
  
  if (isLoading) return null

  const avatarUrl = siteNfd?.properties?.userDefined?.avatar || siteNfd?.properties?.verified?.avatar
  const bannerUrl = siteNfd?.properties?.userDefined?.banner || siteNfd?.properties?.verified?.banner
  const metadataName = siteNfd?.properties?.userDefined?.name

  return (
    <div className="fade-in w-full">
      {bannerUrl && (
        <div className="banner-container h-50 w-full overflow-hidden border-b border-border -mb-21.25">
          <img src={bannerUrl} alt="NFD Banner" className="banner h-full w-full object-cover" />
        </div>
      )}
      <div className="hero relative z-1">
        {avatarUrl ? (
          <img src={avatarUrl} className="base avatar mx-auto rounded-full border-4 border-bg object-cover shadow-custom" width="170" height="170" alt="NFD Avatar" />
        ) : (
          <div className="relative mx-auto w-42.5">
            <img src={heroImg} className="base relative z-0 mx-auto w-42.5" width="170" height="179" alt="" />
            <img src={reactLogo} className="framework absolute top-8.5 left-0 right-0 mx-auto h-7 z-1 transform-[perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]" alt="React logo" />
            <img src={viteLogo} className="vite absolute top-26.75 left-0 right-0 mx-auto h-6.5 w-auto z-0 transform-[perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]" alt="Vite logo" />
          </div>
        )}
      </div>
      <h1 className="hero-name mt-4 mb-0 text-3xl font-bold text-text-h lg:text-5xl">{metadataName || siteNfd?.name || 'NFD Profile'}</h1>
    </div>
  )
}
