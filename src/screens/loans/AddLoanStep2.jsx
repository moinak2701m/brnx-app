import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const STEPS = ['Loan Details', 'Repayment A/c', 'Confirm']

export default function AddLoanStep2() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ bank: 'HSBC India', accountNumber: '', accountName: '', ifsc: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canContinue = form.bank && form.accountNumber && form.accountName && form.ifsc

  const handleContinue = () => {
    sessionStorage.setItem('addLoan_step2', JSON.stringify(form))
    navigate('/loans/add/step3')
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Add Loan" />
      <StepProgress steps={STEPS} currentStep={1} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <div className="bg-[#eff6ff] rounded-2xl p-4 flex gap-3">
          <Lock size={16} className="text-[#1a56db] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#1e40af] leading-relaxed">
            This is the Indian bank account where your lender disbursed the loan (e.g. HSBC India loan account). All repayments will go here and cannot be changed later.
          </p>
        </div>
        <Input label="Bank name" value={form.bank} onChange={set('bank')} />
        <Input label="Account number" value={form.accountNumber} onChange={set('accountNumber')} placeholder="Enter full account number" />
        <Input label="Account holder name" value={form.accountName} onChange={set('accountName')} placeholder="As per bank records" />
        <Input label="IFSC code" value={form.ifsc} onChange={set('ifsc')} placeholder="e.g. HSBC0400002" />
        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleContinue} disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
