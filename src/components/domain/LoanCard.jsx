import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { formatINR } from '../../lib/fx'

export default function LoanCard({ loan, onClick }) {
  const pct = Math.round((loan.outstandingAmount / loan.sanctionedAmount) * 100)
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#e5e7eb] p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[#6b7280] font-medium">{loan.lender}</p>
          <p className="text-[17px] font-bold text-[#111827] mt-0.5">{formatINR(loan.outstandingAmount)}</p>
          <p className="text-xs text-[#9ca3af]">outstanding · {loan.accountMasked}</p>
        </div>
        <ChevronRight size={18} className="text-[#9ca3af] mt-1" />
      </div>
      <div className="w-full h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0061D3] to-[#1a56db]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-[#9ca3af]">
        <span>EMI: <span className="text-[#111827] font-medium">{formatINR(loan.emiAmount)}</span> / mo</span>
        <span>Due: <span className="text-[#f97316] font-medium">{loan.nextDueDate}</span></span>
      </div>
    </motion.div>
  )
}
