import React, { useState, useEffect, useCallback } from 'react'
import { useWallet, useNetwork } from '@txnlab/use-wallet-react'
import { useSiteNFD } from '../hooks/useSiteNFD'
import { useUserNFD } from '../hooks/useUserNFD'
import { useModal } from '../hooks/useModal'
import algosdk from 'algosdk'

interface Transaction {
  id: string
  amount: number
  round: number
  timestamp: string
}

type ModalScreen = 'connect' | 'account' | 'confirmation'

export const WalletModal: React.FC = () => {
  const { wallets, activeAddress, activeWallet, algodClient, signTransactions } = useWallet()
  const { activeNetworkConfig, activeNetwork } = useNetwork()
  const { nfd: siteNfd } = useSiteNFD()
  const { nfd: userNfd } = useUserNFD()
  const { isOpen, initialTipAmount, closeModal } = useModal()
  
  const [screen, setScreen] = useState<ModalScreen>('connect')
  const [isSending, setIsSending] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [sentAmount, setSentAmount] = useState<number | null>(null)
  const [tipAmount, setTipAmount] = useState<number | null>(initialTipAmount || null)
  const [customAmountStr, setCustomAmountStr] = useState('')
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])


  const avatarUrl = siteNfd?.properties?.userDefined?.avatar || siteNfd?.properties?.verified?.avatar

  const fetchBalance = useCallback(async () => {
    if (!activeAddress) return
    try {
      const accountInfo = await algodClient.accountInformation(activeAddress).do()
      setBalance(Number(accountInfo.amount))
    } catch (error) {
      // Failed to fetch balance
      console.error('Failed to fetch balance:', error)
    }
  }, [activeAddress, algodClient])

  const fetchTransactions = useCallback(async () => {
    if (!activeAddress || !siteNfd?.depositAccount) return
    try {
      const { token, baseServer } = activeNetworkConfig.algod
      const indexerHost = baseServer.replace('api', 'idx')
      const indexerClient = new algosdk.Indexer(token as string, indexerHost, 443)

      const response = await indexerClient.lookupAccountTransactions(activeAddress)
        .do()
      const formattedTransactions: Transaction[] = response.transactions
        .filter((tx) => {
          const payment = tx.paymentTransaction
          return payment?.receiver === siteNfd.depositAccount && tx.sender === activeAddress
        })
        .slice(0, 4)
        .map((tx) => {
          const payment = tx.paymentTransaction
          const amount = payment?.amount || 0
          const round = tx.confirmedRound
          const time = tx.roundTime as number
          
          return {
            id: tx.id as string,
            amount: Number(amount),
            round: Number(round),
            timestamp: new Date(time * 1000).toISOString()
          }
        })

      setTransactions(formattedTransactions)
    } catch (error) {
      // Failed to fetch transactions
      console.error('Failed to fetch transactions:', error)
    }
  }, [activeAddress, siteNfd?.depositAccount, activeNetworkConfig.algod])

  const handleClose = useCallback(() => {
    closeModal()
    // Reset screen to account (if connected) or connect (if not)
    setScreen(activeAddress ? 'account' : 'connect')
    // Reset other states
    setTxId(null)
    setSentAmount(null)
  }, [closeModal, activeAddress])

  useEffect(() => {
    if (activeAddress) {
      setScreen('account')
    } else {
      setScreen('connect')
    }
  }, [activeAddress])

  useEffect(() => {
    if (activeAddress && (screen === 'account' || screen === 'confirmation')) {
      fetchBalance()
      fetchTransactions()
    }
  }, [activeAddress, screen, fetchBalance, fetchTransactions])

  useEffect(() => {
    if (initialTipAmount) {
        setTipAmount(initialTipAmount)
        setCustomAmountStr((initialTipAmount / 1000000).toString())
    } else {
        setTipAmount(null)
        setCustomAmountStr('')
    }
  }, [initialTipAmount])

  const sendTip = async (amount: number) => {
    if (!siteNfd?.depositAccount || !activeAddress || !activeWallet) return

    try {
      setIsSending(true)
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: siteNfd.depositAccount,
        amount,
        suggestedParams,
      })

      const encodedTransaction = algosdk.encodeUnsignedTransaction(transaction)
      const signedTransactions = await signTransactions([encodedTransaction])
      const response = await algodClient.sendRawTransaction(signedTransactions as Uint8Array[]).do()
      
      const txid = response.txid
      await algosdk.waitForConfirmation(algodClient, txid, 4)

      setTxId(txid)
      setSentAmount(amount)
      setScreen('confirmation')
      // Refresh data after successful tip
      fetchBalance()
      fetchTransactions()
    } catch (error) {
      alert('Failed to send tip.')
      console.error('Failed to send tip:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay fixed inset-0 z-1000 flex items-start justify-center overflow-y-auto bg-black/70 py-10 backdrop-blur-sm" onClick={handleClose}>
      <div className="modal-content relative mx-auto w-125 max-w-[calc(100%-40px)] rounded-2xl border border-border bg-bg p-8 text-center shadow-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container mb-6 flex flex-col items-center gap-3 border-b border-border pb-6">
          {avatarUrl && <img src={avatarUrl} alt="" className="modal-mini-avatar h-16 w-16 rounded-full border-2 border-accent object-cover shadow-custom" />}
          <h2 className="mt-0 text-2xl font-semibold text-text-h">{siteNfd?.name || 'NFD Profile'}</h2>
        </div>

        {screen === 'connect' && (
          <div className="connect-screen text-center">
            <h3 className="mt-0 mb-4 text-xl font-semibold text-text-h">Connect Wallet</h3>
            <p className="text-text">Please connect your wallet to proceed.</p>
            <div className="wallet-buttons mt-6 flex flex-wrap justify-center gap-3">
              {wallets?.map((wallet) => (
                <button
                  key={wallet.id}
                  className="counter"
                  onClick={() => {
                    if (wallet.isConnected) {
                      wallet.setActive()
                    } else {
                      wallet.connect().catch(() => {})
                    }
                  }}
                >
                  {wallet.isConnected ? `Switch to ${wallet.metadata.name}` : `Connect ${wallet.metadata.name}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'account' && (
          <div className="account-screen text-left">
            <div className="user-profile mb-6 space-y-1">
              <p className="text-text"><strong className="text-text-h">Address:</strong> {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-8)}</p>
              {userNfd && <p className="text-text"><strong className="text-text-h">NFD:</strong> {userNfd.name}</p>}
              <p className="text-text"><strong className="text-text-h">Balance:</strong> {(balance / 1000000).toLocaleString()} ALGO</p>
            </div>
            
            <div className="tip-prefill mt-8 border-t border-border pt-6">
              <h3 className="mt-0 mb-4 text-center text-lg font-semibold text-text-h">Send Tip to {siteNfd?.name}</h3>
              <div className="tip-quick-options flex justify-center gap-3">
                {[1, 10, 100].map((algoAmount) => (
                  <button
                    key={algoAmount}
                    className={`counter tip-button min-w-25 font-bold ${tipAmount === algoAmount * 1000000 ? 'bg-accent! text-white! border-accent!' : ''}`}
                    onClick={() => {
                      setTipAmount(algoAmount * 1000000)
                      setCustomAmountStr(algoAmount.toString())
                    }}
                  >
                    {algoAmount} ALGO
                  </button>
                ))}
              </div>
              <div className="custom-input-group flex items-center justify-center gap-4 mt-2">
                <input
                  type="number"
                  placeholder="Custom ALGO"
                  value={customAmountStr}
                  onChange={(e) => {
                    setCustomAmountStr(e.target.value)
                    const amount = parseFloat(e.target.value)
                    if (!isNaN(amount)) {
                      setTipAmount(Math.floor(amount * 1000000))
                    } else {
                      setTipAmount(null)
                    }
                  }}
                  className="custom-amount-input rounded-md border border-border bg-code-bg px-4 py-2 font-mono text-text-h outline-none focus:border-accent"
                />
                <button
                  className="counter mb-0"
                  onClick={() => {
                    if (tipAmount && tipAmount > 0) {
                      sendTip(tipAmount)
                    }
                  }}
                  disabled={isSending || !tipAmount}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            <div className="transaction-history mt-8 border-t border-border pt-6">
              <h3 className="mt-0 mb-4 text-lg font-semibold text-text-h">Recent Tips Sent</h3>
              {transactions.length > 0 ? (
                <ul className="list-none p-0 m-0 space-y-2">
                  {transactions.slice(0, 5).map(tx => (
                    <li key={tx.id}>
                      <a 
                        href={`https://lora.algokit.io/${activeNetwork === 'mainnet' ? 'mainnet' : 'testnet'}/transaction/${tx.id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="block rounded-lg border border-border bg-social-bg p-3 transition-shadow hover:shadow-custom"
                      >
                        <div className="tx-history-item flex items-center justify-between">
                          <span className="tx-history-amount font-bold text-accent">{tx.amount / 1000000} ALGO</span>
                          <span className="tx-history-date text-sm text-text-dim">{new Date(tx.timestamp).toLocaleDateString()}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-text-dim">No recent tips found.</p>
              )}
            </div>
          </div>
        )}

        {screen === 'confirmation' && (
          <div className="confirmation-screen flex flex-col items-center">
            <div className="success-icon mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#4caf50] text-3xl text-white shadow-[0_4px_12px_rgba(76,175,80,0.3)]">✓</div>
            <h2 className="mt-0 mb-6 text-2xl font-bold text-text-h text-center">Tip Sent!</h2>
            
            <div className="tx-details mb-6 w-full rounded-xl border border-border bg-social-bg p-6">
              <div className="tx-amount mb-8 text-center">
                <span className="amount-value block text-[2.5rem] font-bold text-accent">{(sentAmount || 0) / 1000000}</span>
                <span className="amount-unit text-base tracking-widest text-text-dim uppercase">ALGO</span>
              </div>

              <div className="tx-participants mb-8 flex items-center justify-between gap-4">
                <div className="participant flex flex-1 flex-col gap-2 text-left">
                  <span className="participant-label text-xs tracking-wider text-text-dim uppercase">From</span>
                  <div className="participant-info flex items-center gap-3">
                    {userNfd?.properties?.userDefined?.avatar || userNfd?.properties?.verified?.avatar ? (
                      <img src={userNfd?.properties?.userDefined?.avatar || userNfd?.properties?.verified?.avatar} alt="" className="mini-avatar h-10 w-10 rounded-full border-2 border-border object-cover" />
                    ) : (
                      <div className="mini-avatar-placeholder h-10 w-10 rounded-full bg-border" />
                    )}
                    <div className="participant-details flex flex-col min-w-0">
                      <span className="participant-name truncate font-semibold text-text-h">{userNfd?.name || 'You'}</span>
                      <span className="participant-address text-xs text-text-dim">{activeAddress?.slice(0, 4)}...{activeAddress?.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                <div className="tx-arrow text-xl text-text-dim">→</div>

                <div className="participant flex flex-1 flex-col gap-2 text-left">
                  <span className="participant-label text-xs tracking-wider text-text-dim uppercase">To</span>
                  <div className="participant-info flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="mini-avatar h-10 w-10 rounded-full border-2 border-border object-cover" />
                    ) : (
                      <div className="mini-avatar-placeholder h-10 w-10 rounded-full bg-border" />
                    )}
                    <div className="participant-details flex flex-col min-w-0">
                      <span className="participant-name truncate font-semibold text-text-h">{siteNfd?.name}</span>
                      <span className="participant-address text-xs text-text-dim">{siteNfd?.depositAccount?.slice(0, 4)}...{siteNfd?.depositAccount?.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {txId && (
                <div className="tx-id-container flex flex-col items-center border-t border-border pt-4">
                  <span className="tx-id-label mb-1 text-xs tracking-wider text-text-dim uppercase">Transaction ID</span>
                  <a href={`https://lora.algokit.io/${activeNetwork === 'mainnet' ? 'mainnet' : 'testnet'}/transaction/${txId}`} target="_blank" rel="noreferrer" className="truncate text-sm font-bold text-accent hover:underline">
                    {txId.slice(0, 12)}...{txId.slice(-12)}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <button className="counter cancel-button mt-6 bg-social-bg text-text" onClick={handleClose}>
          {screen === 'confirmation' ? 'Done' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}
