import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR } from '../../lib/fx'

const STEPS = ['Loan Details', 'Repayment A/c', 'Confirm']

export default function AddLoanStep3() {
  const navigate = useNavigate()
  const addLoan = useStore((s) => s.addLoan)
  const [loading, setLoading] = useState(false)

  const step1 = JSON.parse(sessionStorage.getItem('addLoan_step1') || '{}')
  const step2 = JSON.parse(sessionStorage.getItem('addLoan_step2') || '{}')

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    addLoan({
      lender: step1.lender,
      accountMasked: '****' + (step1.accountNumber || '').slice(-4),
      sanctionedAmount: Number(step1.sanctionedAmount),
      outstandingAmount: Number(step1.sanctionedAmount) * 0.89,
      emiAmount: Number(step1.emiAmount),
      nextDueDate: step1.nextDueDate,
      repaymentAccount: {
        bank: step2.bank,
        accountMasked: '****' + (step2.accountNumber || '').slice(-4),
        ifsc: step2.ifsc,
        accountName: step2.accountName,
      },
    })
    sessionStorage.removeItem('addLoan_step1')
    sessionStorage.removeItem('addLoan_step2')
    setLoading(false)
    navigate('/loans')
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Add Loan" />
      <StepProgress steps={STEPS} currentStep={2} />
      <div className="px-5 pb-6 mt-2">
        <h2 className="text-[15px] font-semibold text-[#111827] mb-4">Review & Confirm</h2>
        <div className="flex flex-col gap-3 mb-6">
          <div className="bg-[#f9fafb] rounded-2xl p-4">
            <p className="text-xs font-medium text-[#6b7280] mb-3 uppercase tracking-wide">Loan Details</p>
            {[
              ['Lender', step1.lender],
              ['Account', '****' + (step1.accountNumber || '').slice(-4)],
              ['Sanctioned', formatINR(Number(step1.sanctionedAmount))],
              ['Monthly EMI', formatINR(Number(step1.emiAmount))],
              ['Next Due', step1.nextDueDate],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#9ca3af]">{k}</span>
                <span className="text-sm font-medium text-[#111827]">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#f9fafb] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={13} className="text-[#6b7280]" />
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Repayment Account (Locked)</p>
            </div>
            {[
              ['Bank', step2.bank],
              ['Account', '****' + (step2.accountNumber || '').slice(-4)],
              ['Name', step2.accountName],
              ['IFSC', step2.ifsc],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#9ca3af]">{k}</span>
                <span className="text-sm font-medium text-[#111827]">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <Button variant="primary" fullWidth onClick={handleConfirm} loading={loading}>
          Confirm & Add Loan
        </Button>
      </div>
    </div>
  )
}
