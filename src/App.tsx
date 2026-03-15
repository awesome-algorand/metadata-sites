import { Header } from './components/Header'
import { ProfileHero } from './components/ProfileHero'
import { ProfileAbout } from './components/ProfileAbout'
import { TippingActions } from './components/TippingActions'
import { Footer } from './components/Footer'
import { WalletModal } from './components/WalletModal'
import { useSiteNFD } from './hooks/useSiteNFD'
import { useEffect } from 'react'
import './App.css'

function App() {
  const { siteNfd } = useSiteNFD()

  useEffect(() => {
    document.title = window.location.hostname
  }, [])

  useEffect(() => {
    if (!siteNfd) return

    const avatarUrl = siteNfd.properties?.userDefined?.avatar || siteNfd.properties?.verified?.avatar
    
    if (avatarUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = avatarUrl
        if (!avatarUrl.endsWith('.svg')) {
           link.type = 'image/x-icon'
        }
      } else {
        const newLink = document.createElement('link')
        newLink.rel = 'icon'
        newLink.href = avatarUrl
        document.head.appendChild(newLink)
      }
    }

    if (siteNfd.name) {
      const metadataName = siteNfd.properties?.userDefined?.name
      document.title = metadataName ? `${metadataName} - ${siteNfd.name}` : siteNfd.name
    }
  }, [siteNfd])

  return (
    <>
      <Header />
      <section id="center">
        <ProfileHero />
        <div>
          <ProfileAbout />
          <TippingActions />
        </div>
        <div className="ticks"></div>
        <Footer />
      </section>
      <WalletModal />
    </>
  )
}

export default App
