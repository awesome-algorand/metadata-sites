import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { ModalContext } from "../contexts"

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
