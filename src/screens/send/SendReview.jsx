import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Upload, CheckCircle2, FileText, Loader2, Zap } from 'lucide-react'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR, formatRate, formatSource } from '../../lib/fx'
import useIsDesktop from '../../hooks/useIsDesktop'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']

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
    <div className="flex justify-between items-center py-2.5 border-b border-[#f3f4f6] last:border-0">
      <span className="text-sm text-[#9ca3af]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#111827] font-mono">{value}</span>
        <button onClick={copy} className="text-[#c4c9d4] hover:text-[#1a56db] transition-colors p-0.5">
          {copied ? <CheckCircle2 size={14} className="text-[#16a34a]" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function SendReview() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const activePayment  = useStore((s) => s.activePayment)
  const addTransaction = useStore((s) => s.addTransaction)
  const clearActivePayment = useStore((s) => s.clearActivePayment)

  const [proof,       setProof]       = useState(null)
  const [uploading,   setUploading]   = useState(false)
  const [bankDetails, setBankDetails] = useState(FALLBACK_BANK)
  const [txId,        setTxId]        = useState(null)
  const [loadingBank, setLoadingBank] = useState(true)
  const [confirming,  setConfirming]  = useState(false)
  const fileRef   = useRef()
  const initiated = useRef(false)

  const { beneficiary, quote } = activePayment ?? {}

  useEffect(() => {
    if (!activePayment || initiated.current) return
    initiated.current = true
    fetch('/api/transfers/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountUSD: quote?.total,
        amountINR: quote?.amountINR,
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
      .catch(() => {})
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
      if (txId) {
        await fetch('/api/transfers/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txId }),
        }).catch(() => {})
      }
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

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <div className="flex flex-col min-h-full bg-white">
        <ScreenHeader title="Review Transfer" />
        <StepProgress steps={STEPS} currentStep={2} />
        <div className="px-5 pb-6 flex flex-col gap-4 mt-2 overflow-y-auto">
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
                <span className={`text-sm font-medium text-right max-w-[60%] truncate ${k === 'Recipient gets' ? 'text-[#16a34a]' : 'text-[#111827]'}`}>{v}</span>
              </div>
            ))}
          </div>
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
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-[#d1d5db] rounded-2xl p-6 flex flex-col items-center gap-2 text-[#9ca3af] hover:border-[#1a56db] hover:text-[#1a56db] transition-colors">
                <Upload size={22} />
                <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Tap to upload receipt or screenshot'}</p>
                <p className="text-xs">PDF, PNG or JPG</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFile} />
          </div>
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

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header + step progress */}
      <div className="border-b border-[#f3f4f6] px-8 pt-6 pb-4">
        <h1 className="text-xl font-bold text-[#111827] mb-4">Review Transfer</h1>
        <StepProgress steps={STEPS} currentStep={2} />
      </div>

      {/* 2-column body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: wire instructions + upload */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">

          {/* Wire details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[#111827]">Wire transfer instructions</h2>
              {loadingBank && <Loader2 size={14} className="text-[#9ca3af] animate-spin" />}
            </div>
            <p className="text-sm text-[#9ca3af] mb-4">
              Send a USD wire to the account below. Your transfer will be processed once funds arrive.
            </p>
            <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden">
              <div className="bg-[#fafafa] px-5 py-3 border-b border-[#f3f4f6]">
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">Beneficiary bank account</p>
              </div>
              <div className="px-5 py-1">
                <CopyRow label="Account name"   value={bankDetails.accountName} />
                <CopyRow label="Bank"           value={bankDetails.bankName} />
                <CopyRow label="Account number" value={bankDetails.accountNumber} />
                <CopyRow label="Routing number" value={bankDetails.routingNumber} />
                {bankDetails.swift && <CopyRow label="SWIFT / BIC" value={bankDetails.swift} />}
                {bankDetails.iban  && <CopyRow label="IBAN"        value={bankDetails.iban} />}
              </div>
            </div>
          </div>

          {/* Upload */}
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827] mb-2">Payment acknowledgement</h2>
            <p className="text-sm text-[#9ca3af] mb-4">Upload your wire confirmation to speed up processing.</p>
            {proof ? (
              <div className="flex items-center gap-4 bg-[#f0fdf4] rounded-2xl p-5 border border-[#bbf7d0]">
                <FileText size={22} className="text-[#16a34a] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{proof.name}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{proof.size}</p>
                </div>
                <CheckCircle2 size={20} className="text-[#16a34a] flex-shrink-0" />
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-[#d1d5db] rounded-2xl p-8 flex flex-col items-center gap-2 text-[#9ca3af] hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
              >
                <Upload size={24} />
                <p className="text-sm font-medium">{uploading ? 'Uploading…' : 'Click to upload wire confirmation'}</p>
                <p className="text-xs">PDF, PNG or JPG</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFile} />
          </div>
        </div>

        {/* Right: summary + confirm */}
        <div className="w-[340px] flex-shrink-0 border-l border-[#e5e7eb] flex flex-col bg-[#fafafa]">
          <div className="p-6 flex-1">
            <h2 className="text-[13px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-4">Transfer summary</h2>

            {/* Amounts hero */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">You send</p>
                  <p className="text-white font-bold text-2xl">{formatSource(quote.total, quote.currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs mb-1">Recipient gets</p>
                  <p className="text-white font-bold text-2xl">{formatINR(quote.amountINR)}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-1.5">
                <Zap size={12} className="text-white/50" />
                <p className="text-white/50 text-xs">1 {quote.currency} = {formatRate(quote.rate)}</p>
              </div>
            </div>

            {/* Details */}
            {[
              ['Recipient',  beneficiary.name],
              ['To account', destLabel],
              ['Delivery',   'Near instant'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#9ca3af]">{k}</span>
                <span className="text-sm font-medium text-[#111827] text-right max-w-[55%] truncate">{v}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 border-t border-[#e5e7eb]">
            {!proof && (
              <p className="text-xs text-[#9ca3af] text-center mb-3">Upload your wire confirmation to continue</p>
            )}
            <Button variant="primary" fullWidth onClick={handleConfirm} disabled={!proof || confirming}>
              {confirming ? 'Confirming…' : 'Confirm & Send'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
