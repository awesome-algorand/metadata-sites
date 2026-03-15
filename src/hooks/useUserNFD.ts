import { useContext } from 'react'
import { UserNFDContext } from '../providers/UserNFDProvider'

export const useUserNFD = () => {
  const context = useContext(UserNFDContext)
  if (context === undefined) {
    throw new Error('useUserNFD must be used within a UserNFDProvider')
  }
  return context
}
