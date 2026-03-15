import type {Nfd} from "@txnlab/nfd-sdk";
import {createContext} from "react";

export interface NFDContextType {
    nfd: Nfd | null
    isLoading: boolean
    error: Error | null
}

export const UserNFDContext = createContext<NFDContextType | undefined>(undefined)
export const SiteNFDContext = createContext<NFDContextType | undefined>(undefined)

interface ModalContextType {
    isOpen: boolean
    initialTipAmount: number | undefined
    openModal: (tipAmount?: number) => void
    closeModal: () => void
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)