import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import FeeBreakdown from '../../components/domain/FeeBreakdown'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR, formatSource } from '../../lib/fx'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']

export default function PayReview() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const activePayment = useStore((s) => s.activePayment)
  const loans = useStore((s) => s.loans)
  const paymentSource = useStore((s) => s.paymentSource)
  const loan = loans.find((l) => l.id === loanId)

  if (!activePayment || !loan) return null
  const { quote } = activePayment

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Confirm Payment" />
      <StepProgress steps={STEPS} currentStep={2} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <div className="bg-[#f9fafb] rounded-2xl p-4">
          <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Transfer Summary</p>
          {[
            ['From', `${paymentSource?.bankName} ${paymentSource?.accountMasked}`],
            ['To', `${loan.repaymentAccount.bank} ${loan.repaymentAccount.accountMasked}`],
            ['Purpose', 'Loan Repayment'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-[#f3f4f6] last:border-0">
              <span className="text-sm text-[#9ca3af]">{k}</span>
              <span className="text-sm font-medium text-[#111827] text-right max-w-[60%] truncate">{v}</span>
            </div>
          ))}
        </div>
        <FeeBreakdown quote={quote} />
        <div className="bg-[#fef3c7] rounded-2xl p-3">
          <p className="text-xs text-[#92400e]">
            By confirming, you authorize Borderless to debit {formatSource(quote.total, quote.currency)} from your {paymentSource?.bankName} account and credit {formatINR(quote.amountINR)} to {loan.repaymentAccount.bank}. This action cannot be undone.
          </p>
        </div>
        <Button variant="primary" fullWidth onClick={() => navigate(`/loans/${loanId}/pay/processing`)}>
          Confirm & Pay
        </Button>
        <div className="pb-2" />
      </div>
    </div>
  )
}
