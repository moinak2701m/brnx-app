import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard } from 'lucide-react'
import ScreenHeader from '../components/layout/ScreenHeader'
import { useStore } from '../store'

const SOURCES = [
  { id: 'chase_ach', bankName: 'Chase Bank', accountMasked: '****4521', type: 'ACH', flag: '🇺🇸', currency: 'USD' },
  { id: 'wise_usd', bankName: 'Wise', accountMasked: '****8812', type: 'Balance', flag: '🌍', currency: 'USD' },
]

export default function PaymentSource() {
  const paymentSource = useStore((s) => s.paymentSource)
  const setPaymentSource = useStore((s) => s.setPaymentSource)
  const currentId = paymentSource?.id || 'chase_ach'

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Payment Source" />
      <div className="px-5 pt-4 pb-6 flex flex-col gap-3">
        <p className="text-sm text-[#6b7280] mb-1">Select how you'll fund your transfers</p>
        {SOURCES.map((s) => {
          const isSelected = s.id === currentId
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPaymentSource(s)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left
                ${isSelected ? 'border-[#1a56db] bg-[#eff6ff]' : 'border-[#e5e7eb] bg-white'}`}
            >
              <div className="w-11 h-11 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-xl flex-shrink-0">
                {s.flag}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#111827]">{s.bankName}</p>
                <p className="text-xs text-[#9ca3af]">{s.accountMasked} · {s.type} · {s.currency}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${isSelected ? 'border-[#1a56db] bg-[#1a56db]' : 'border-[#e5e7eb]'}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </motion.button>
          )
        })}
        <div className="mt-2 p-4 rounded-2xl border-2 border-dashed border-[#e5e7eb] flex items-center gap-3 text-[#9ca3af] cursor-pointer hover:border-[#1a56db] hover:text-[#1a56db] transition-colors">
          <CreditCard size={20} />
          <p className="text-sm font-medium">Add new bank account</p>
        </div>
      </div>
    </div>
  )
}
