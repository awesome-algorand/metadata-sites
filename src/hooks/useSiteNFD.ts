import { useContext } from 'react'
import { SiteNFDContext } from '../providers/SiteNFDProvider'

export const useSiteNFD = () => {
  const context = useContext(SiteNFDContext)
  if (context === undefined) {
    throw new Error('useSiteNFD must be used within a SiteNFDProvider')
  }
  return context
}
