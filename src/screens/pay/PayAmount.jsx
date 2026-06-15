import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import PillSelector from '../../components/ui/PillSelector'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR } from '../../lib/fx'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']
const PRESETS = [
  { value: 'emi', label: 'Full EMI' },
  { value: 'custom', label: 'Custom Amount' },
]

export default function PayAmount() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const loans = useStore((s) => s.loans)
  const loan = loans.find((l) => l.id === loanId)
  const [preset, setPreset] = useState('emi')
  const [customAmount, setCustomAmount] = useState('')

  if (!loan) return null

  const amount = preset === 'emi' ? loan.emiAmount : Number(customAmount)
  const canContinue = amount > 0

  const handleContinue = () => {
    sessionStorage.setItem('pay_amount', String(amount))
    navigate(`/loans/${loanId}/pay/quote`)
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Repay Loan" subtitle={loan.lender} />
      <StepProgress steps={STEPS} currentStep={0} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <div className="bg-[#f9fafb] rounded-2xl p-4">
          <p className="text-xs text-[#9ca3af] mb-1">Repaying to</p>
          <p className="text-[15px] font-semibold text-[#111827]">{loan.repaymentAccount.bank}</p>
          <p className="text-xs text-[#6b7280]">{loan.repaymentAccount.accountMasked} · {loan.repaymentAccount.ifsc}</p>
        </div>
        <PillSelector options={PRESETS} value={preset} onChange={setPreset} label="Payment amount" />
        {preset === 'emi' ? (
          <div className="bg-[#eff6ff] rounded-2xl p-5 text-center">
            <p className="text-xs text-[#6b7280] mb-1">Monthly EMI</p>
            <p className="text-4xl font-bold text-[#1a56db]">{formatINR(loan.emiAmount)}</p>
          </div>
        ) : (
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-[#6b7280]">₹</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-[#111827] border-2 border-[#e5e7eb] rounded-2xl focus:border-[#1a56db] outline-none text-center"
              />
            </div>
            {customAmount && <p className="text-xs text-[#9ca3af] mt-2 text-center">{formatINR(Number(customAmount))}</p>}
          </div>
        )}
        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleContinue} disabled={!canContinue}>
            Get Quote
          </Button>
        </div>
      </div>
    </div>
  )
}
