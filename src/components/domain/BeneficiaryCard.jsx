import { motion } from 'framer-motion'
import { Landmark, User, Users, ChevronRight, Trash2 } from 'lucide-react'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark, bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]', label: 'Repay' },
  self:   { Icon: User,     bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]', label: 'Self' },
  family: { Icon: Users,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]', label: null },
}

export default function BeneficiaryCard({ beneficiary, onClick, onDelete, selectable = false, selected = false }) {
  const cfg = PURPOSE_CONFIG[beneficiary.purpose] ?? PURPOSE_CONFIG.family

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors
        ${selected ? 'border-[#1a56db] bg-[#eff6ff]' : 'border-[#e5e7eb] bg-white'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <cfg.Icon size={18} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-semibold text-[#111827] truncate">{beneficiary.name}</p>
          {cfg.label && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          )}
        </div>
        <p className="text-xs text-[#6b7280] truncate">
          {beneficiary.relation}
          {beneficiary.relation && (beneficiary.bankAccount || beneficiary.upiId) ? ' · ' : ''}
          {beneficiary.bankAccount
            ? `${beneficiary.bankAccount.bank} ${beneficiary.bankAccount.accountMasked}`
            : beneficiary.upiId}
        </p>
      </div>
      {selectable ? (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${selected ? 'border-[#1a56db] bg-[#1a56db]' : 'border-[#e5e7eb]'}`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
        </div>
      ) : onDelete ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-2 text-[#9ca3af] hover:text-[#dc2626] transition-colors"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <ChevronRight size={18} className="text-[#9ca3af]" />
      )}
    </motion.div>
  )
}
