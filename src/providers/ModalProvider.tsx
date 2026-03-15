import React, { createContext, useState } from 'react'
import type { ReactNode } from 'react'

interface ModalContextType {
  isOpen: boolean
  initialTipAmount: number | undefined
  openModal: (tipAmount?: number) => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [initialTipAmount, setInitialTipAmount] = useState<number | undefined>(undefined)

  const openModal = (tipAmount?: number) => {
    setInitialTipAmount(tipAmount)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setInitialTipAmount(undefined)
  }

  return (
    <ModalContext.Provider value={{ isOpen, initialTipAmount, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}
