import React, { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NfdApiClient, type Nfd } from '@txnlab/nfd-sdk'
import { useWallet, useNetwork } from '@txnlab/use-wallet-react'

export interface UserNFDContextType {
  userNfd: Nfd | null
  isLoading: boolean
}

export const UserNFDContext = createContext<UserNFDContextType | undefined>(undefined)

export const UserNFDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeAddress } = useWallet()
  const { activeNetwork } = useNetwork()
  const [userNfd, setUserNfd] = useState<Nfd | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (activeAddress) {
      const nfdApi = activeNetwork === 'mainnet' ? NfdApiClient.mainNet() : NfdApiClient.testNet()
      setIsLoading(true)
      nfdApi.reverseLookup([activeAddress]).then((nfds) => {
        if (nfds && nfds[activeAddress]) {
          setUserNfd(nfds[activeAddress])
        } else {
          setUserNfd(null)
        }
        setIsLoading(false)
      }).catch(() => {
        setUserNfd(null)
        setIsLoading(false)
      })
    } else {
      setUserNfd(null)
      setIsLoading(false)
    }
  }, [activeAddress])

  return (
    <UserNFDContext.Provider value={{ userNfd, isLoading }}>
      {children}
    </UserNFDContext.Provider>
  )
}
