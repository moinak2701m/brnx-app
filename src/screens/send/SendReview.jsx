import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR, formatRate, formatSource } from '../../lib/fx'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']

// Fallback shown while the initiate API is loading or if it errors
const FALLBACK_BANK = {
  accountName: 'Apex Remittance Inc.',
  bankName: 'JPMorgan Chase',
  accountNumber: '8872 0041 3321',
  routingNumber: '021000021',
  swift: 'CHASUS33',
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#f3f4f6] last:border-0">
      <span className="text-xs text-[#9ca3af]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#111827]">{value}</span>
        <button onClick={copy} className="text-[#9ca3af] hover:text-[#1a56db] transition-colors">
          {copied ? <CheckCircle2 size={14} className="text-[#16a34a]" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function SendReview() {
  const navigate = useNavigate()
  const activePayment  = useStore((s) => s.activePayment)
  const addTransaction = useStore((s) => s.addTransaction)
  const clearActivePayment = useStore((s) => s.clearActivePayment)

  const [proof,     setProof]     = useState(null)
  const [uploading, setUploading] = useState(false)
  const [bankDetails, setBankDetails] = useState(FALLBACK_BANK)
  const [txId,      setTxId]      = useState(null)
  const [loadingBank, setLoadingBank] = useState(true)
  const [confirming,  setConfirming]  = useState(false)
  const fileRef    = useRef()
  const initiated  = useRef(false)

  const { beneficiary, quote } = activePayment ?? {}

  // Fetch live bank details + PrimeVault quote on mount
  useEffect(() => {
    if (!activePayment || initiated.current) return
    initiated.current = true

    const amountUSD = quote?.total
    const amountINR = quote?.amountINR

    fetch('/api/transfers/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountUSD,
        amountINR,
        beneficiary: {
          name: beneficiary?.name,
          accountNumber: beneficiary?.bankAccount?.accountMasked,
          ifsc: beneficiary?.bankAccount?.ifsc,
          bankName: beneficiary?.bankAccount?.bank,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.bankDetails) setBankDetails(data.bankDetails)
        if (data.txId) setTxId(data.txId)
      })
      .catch(() => { /* keep fallback bank details */ })
      .finally(() => setLoadingBank(false))
  }, [activePayment]) // eslint-disable-line

  if (!activePayment) return null

  const destLabel = beneficiary.bankAccount
    ? `${beneficiary.bankAccount.bank} ${beneficiary.bankAccount.accountMasked}`
    : '—'

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      setProof({ name: file.name, size: (file.size / 1024).toFixed(0) + ' KB' })
      setUploading(false)
    }, 900)
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      // Notify backend the user has confirmed and will wire
      if (txId) {
        await fetch('/api/transfers/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txId }),
        }).catch(() => {})
      }

      // Record in local transaction history
      addTransaction({
        type: 'transfer',
        purpose: beneficiary?.purpose ?? 'family',
        beneficiaryName: beneficiary?.name || 'Recipient',
        amountINR: quote.amountINR,
        amountSource: quote.total,
        currency: quote.currency,
        status: 'credited',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      })
      clearActivePayment()
      navigate(`/send/success${txId ? `?txId=${txId}` : ''}`)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-white lg:max-w-[600px] lg:mx-auto lg:my-8 lg:rounded-2xl lg:shadow-sm lg:border lg:border-[#e5e7eb] lg:min-h-0">
      <ScreenHeader title="Review Transfer" />
      <StepProgress steps={STEPS} currentStep={2} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2 overflow-y-auto">

        {/* Transfer summary */}
        <div className="bg-[#f9fafb] rounded-2xl p-4">
          <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Transfer Summary</p>
          {[
            ['Recipient',      beneficiary.name],
            ['To account',     destLabel],
            ['Exchange rate',  `1 ${quote.currency} = ${formatRate(quote.rate)}`],
            ['You send',       formatSource(quote.total, quote.currency)],
            ['Recipient gets', formatINR(quote.amountINR)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-[#f3f4f6] last:border-0">
              <span className="text-sm text-[#9ca3af]">{k}</span>
              <span className={`text-sm font-medium text-right max-w-[60%] truncate
                ${k === 'Recipient gets' ? 'text-[#16a34a]' : 'text-[#111827]'}`}>{v}</span>
            </div>
          ))}
        </div>

        {/* Wire bank details */}
        <div className="bg-[#f9fafb] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide">Wire Transfer To</p>
            {loadingBank && <Loader2 size={13} className="text-[#9ca3af] animate-spin" />}
          </div>
          <CopyRow label="Account name"   value={bankDetails.accountName} />
          <CopyRow label="Bank"           value={bankDetails.bankName} />
          <CopyRow label="Account number" value={bankDetails.accountNumber} />
          <CopyRow label="Routing number" value={bankDetails.routingNumber} />
          {bankDetails.swift && <CopyRow label="SWIFT / BIC" value={bankDetails.swift} />}
          {bankDetails.iban  && <CopyRow label="IBAN"        value={bankDetails.iban} />}
        </div>

        {/* Upload proof */}
        <div>
          <p className="text-sm font-medium text-[#111827] mb-2">Payment acknowledgement</p>
          {proof ? (
            <div className="flex items-center gap-3 bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0]">
              <FileText size={20} className="text-[#16a34a] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">{proof.name}</p>
                <p className="text-xs text-[#6b7280]">{proof.size}</p>
              </div>
              <CheckCircle2 size={18} className="text-[#16a34a] flex-shrink-0" />
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-[#d1d5db] rounded-2xl p-6 flex flex-col items-center gap-2 text-[#9ca3af] hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
            >
              <Upload size={22} />
              <p className="text-sm font-medium">
                {uploading ? 'Uploading…' : 'Tap to upload receipt or screenshot'}
              </p>
              <p className="text-xs">PDF, PNG or JPG</p>
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFile} />
        </div>

        {/* Delivery estimate */}
        <div className="flex items-center justify-between bg-[#f9fafb] rounded-2xl px-4 py-3">
          <span className="text-sm text-[#6b7280]">Estimated delivery</span>
          <span className="text-sm font-semibold text-[#111827]">Near instant</span>
        </div>

        <Button variant="primary" fullWidth onClick={handleConfirm} disabled={!proof || confirming}>
          {confirming ? 'Confirming…' : 'Confirm & Send'}
        </Button>
        <div className="pb-2" />
      </div>
    </div>
  )
}
