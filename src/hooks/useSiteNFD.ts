import { useContext } from 'react'
import { SiteNFDContext } from '../contexts.ts'

export const useSiteNFD = () => {
  const context = useContext(SiteNFDContext)
  if (context === undefined) {
    throw new Error('useSiteNFD must be used within a SiteNFDProvider')
  }
  return context
}
