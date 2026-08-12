import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_SENDER_ID,
  MOCK_SENDERS,
  MOCK_RECEIVER,
  MOCK_RECEIVER_BANK,
  MOCK_INVOICES,
  MOCK_TREASURY_TOPUPS,
  MOCK_SENDER_WALLET_BALANCE,
} from './lib/mock'
import { getUsdToNgnQuote } from './lib/fx'

const useAfricaStore = create(
  persist(
    (set, get) => ({
      // Which role the demo is currently being played as. Purely a
      // presentation switch - both roles read/write the same data below.
      activeRole: null, // null | 'sender' | 'receiver'
      setActiveRole: (role) => set({ activeRole: role }),

      senderKybStatus: 'idle', // idle | pending | approved
      setSenderKybStatus: (status) => set({ senderKybStatus: status }),
      submitKyb: () => {
        set({ senderKybStatus: 'pending' })
        setTimeout(() => set({ senderKybStatus: 'approved' }), 2800)
      },

      receiver: MOCK_RECEIVER,
      receiverBank: MOCK_RECEIVER_BANK,
      setReceiverBank: (bank) => set({ receiverBank: bank }),

      senders: MOCK_SENDERS,
      addSender: (s) =>
        set((state) => ({
          senders: [
            ...state.senders,
            { id: `sender_${Date.now()}`, isYou: false, ...s },
          ],
        })),

      invoices: MOCK_INVOICES,

      createInvoice: ({ senderId, description, amountUSD, fileName }) => {
        const n = get().invoices.length + 1001
        const invoice = {
          id: `inv_${Date.now()}`,
          invoiceNumber: `INV-${n}`,
          senderId,
          description,
          amountUSD,
          fileName: fileName || null,
          status: 'created',
          quote: null,
          paymentMethod: null,
          timestamps: {
            created: new Date().toISOString(),
            payment_initiated: null,
            received_in_wallet: null,
            received_in_bank: null,
          },
        }
        set((state) => ({ invoices: [invoice, ...state.invoices] }))
        return invoice
      },

      generateInvoiceQuote: (invoiceId) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId)
        if (!invoice) return null
        const quote = getUsdToNgnQuote(invoice.amountUSD)
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === invoiceId ? { ...i, quote } : i
          ),
        }))
        return quote
      },

      // Bank-transfer path: a real wait. Confirming just means "I've sent
      // the NGN transfer" - the platform still has to receive + bridge it.
      confirmBankTransfer: (invoiceId) => {
        const now = new Date().toISOString()
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  status: 'payment_initiated',
                  paymentMethod: 'bank_transfer',
                  timestamps: { ...i.timestamps, payment_initiated: now },
                }
              : i
          ),
        }))
        setTimeout(() => {
          set((state) => ({
            invoices: state.invoices.map((i) =>
              i.id === invoiceId
                ? {
                    ...i,
                    status: 'received_in_wallet',
                    timestamps: {
                      ...i.timestamps,
                      received_in_wallet: new Date().toISOString(),
                    },
                  }
                : i
            ),
          }))
        }, 4500)
      },

      // Wallet path: funds are already USD in the sender's wallet, so
      // there's no FX/bridge step left to wait on - it just confirms fast.
      payFromWallet: (invoiceId) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId)
        if (!invoice || get().senderWallet.balanceUSD < invoice.amountUSD) return false
        const now = new Date().toISOString()
        set((state) => ({
          senderWallet: { balanceUSD: state.senderWallet.balanceUSD - invoice.amountUSD },
          invoices: state.invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  status: 'payment_initiated',
                  paymentMethod: 'wallet',
                  timestamps: { ...i.timestamps, payment_initiated: now },
                }
              : i
          ),
        }))
        setTimeout(() => {
          set((state) => ({
            invoices: state.invoices.map((i) =>
              i.id === invoiceId
                ? {
                    ...i,
                    status: 'received_in_wallet',
                    timestamps: {
                      ...i.timestamps,
                      received_in_wallet: new Date().toISOString(),
                    },
                  }
                : i
            ),
          }))
        }, 1500)
        return true
      },

      senderWallet: { balanceUSD: MOCK_SENDER_WALLET_BALANCE },
      treasuryTopUps: MOCK_TREASURY_TOPUPS,

      // Treasury top-ups are USD-denominated (you say how much USD you
      // want in the wallet) and go through the same created ->
      // payment_initiated -> received_in_wallet states as invoices -
      // there's just no further "received_in_bank" leg, since landing
      // in the wallet is the whole point of a top-up.
      initiateTreasuryTopUp: (amountUSD) => {
        const quote = getUsdToNgnQuote(amountUSD)
        const topUp = {
          id: `topup_${Date.now()}`,
          amountUSD,
          quote,
          status: 'created',
          timestamps: {
            created: new Date().toISOString(),
            payment_initiated: null,
            received_in_wallet: null,
          },
        }
        set((state) => ({ treasuryTopUps: [topUp, ...state.treasuryTopUps] }))
        return topUp
      },

      confirmTreasuryTransferSent: (topUpId) => {
        const now = new Date().toISOString()
        set((state) => ({
          treasuryTopUps: state.treasuryTopUps.map((t) =>
            t.id === topUpId
              ? { ...t, status: 'payment_initiated', timestamps: { ...t.timestamps, payment_initiated: now } }
              : t
          ),
        }))
        setTimeout(() => {
          const topUp = get().treasuryTopUps.find((t) => t.id === topUpId)
          if (!topUp) return
          set((state) => ({
            treasuryTopUps: state.treasuryTopUps.map((t) =>
              t.id === topUpId
                ? { ...t, status: 'received_in_wallet', timestamps: { ...t.timestamps, received_in_wallet: new Date().toISOString() } }
                : t
            ),
            senderWallet: { balanceUSD: state.senderWallet.balanceUSD + topUp.amountUSD },
          }))
        }, 4500)
      },

      // Receiver's wallet balance is derived (sum of invoices sitting in
      // received_in_wallet) rather than stored, so it can never desync
      // from the invoice list.
      getReceiverWalletBalance: () =>
        get().invoices
          .filter((i) => i.status === 'received_in_wallet')
          .reduce((sum, i) => sum + i.amountUSD, 0),

      withdrawInvoiceToBank: (invoiceId) => {
        const now = new Date().toISOString()
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === invoiceId && i.status === 'received_in_wallet'
              ? { ...i, status: 'received_in_bank', timestamps: { ...i.timestamps, received_in_bank: now } }
              : i
          ),
        }))
      },

      withdrawAllToBank: () => {
        const now = new Date().toISOString()
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.status === 'received_in_wallet'
              ? { ...i, status: 'received_in_bank', timestamps: { ...i.timestamps, received_in_bank: now } }
              : i
          ),
        }))
      },
    }),
    { name: 'dragonfly-africa-store-v2' }
  )
)

export { DEMO_SENDER_ID }
export default useAfricaStore
