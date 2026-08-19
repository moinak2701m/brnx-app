import { useState } from 'react'
import Input from '../../../components/ui/Input'
import Dropdown from '../../../components/ui/Dropdown'
import Button from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import useAfricaStore from '../../store'

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

export default function Settings() {
  const receiverBank = useAfricaStore((s) => s.receiverBank)
  const setReceiverBank = useAfricaStore((s) => s.setReceiverBank)
  const toast = useToast()

  const [form, setForm] = useState(receiverBank)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }))

  const save = () => {
    setReceiverBank(form)
    toast?.('Bank account saved')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Payout bank account</h1>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-4">
        <Input label="Bank name" value={form.bankName} onChange={set('bankName')} />
        <Input label="Account name" value={form.accountName} onChange={set('accountName')} />
        <Input label="Account number" value={form.accountNumber} onChange={set('accountNumber')} />
        <Dropdown label="Currency" value={form.currency} onChange={set('currency')} options={CURRENCIES} />
        <Button variant="primary" fullWidth onClick={save} className="mt-2">
          Save bank account
        </Button>
      </div>
    </div>
  )
}
