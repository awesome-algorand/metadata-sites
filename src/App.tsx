import { Header } from './components/Header'
import { ProfileHero } from './components/ProfileHero'
import { ProfileAbout } from './components/ProfileAbout'
import { TippingActions } from './components/TippingActions'
import { Footer } from './components/Footer'
import { WalletModal } from './components/WalletModal'
import { useSiteNFD } from './hooks/useSiteNFD'
import { useEffect } from 'react'

function App() {
  const { nfd: siteNfd } = useSiteNFD()

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

    const redirectTo = siteNfd.properties?.userDefined?.redirectTo
    if (redirectTo) {
      window.location.href = redirectTo
    }
  }, [siteNfd])

  return (
    <>
      <Header />
      <section id="center" className="flex flex-col items-center gap-6 overflow-y-auto px-5 py-10 lg:gap-6.25 lg:px-0 lg:pt-10 lg:pb-0 grow [scrollbar-gutter:stable]">
        <ProfileHero />
        <div className="w-full">
          <ProfileAbout />
          <TippingActions />
        </div>
        <div className="ticks fade-in relative w-full before:absolute before:top-[-4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-border after:absolute after:top-[-4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-border"></div>
        <Footer />
      </section>
      <WalletModal />
    </>
  )
}

export default App
