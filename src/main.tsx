import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NetworkId, WalletProvider, WalletManager } from '@txnlab/use-wallet-react'
import { pera } from '@txnlab/use-wallet-pera'
import { defly } from '@txnlab/use-wallet-defly'
import { lute } from '@txnlab/use-wallet-lute'
import { SiteNFDProvider } from './providers/SiteNFDProvider'
import { UserNFDProvider } from './providers/UserNFDProvider'
import { ModalProvider } from './providers/ModalProvider'
import './index.css'
import App from './App.tsx'

const walletManager = new WalletManager({
  wallets: [
    pera(),
    defly(),
    lute({ siteName: 'NFD Example Site' }),
  ],
  defaultNetwork: NetworkId.MAINNET,
})

const Root = () => {
  return (
    <StrictMode>
      <WalletProvider manager={walletManager}>
        <SiteNFDProvider>
          <UserNFDProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </UserNFDProvider>
        </SiteNFDProvider>
      </WalletProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
