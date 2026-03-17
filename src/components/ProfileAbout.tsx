import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'

export const ProfileAbout: React.FC = () => {
  const { nfd: siteNfd, isLoading } = useSiteNFD()
  
  if (isLoading || !siteNfd) return null

  const bio = siteNfd.properties?.userDefined?.bio || siteNfd.properties?.verified?.bio
  const userDefinedProperties = siteNfd.properties?.userDefined
    ? Object.entries(siteNfd.properties.userDefined).filter(([key]) => !['avatar', 'banner', 'bio', 'dns', 'name'].includes(key.toLowerCase()))
    : []

  return (
    <div className="fade-in w-full max-w-150 mx-auto">
      {bio && <p className="bio italic text-text mb-4 mx-auto!">{bio}</p>}

      {userDefinedProperties.length > 0 && (
        <div className="properties mt-6 rounded-xl border border-border bg-social-bg p-5 text-left shadow-sm">
          <h3 className="mt-0 mb-3 border-b border-border pb-2 text-lg font-semibold text-text-h">About</h3>
          <ul className="list-none p-0 m-0">
            {userDefinedProperties.map(([key, value]) => (
              <li key={key} className="mb-2 last:mb-0">
                <strong className="font-semibold text-text-h capitalize">{key}:</strong> {value.startsWith('http') ? <a href={value} target="_blank" rel="noreferrer" className="text-accent underline transition-colors hover:text-accent/80">{value}</a> : <span className="text-text">{value}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
