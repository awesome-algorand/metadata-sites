import { Header } from './components/Header'
import { ProfileHero } from './components/ProfileHero'
import { ProfileAbout } from './components/ProfileAbout'
import { TippingActions } from './components/TippingActions'
import { Footer } from './components/Footer'
import { WalletModal } from './components/WalletModal'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <section id="center">
        <ProfileHero />
        <div>
          <ProfileAbout />
          <TippingActions />
        </div>
      </section>
      <div className="ticks"></div>
      <Footer />
      <WalletModal />
    </>
  )
}

export default App
