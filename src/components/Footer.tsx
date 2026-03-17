import React from 'react'
import { useSiteNFD } from '../hooks/useSiteNFD'

export const Footer: React.FC = () => {
  const { nfd: siteNfd } = useSiteNFD()

  return (
    <footer className="footer fade-in mt-auto w-full bg-bg p-8 border-t border-border">
      <div className="footer-content mx-auto flex max-w-281.5 items-center justify-between gap-4 flex-wrap">
        <div className="footer-left flex-1 min-w-40 text-left">
          {siteNfd && (
            <a 
              href={`https://dev.uniresolver.io/#did:nfd:${siteNfd.name}`}
              target="_blank"
              rel="noreferrer"
              className="counter px-4 py-2 text-sm font-semibold transition-all hover:scale-105 mb-0"
              aria-label="view identity document"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2"
              >
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.5 3" />
                <path d="M14 13.12c0 2.38 0 4.38-.5 4.88" />
                <path d="M2 14c.03 0 .05 0 .08 0" />
                <path d="M22 14c-.03 0-.05 0-.08 0" />
                <path d="M15 2c0 1.1-.9 2-2 2" />
                <path d="M14 6.11a2 2 0 0 1-1 0" />
                <path d="M15 22c0-1.1.9-2 2-2" />
                <path d="M18 15.89a2 2 0 0 0 1 0" />
                <path d="M4 10.74V7a2 2 0 0 1 2-2" />
                <path d="M9 3.24V2a1 1 0 0 1 1-1" />
                <path d="M19 14.89V17a2 2 0 0 1-2 2" />
                <path d="M15 20.76V22a1 1 0 0 1-1 1" />
                <path d="M7 21c-.48 0-.8-.13-1-.4" />
                <path d="M5.27 19.27A2 2 0 0 1 5 18" />
                <path d="M5 14.89V12a7 7 0 0 1 14 0v2.89" />
                <path d="M11 22.1V22" />
                <path d="M11 18.03c.02-2.27.05-4.45.5-4.94" />
              </svg>
              did:nfd:{siteNfd.name}
            </a>
          )}
        </div>
        <div className="footer-right flex-1 min-w-40 text-right text-base text-text">
          <span>Get your own NFD at <a href="https://nf.domains" target="_blank" rel="noreferrer" className="text-text underline transition-colors hover:text-accent">NFDomains</a> by <a href="https://txnlab.dev" target="_blank" rel="noreferrer" className="text-text underline transition-colors hover:text-accent">TxnLab</a></span>
        </div>
      </div>
    </footer>
  )
}
