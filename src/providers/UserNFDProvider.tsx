import React, { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NfdApiClient, type Nfd } from '@txnlab/nfd-sdk'
import { useWallet, useNetwork } from '@txnlab/use-wallet-react'
import { UserNFDContext } from "../contexts"


export const UserNFDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeAddress } = useWallet()
  const { activeNetwork } = useNetwork()

  const [userNfd, setUserNfd] = useState<Nfd | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (activeAddress) {
      const nfdApi = activeNetwork === 'mainnet' ? NfdApiClient.mainNet() : NfdApiClient.testNet()
      nfdApi.reverseLookup([activeAddress], {view: "full"}).then((nfds) => {
        if (nfds && nfds[activeAddress]) {
          setUserNfd(nfds[activeAddress])
        } else {
          setUserNfd(null)
        }
        setIsLoading(false)
      }).catch(() => {
        setUserNfd(null)
        setIsLoading(false)
        setError(new Error('Failed to fetch NFD'))
      })
    }
  }, [activeAddress, activeNetwork])

  return (
    <UserNFDContext.Provider value={{ nfd: userNfd, isLoading, error }}>
      {children}
    </UserNFDContext.Provider>
  )
}
