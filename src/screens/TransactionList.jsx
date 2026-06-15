import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, User, Users, ArrowUpRight } from 'lucide-react'
import TransactionRow from '../components/domain/TransactionRow'
import Badge from '../components/ui/Badge'
import { useStore } from '../store'
import { formatINR } from '../lib/fx'
import useIsDesktop from '../hooks/useIsDesktop'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark,    bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]' },
  self:   { Icon: User,        bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]' },
  family: { Icon: Users,       bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]' },
  send:   { Icon: ArrowUpRight, bg: 'bg-[#f0fdf4]', color: 'text-[#16a34a]' },
}

export default function TransactionList() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const transactions = useStore((s) => s.transactions)

  if (isDesktop) {
    return (
      <div className="p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]">Transaction History</h1>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-16 flex flex-col items-center gap-3">
            <p className="text-[15px] font-semibold text-[#111827]">No transactions yet</p>
            <p className="text-sm text-[#9ca3af]">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-[#f3f4f6] bg-[#fafafa]">
              <div className="w-10 flex-shrink-0" />
              <p className="flex-1 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Recipient</p>
              <p className="w-32 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Date</p>
              <p className="w-28 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide text-right">Amount</p>
              <p className="w-20 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Status</p>
            </div>

            {/* Rows */}
            {transactions.map((tx, i) => {
              const cfg = PURPOSE_CONFIG[tx.purpose] ?? PURPOSE_CONFIG.send
              return (
                <motion.button
                  key={tx.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-[#f3f4f6] last:border-0 hover:bg-[#f9fafb] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <cfg.Icon size={17} className={cfg.color} />
                  </div>
                  <p className="flex-1 text-[14px] font-medium text-[#111827] truncate text-left">
                    {tx.beneficiaryName || 'Transfer'}
                  </p>
                  <p className="w-32 text-sm text-[#9ca3af] flex-shrink-0 text-left">{tx.date}</p>
                  <p className="w-28 text-sm font-semibold text-[#111827] text-right flex-shrink-0">
                    {formatINR(tx.amountINR)}
                  </p>
                  <div className="w-20 flex justify-start flex-shrink-0">
                    <Badge status={tx.status} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[20px] font-bold text-[#111827]">Transaction History</h1>
      </div>
      <div className="px-5 pb-6">
        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 gap-3"
          >
            <p className="text-[15px] font-semibold text-[#111827]">No transactions yet</p>
            <p className="text-sm text-[#9ca3af]">Your payment history will appear here</p>
          </motion.div>
        ) : (
          <div>
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <TransactionRow tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
