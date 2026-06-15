import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR } from '../../lib/fx'

export default function PaySuccess() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const loans = useStore((s) => s.loans)
  const loan = loans.find((l) => l.id === loanId)
  const lastTx = transactions.find((t) => t.loanId === loanId && t.type === 'repayment')

  return (
    <div className="flex flex-col min-h-full bg-white px-6">
      <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full bg-[#dcfce7] flex items-center justify-center"
        >
          <CheckCircle2 size={40} className="text-[#16a34a]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-[#111827]">Payment Successful!</h1>
          {lastTx && loan && (
            <p className="text-[#6b7280] mt-2">
              {formatINR(lastTx.amountINR)} credited to {loan.repaymentAccount.bank}
            </p>
          )}
        </motion.div>
        {lastTx && loan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-[#f9fafb] rounded-2xl p-4 text-left"
          >
            {[
              ['Amount credited', formatINR(lastTx.amountINR)],
              ['Destination', `${loan.repaymentAccount.bank} ${loan.repaymentAccount.accountMasked}`],
              ['Date', lastTx.date],
              ['Status', 'Credited'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#9ca3af]">{k}</span>
                <span className="text-sm font-medium text-[#111827]">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
        <div className="w-full flex flex-col gap-3">
          <Button variant="primary" fullWidth onClick={() => navigate('/home')}>Back to Home</Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/transactions')}>View History</Button>
        </div>
      </div>
    </div>
  )
}
