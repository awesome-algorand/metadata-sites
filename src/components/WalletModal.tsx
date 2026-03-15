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
  const { siteNfd } = useSiteNFD()
  const { userNfd } = useUserNFD()
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
    }
  }, [activeAddress, algodClient])

  const fetchTransactions = useCallback(async () => {
    if (!activeAddress || !siteNfd?.depositAccount) return
    try {
      const { token, baseServer } = activeNetworkConfig.algod
      const indexerHost = baseServer.replace('api', 'idx')
      const indexerClient = new algosdk.Indexer(token as any, indexerHost, 443)

      const response = await indexerClient.lookupAccountTransactions(activeAddress)
        .do()
      const formattedTransactions: Transaction[] = response.transactions
        .filter((tx: any) => {
          const payment = tx['payment-transaction'] || tx.paymentTransaction
          return payment?.receiver === siteNfd.depositAccount && tx.sender === activeAddress
        })
        .slice(0, 4)
        .map((tx: any) => {
          const payment = tx['payment-transaction'] || tx.paymentTransaction
          const amount = payment?.amount || 0
          const round = tx['confirmed-round'] || tx.confirmedRound
          const time = tx['round-time'] || tx.roundTime
          
          return {
            id: tx.id,
            amount: Number(amount),
            round: Number(round),
            timestamp: new Date(time * 1000).toISOString()
          }
        })

      setTransactions(formattedTransactions)
    } catch (error) {
      // Failed to fetch transactions
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
      
      const txid = (response as any).txId || response.txid
      await algosdk.waitForConfirmation(algodClient, txid, 4)

      setTxId(txid)
      setSentAmount(amount)
      setScreen('confirmation')
      // Refresh data after successful tip
      fetchBalance()
      fetchTransactions()
    } catch (error) {
      alert('Failed to send tip.')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          {avatarUrl && <img src={avatarUrl} alt="" className="modal-mini-avatar" />}
          <h2>{siteNfd?.name || 'NFD Profile'}</h2>
        </div>

        {screen === 'connect' && (
          <div className="connect-screen">
            <h3>Connect Wallet</h3>
            <p>Please connect your wallet to proceed.</p>
            <div className="wallet-buttons">
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
          <div className="account-screen">
            <div className="user-profile">
              <p><strong>Address:</strong> {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-8)}</p>
              {userNfd && <p><strong>NFD:</strong> {userNfd.name}</p>}
              <p><strong>Balance:</strong> {(balance / 1000000).toLocaleString()} ALGO</p>
            </div>
            
            <div className="tip-prefill">
              <h3>Send Tip to {siteNfd?.name}</h3>
              <div className="tip-quick-options">
                {[1, 10, 100].map((algoAmount) => (
                  <button
                    key={algoAmount}
                    className={`counter tip-button ${tipAmount === algoAmount * 1000000 ? 'active' : ''}`}
                    onClick={() => {
                      setTipAmount(algoAmount * 1000000)
                      setCustomAmountStr(algoAmount.toString())
                    }}
                  >
                    {algoAmount} ALGO
                  </button>
                ))}
              </div>
              <div className="custom-input-group">
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
                  className="custom-amount-input"
                />
                <button
                  className="counter"
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

            <div className="transaction-history">
              <h3>Recent Tips Sent</h3>
              {transactions.length > 0 ? (
                <ul>
                  {transactions.slice(0, 5).map(tx => (
                    <li key={tx.id}>
                      <a 
                        href={`https://lora.algokit.io/${activeNetwork === 'mainnet' ? 'mainnet' : 'testnet'}/transaction/${tx.id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="tx-history-link"
                      >
                        <div className="tx-history-item">
                          <span className="tx-history-amount">{tx.amount / 1000000} ALGO</span>
                          <span className="tx-history-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent tips found.</p>
              )}
            </div>
          </div>
        )}

        {screen === 'confirmation' && (
          <div className="confirmation-screen">
            <div className="success-icon">✓</div>
            <h2>Tip Sent!</h2>
            
            <div className="tx-details">
              <div className="tx-amount">
                <span className="amount-value">{(sentAmount || 0) / 1000000}</span>
                <span className="amount-unit">ALGO</span>
              </div>

              <div className="tx-participants">
                <div className="participant">
                  <span className="participant-label">From</span>
                  <div className="participant-info">
                    {userNfd?.properties?.userDefined?.avatar || userNfd?.properties?.verified?.avatar ? (
                      <img src={userNfd?.properties?.userDefined?.avatar || userNfd?.properties?.verified?.avatar} alt="" className="mini-avatar" />
                    ) : (
                      <div className="mini-avatar-placeholder" />
                    )}
                    <div className="participant-details">
                      <span className="participant-name">{userNfd?.name || 'You'}</span>
                      <span className="participant-address">{activeAddress?.slice(0, 4)}...{activeAddress?.slice(-4)}</span>
                    </div>
                  </div>
                </div>

                <div className="tx-arrow">→</div>

                <div className="participant">
                  <span className="participant-label">To</span>
                  <div className="participant-info">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="mini-avatar" />
                    ) : (
                      <div className="mini-avatar-placeholder" />
                    )}
                    <div className="participant-details">
                      <span className="participant-name">{siteNfd?.name}</span>
                      <span className="participant-address">{siteNfd?.depositAccount?.slice(0, 4)}...{siteNfd?.depositAccount?.slice(-4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {txId && (
                <div className="tx-id-container">
                  <span className="tx-id-label">Transaction ID</span>
                  <a href={`https://lora.algokit.io/${activeNetwork === 'mainnet' ? 'mainnet' : 'testnet'}/transaction/${txId}`} target="_blank" rel="noreferrer" className="tx-id-link">
                    {txId.slice(0, 12)}...{txId.slice(-12)}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <button className="counter cancel-button" onClick={handleClose}>
          {screen === 'confirmation' ? 'Done' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}
