import { Landmark, Users, User, ArrowUpRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatINR } from '../../lib/fx'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark,    bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]' },
  self:   { Icon: User,        bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]' },
  family: { Icon: Users,       bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]' },
  send:   { Icon: ArrowUpRight, bg: 'bg-[#f0fdf4]', color: 'text-[#16a34a]' },
}

export default function TransactionRow({ tx, onClick }) {
  const cfg = PURPOSE_CONFIG[tx.purpose] ?? PURPOSE_CONFIG.send
  const label = tx.beneficiaryName || 'Transfer'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-1 hover:bg-[#f9fafb] rounded-xl transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <cfg.Icon size={18} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#111827] truncate">{label}</p>
        <p className="text-xs text-[#9ca3af]">{tx.date}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-[14px] font-semibold text-[#111827]">{formatINR(tx.amountINR)}</p>
        <Badge status={tx.status} />
      </div>
    </button>
  )
}
