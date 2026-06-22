import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import Input from '../../components/ui/Input'
import Dropdown from '../../components/ui/Dropdown'
import PillSelector from '../../components/ui/PillSelector'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'

const PURPOSE_OPTIONS = [
  { value: 'family', label: 'Family Member' },
  { value: 'loan',   label: 'Repayment Account' },
  { value: 'self',   label: 'My Account' },
]

const RELATION_OPTIONS = [
  { value: 'Father',  label: 'Father' },
  { value: 'Mother',  label: 'Mother' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Spouse',  label: 'Spouse' },
  { value: 'Other',   label: 'Other' },
]

const LENDER_OPTIONS = [
  { value: 'HSBC',                      label: 'HSBC' },
  { value: 'Avanse Financial Services', label: 'Avanse Financial Services' },
  { value: 'ICICI Bank',                label: 'ICICI Bank' },
  { value: 'Axis Bank',                 label: 'Axis Bank' },
  { value: 'SBI',                       label: 'SBI' },
  { value: 'Other',                     label: 'Other' },
]

export default function AddBeneficiary() {
  const navigate = useNavigate()
  const addBeneficiary = useStore((s) => s.addBeneficiary)
  const user = useStore((s) => s.user)

  const [purpose, setPurpose] = useState('family')
  const [form, setForm] = useState({
    name: '', relation: '', lender: '',
    bank: '', accountNumber: '', ifsc: '',
  })
  const [loading, setLoading] = useState(false)
  const [verification, setVerification] = useState(null) // { status, nameFromBank, ref } | { error }
  const [verifying, setVerifying] = useState(false)

  const setField = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setVerification(null)
  }
  const setInput = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setVerification(null)
  }

  const bankValid = form.bank && form.accountNumber && form.ifsc
  const holderName = purpose === 'family' ? form.name
    : purpose === 'loan' ? (form.lender === 'Other' ? 'Repayment Account' : form.lender)
    : (user?.name || 'My Account')

  const canVerify = bankValid && !!holderName && !verifying
  const verified  = verification?.status === 'SUCCESS' || verification?.status === 'success'

  let canSave = false
  if (purpose === 'family') canSave = form.name && form.relation && verified
  if (purpose === 'loan')   canSave = form.lender && verified
  if (purpose === 'self')   canSave = verified

  const handleVerify = async () => {
    setVerifying(true)
    setVerification(null)
    try {
      const res = await fetch('/api/transfers/validate-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number:       form.accountNumber,
          ifsc:                 form.ifsc.toUpperCase(),
          account_holder_name:  holderName,
          currency:             'inr',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setVerification({ status: data.status, nameFromBank: data.account_holder_name_from_bank, ref: data.transaction_reference_no })
    } catch (err) {
      setVerification({ error: err.message })
    } finally {
      setVerifying(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    let beneficiary = {}
    if (purpose === 'family') {
      beneficiary = {
        name: form.name,
        relation: form.relation,
        purpose: 'family',
        bankAccount: { bank: form.bank, accountMasked: '****' + form.accountNumber.slice(-4), ifsc: form.ifsc },
      }
    } else if (purpose === 'loan') {
      beneficiary = {
        name: form.lender === 'Other' ? 'Repayment Account' : form.lender,
        relation: 'Repayment Account',
        purpose: 'loan',
        bankAccount: { bank: form.bank, accountMasked: '****' + form.accountNumber.slice(-4), ifsc: form.ifsc },
      }
    } else if (purpose === 'self') {
      beneficiary = {
        name: user?.name || 'My Account',
        relation: 'Self',
        purpose: 'self',
        bankAccount: { bank: form.bank, accountMasked: '****' + form.accountNumber.slice(-4), ifsc: form.ifsc },
      }
    }
    addBeneficiary(beneficiary)
    setLoading(false)
    navigate('/send')
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Add Beneficiary" />
      <div className="px-5 pb-6 flex flex-col gap-4 pt-4">

        <PillSelector
          options={PURPOSE_OPTIONS}
          value={purpose}
          onChange={(v) => { setPurpose(v); setForm((f) => ({ ...f, bank: '', accountNumber: '', ifsc: '' })) }}
          label="Purpose"
        />

        {purpose === 'family' && (
          <>
            <Input label="Full name" value={form.name} onChange={setInput('name')} placeholder="Ramesh Mehta" />
            <Dropdown label="Relation" options={RELATION_OPTIONS} value={form.relation} onChange={setField('relation')} placeholder="Select relation" />
          </>
        )}

        {purpose === 'loan' && (
          <Dropdown label="Institution" options={LENDER_OPTIONS} value={form.lender} onChange={setField('lender')} placeholder="Select institution" />
        )}

        {purpose === 'self' && (
          <div className="bg-[#f9fafb] rounded-2xl p-4">
            <p className="text-xs text-[#9ca3af] mb-1">Account holder</p>
            <p className="text-[15px] font-semibold text-[#111827]">{user?.name}</p>
          </div>
        )}

        <Input label="Bank name" value={form.bank} onChange={setInput('bank')} placeholder="e.g. HSBC India, SBI" />
        <Input label="Account number" value={form.accountNumber} onChange={setInput('accountNumber')} />
        <Input label="IFSC code" value={form.ifsc} onChange={setInput('ifsc')} placeholder="e.g. SBIN0001234" />

        {/* Verify account */}
        {bankValid && (
          <div className="flex flex-col gap-2">
            <Button
              variant={verified ? 'ghost' : 'secondary'}
              fullWidth
              onClick={handleVerify}
              loading={verifying}
              disabled={!canVerify || verified}
            >
              {verified ? '✓ Account Verified' : 'Verify Bank Account'}
            </Button>

            {verified && verification.nameFromBank && (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl px-4 py-3">
                <p className="text-xs text-[#16a34a] font-semibold mb-0.5">Name on bank account</p>
                <p className="text-[15px] font-bold text-[#111827]">{verification.nameFromBank}</p>
                {verification.ref && (
                  <p className="text-[11px] text-[#9ca3af] mt-1">Ref: {verification.ref}</p>
                )}
              </div>
            )}

            {verification?.error && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl px-4 py-3">
                <p className="text-xs text-[#dc2626] font-semibold mb-0.5">Verification failed</p>
                <p className="text-[13px] text-[#dc2626]">{verification.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleSave} loading={loading} disabled={!canSave}>
            Save Beneficiary
          </Button>
        </div>
      </div>
    </div>
  )
}
