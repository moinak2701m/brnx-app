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

const STAGE_MS = 5 * 60 * 1000 // 5 minutes between each mid-flight stage
const INVOICE_STAGES = ['created', 'payment_initiated', 'received_in_wallet', 'received_in_bank']
const TOPUP_STAGES = ['created', 'payment_initiated', 'received_in_wallet']

function nextStage(stages, status) {
  const idx = stages.indexOf(status)
  if (idx === -1 || idx >= stages.length - 1) return null
  return stages[idx + 1]
}

// Any invoice/top-up sitting mid-flight keeps advancing toward its final
// stage on its own, 5 minutes per stage - computed from the timestamp it
// entered the current stage, not a fresh timer, so this is correct even
// across a page reload (which would otherwise silently drop a pending
// setTimeout and leave the record stuck forever). This is the fallback
// path for anything NOT actively mid-flight in a fast interactive timer
// (confirmBankTransfer/payFromWallet/confirmTreasuryTransferSent) - e.g.
// seed data that starts pre-populated mid-pipeline, or a real payment
// whose fast timer got interrupted by a refresh. Re-reading fresh state
// each time it fires means it's a safe no-op once the real stage has
// already been reached some other way.
function scheduleInvoiceCatchUp(invoiceId) {
  const invoice = useAfricaStore.getState().invoices.find((i) => i.id === invoiceId)
  if (!invoice) return
  const next = nextStage(INVOICE_STAGES, invoice.status)
  if (!next) return

  const enteredAt = invoice.timestamps?.[invoice.status]
  const remaining = STAGE_MS - (enteredAt ? Date.now() - new Date(enteredAt).getTime() : 0)

  if (remaining <= 0) {
    const now = new Date().toISOString()
    useAfricaStore.setState((state) => ({
      invoices: state.invoices.map((i) =>
        i.id === invoiceId ? { ...i, status: next, timestamps: { ...i.timestamps, [next]: now } } : i
      ),
    }))
    scheduleInvoiceCatchUp(invoiceId) // in case more than one stage is overdue
  } else {
    setTimeout(() => scheduleInvoiceCatchUp(invoiceId), remaining)
  }
}

function scheduleTopUpCatchUp(topUpId) {
  const topUp = useAfricaStore.getState().treasuryTopUps.find((t) => t.id === topUpId)
  if (!topUp) return
  const next = nextStage(TOPUP_STAGES, topUp.status)
  if (!next) return

  const enteredAt = topUp.timestamps?.[topUp.status]
  const remaining = STAGE_MS - (enteredAt ? Date.now() - new Date(enteredAt).getTime() : 0)

  if (remaining <= 0) {
    const now = new Date().toISOString()
    useAfricaStore.setState((state) => ({
      treasuryTopUps: state.treasuryTopUps.map((t) =>
        t.id === topUpId ? { ...t, status: next, timestamps: { ...t.timestamps, [next]: now } } : t
      ),
      ...(next === 'received_in_wallet'
        ? { senderWallet: { balanceUSD: useAfricaStore.getState().senderWallet.balanceUSD + topUp.amountUSD } }
        : {}),
    }))
    scheduleTopUpCatchUp(topUpId)
  } else {
    setTimeout(() => scheduleTopUpCatchUp(topUpId), remaining)
  }
}

function resumeInFlight() {
  useAfricaStore.getState().invoices
    .filter((i) => i.status === 'payment_initiated' || i.status === 'received_in_wallet')
    .forEach((i) => scheduleInvoiceCatchUp(i.id))
  useAfricaStore.getState().treasuryTopUps
    .filter((t) => t.status === 'payment_initiated')
    .forEach((t) => scheduleTopUpCatchUp(t.id))
}

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
      // The receiver has no treasury function - every invoice off-ramps
      // straight to their bank automatically. "received_in_wallet" is
      // shown only as a brief transient stage, not a resting balance.
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
          // The bridge into the platform wallet is fast, but the actual
          // bank settlement leg is a real off-ramp - let it ride the same
          // ~5-minute catch-up cadence as everything else mid-flight,
          // rather than a fake few-second timeout.
          scheduleInvoiceCatchUp(invoiceId)
        }, 4500)
      },

      // Wallet path: funds are already USD in the sender's wallet, so
      // there's no FX/bridge step left to wait on - it just confirms fast.
      // Still auto-off-ramps to the receiver's bank the same as above.
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
          // Same real off-ramp wait as the bank-transfer path above -
          // landing in the wallet is instant, settling to the receiver's
          // bank still takes ~5 minutes.
          scheduleInvoiceCatchUp(invoiceId)
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

      // Declining before the transfer is sent means nothing actually
      // happened - drop the pending record rather than leaving a
      // "created" stub sitting in history forever.
      declineTreasuryTopUp: (topUpId) =>
        set((state) => ({
          treasuryTopUps: state.treasuryTopUps.filter((t) => t.id !== topUpId),
        })),

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

    }),
    { name: 'dragonfly-africa-store-v2' }
  )
)

resumeInFlight()

export { DEMO_SENDER_ID }
export default useAfricaStore
