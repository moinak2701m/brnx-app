import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  MOCK_USER,
  MOCK_BENEFICIARIES,
  MOCK_TRANSACTIONS,
  MOCK_PAYMENT_SOURCE,
} from '../data/mock'

const useStore = create(
  persist(
    (set) => ({
      // Auth
      isAuthenticated: false,
      kycStatus: 'idle', // idle | pending | approved
      user: MOCK_USER,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, kycStatus: 'idle' }),
      setKycStatus: (s) => set({ kycStatus: s }),

      // Beneficiaries (covers loan repayment, self accounts, family)
      beneficiaries: MOCK_BENEFICIARIES,
      addBeneficiary: (b) =>
        set((s) => ({
          beneficiaries: [
            ...s.beneficiaries,
            { id: `ben_${s.beneficiaries.length + 1}_${Date.now()}`, ...b },
          ],
        })),
      deleteBeneficiary: (id) =>
        set((s) => ({ beneficiaries: s.beneficiaries.filter((b) => b.id !== id) })),

      // Transactions
      transactions: MOCK_TRANSACTIONS,
      addTransaction: (tx) =>
        set((s) => ({
          transactions: [
            { id: `tx_${s.transactions.length + 1}_${Date.now()}`, ...tx },
            ...s.transactions,
          ],
        })),

      // Payment source
      paymentSource: MOCK_PAYMENT_SOURCE,
      setPaymentSource: (ps) => set({ paymentSource: ps }),

      // Active payment wizard state
      activePayment: null,
      setActivePayment: (p) => set({ activePayment: p }),
      clearActivePayment: () => set({ activePayment: null }),
    }),
    {
      name: 'brnx-store-v4',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        kycStatus: state.kycStatus,
        paymentSource: state.paymentSource,
      }),
    }
  )
)

export default useStore
export { useStore }
