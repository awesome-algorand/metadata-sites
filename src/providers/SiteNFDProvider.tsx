import React, { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NfdApiClient, type Nfd } from '@txnlab/nfd-sdk'

import { useNetwork } from '@txnlab/use-wallet-react'

export interface SiteNFDContextType {
  siteNfd: Nfd | null
  isLoading: boolean
  error: Error | null
}

export const SiteNFDContext = createContext<SiteNFDContextType | undefined>(undefined)

export const SiteNFDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { activeNetwork } = useNetwork()
  const [siteNfd, setSiteNfd] = useState<Nfd | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const nfdApi = activeNetwork === 'mainnet' ? NfdApiClient.mainNet() : NfdApiClient.testNet()
    const hostname = window.location.hostname
    let nfdToLookup = 'shoretech.algo'

    if (hostname.endsWith('.algo.xyz')) {
      nfdToLookup = hostname.replace('.xyz', '')
    } else if (hostname.endsWith('.algo')) {
      nfdToLookup = hostname
    }

    setIsLoading(true)
    nfdApi.resolve(nfdToLookup, {view: "full"})
      .then((nfd) => {
        setSiteNfd(nfd)
        setIsLoading(false)
      })
      .catch((err) => {
        if (nfdToLookup !== 'shoretech.algo') {
          nfdApi.resolve('shoretech.algo')
            .then((nfd) => {
              setSiteNfd(nfd)
              setIsLoading(false)
            })
            .catch((e) => {
              setError(e)
              setIsLoading(false)
            })
        } else {
          setError(err)
          setIsLoading(false)
        }
      })
  }, [])

  return (
    <SiteNFDContext.Provider value={{ siteNfd, isLoading, error }}>
      {children}
    </SiteNFDContext.Provider>
  )
}
