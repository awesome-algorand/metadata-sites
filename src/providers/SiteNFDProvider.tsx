import React, { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { NfdApiClient, type Nfd } from '@txnlab/nfd-sdk'

import { useNetwork } from '@txnlab/use-wallet-react'
import { SiteNFDContext } from "../contexts"

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
    nfdApi.resolve(nfdToLookup, {view: "full"})
      .then((nfd) => {
        setSiteNfd(nfd)
        setIsLoading(false)
      })
      .catch((err) => {
          setError(err)
          setIsLoading(false)
      })
  }, [activeNetwork])

  return (
    <SiteNFDContext.Provider value={{ nfd: siteNfd, isLoading, error }}>
      {children}
    </SiteNFDContext.Provider>
  )
}
