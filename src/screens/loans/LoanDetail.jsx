import { useNavigate, useParams } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import ScreenHeader from '../../components/layout/ScreenHeader'
import GradientCard from '../../components/ui/GradientCard'
import Button from '../../components/ui/Button'
import TransactionRow from '../../components/domain/TransactionRow'
import { useStore } from '../../store'
import { formatINR } from '../../lib/fx'

export default function LoanDetail() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const loans = useStore((s) => s.loans)
  const transactions = useStore((s) => s.transactions)
  const loan = loans.find((l) => l.id === loanId)
  if (!loan) return null

  const loanTxs = transactions.filter((t) => t.loanId === loanId)

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title={loan.lender} subtitle={loan.accountMasked} />
      <div className="px-5 pb-4">
        <div className="mb-4">
          <GradientCard>
            <p className="text-white/70 text-xs mb-1">Outstanding Balance</p>
            <p className="text-white text-3xl font-bold">{formatINR(loan.outstandingAmount)}</p>
            <div className="mt-3 flex gap-6">
              <div>
                <p className="text-white/60 text-xs">EMI</p>
                <p className="text-white font-semibold text-sm">{formatINR(loan.emiAmount)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Next Due</p>
                <p className="text-white font-semibold text-sm">{loan.nextDueDate}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Sanctioned</p>
                <p className="text-white font-semibold text-sm">{formatINR(loan.sanctionedAmount)}</p>
              </div>
            </div>
          </GradientCard>
        </div>

        <div className="bg-[#f9fafb] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={13} className="text-[#6b7280]" />
            <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Repayment Destination</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-sm font-bold text-[#1a56db]">
              {loan.repaymentAccount.bank[0]}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#111827]">{loan.repaymentAccount.bank}</p>
              <p className="text-xs text-[#9ca3af]">{loan.repaymentAccount.accountMasked} · {loan.repaymentAccount.ifsc}</p>
            </div>
          </div>
        </div>

        {loanTxs.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[14px] font-semibold text-[#111827]">Payment History</p>
              <button
                onClick={() => navigate('/transactions')}
                className="text-xs text-[#1a56db] font-medium flex items-center gap-1"
              >
                All <ArrowRight size={12} />
              </button>
            </div>
            {loanTxs.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
            ))}
          </div>
        )}

        <Button variant="primary" fullWidth onClick={() => navigate(`/loans/${loanId}/pay/amount`)}>
          Repay Now
        </Button>
        <div className="pb-2" />
      </div>
    </div>
  )
}
