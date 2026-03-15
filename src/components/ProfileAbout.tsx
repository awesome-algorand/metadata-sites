import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'

export const ProfileAbout: React.FC = () => {
  const { siteNfd, isLoading } = useSiteNFD()
  
  if (isLoading) return null

  const bio = siteNfd?.properties?.userDefined?.bio || siteNfd?.properties?.verified?.bio
  const userDefinedProperties = siteNfd?.properties?.userDefined
    ? Object.entries(siteNfd.properties.userDefined).filter(([key]) => !['avatar', 'banner', 'bio', 'dns', 'name'].includes(key.toLowerCase()))
    : []

  return (
    <div className="fade-in">
      {bio && <p className="bio">{bio}</p>}

      {userDefinedProperties.length > 0 && (
        <div className="properties">
          <h3>About</h3>
          <ul>
            {userDefinedProperties.map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value.startsWith('http') ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
