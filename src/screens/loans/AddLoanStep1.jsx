import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Input from '../../components/ui/Input'
import Dropdown from '../../components/ui/Dropdown'
import Button from '../../components/ui/Button'

const LENDERS = [
  { value: 'HDFC Credila', label: 'HDFC Credila' },
  { value: 'Avanse', label: 'Avanse Financial Services' },
  { value: 'Auxilo', label: 'Auxilo Finserve' },
  { value: 'InCred', label: 'InCred Finance' },
  { value: 'ICICI Bank', label: 'ICICI Bank' },
  { value: 'SBI', label: 'State Bank of India' },
]

const STEPS = ['Loan Details', 'Repayment A/c', 'Confirm']

export default function AddLoanStep1() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ lender: '', accountNumber: '', sanctionedAmount: '', emiAmount: '', nextDueDate: '' })

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const setInput = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const canContinue = form.lender && form.accountNumber && form.sanctionedAmount && form.emiAmount && form.nextDueDate

  const handleContinue = () => {
    sessionStorage.setItem('addLoan_step1', JSON.stringify(form))
    navigate('/loans/add/step2')
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Add Loan" />
      <StepProgress steps={STEPS} currentStep={0} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <Dropdown label="Lender" options={LENDERS} value={form.lender} onChange={setField('lender')} placeholder="Select lender" />
        <Input label="Loan account number" value={form.accountNumber} onChange={setInput('accountNumber')} placeholder="Last 4 digits or full number" />
        <Input label="Sanctioned amount (₹)" value={form.sanctionedAmount} onChange={setInput('sanctionedAmount')} type="number" placeholder="e.g. 3200000" />
        <Input label="EMI amount (₹)" value={form.emiAmount} onChange={setInput('emiAmount')} type="number" placeholder="e.g. 32500" />
        <Input label="Next due date" value={form.nextDueDate} onChange={setInput('nextDueDate')} type="date" />
        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleContinue} disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
