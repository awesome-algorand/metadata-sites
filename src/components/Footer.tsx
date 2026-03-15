import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="footer fade-in mt-auto w-full bg-bg p-8 text-center border-t border-border">
      <div className="footer-links flex items-center justify-center gap-1.5 text-base text-text">
        <span>Get your own NFD at <a href="https://nf.domains" target="_blank" rel="noreferrer" className="text-text underline transition-colors hover:text-accent">NFDomains</a> by <a href="https://txnlab.dev" target="_blank" rel="noreferrer" className="text-text underline transition-colors hover:text-accent">TxnLab</a></span>
      </div>
    </footer>
  )
}
