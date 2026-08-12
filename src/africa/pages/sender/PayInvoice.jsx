import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Landmark, Copy, CheckCircle2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import CountdownTimer from '../../../components/ui/CountdownTimer'
import PipelineSteps from '../../components/PipelineSteps'
import useAfricaStore from '../../store'
import { formatUSD, formatNGN } from '../../lib/fx'
import { ONRAMP_PARTNER_BANK } from '../../lib/mock'

export default function PayInvoice() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const invoice = useAfricaStore((s) => s.invoices.find((i) => i.id === invoiceId))
  const walletBalance = useAfricaStore((s) => s.senderWallet.balanceUSD)
  const generateInvoiceQuote = useAfricaStore((s) => s.generateInvoiceQuote)
  const confirmBankTransfer = useAfricaStore((s) => s.confirmBankTransfer)
  const payFromWallet = useAfricaStore((s) => s.payFromWallet)

  const [step, setStep] = useState(invoice?.status === 'created' ? 'quote' : 'status')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (invoice && invoice.status === 'created' && !invoice.quote) {
      generateInvoiceQuote(invoice.id)
    }
  }, [invoice, generateInvoiceQuote])

  if (!invoice) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center text-[#9ca3af]">Invoice not found.</div>
    )
  }

  const canPayFromWallet = walletBalance >= invoice.amountUSD
  const reference = `DGF-${invoice.invoiceNumber}`

  const refreshQuote = () => {
    generateInvoiceQuote(invoice.id)
    setExpired(false)
  }

  const payViaWallet = () => {
    payFromWallet(invoice.id)
    setStep('status')
  }

  const confirmTransferSent = () => {
    confirmBankTransfer(invoice.id)
    setStep('status')
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate('/africa/sender/invoices')}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111827] mb-6"
      >
        <ArrowLeft size={14} /> Back to invoices
      </button>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-5">
        <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">{invoice.invoiceNumber}</p>
        <h1 className="text-lg font-bold text-[#111827] mt-1">{invoice.description}</h1>
        <p className="text-2xl font-bold text-[#111827] mt-3">{formatUSD(invoice.amountUSD)}</p>
      </div>

      {step === 'quote' && invoice.quote && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Live quote</span>
              {!expired ? (
                <CountdownTimer expiresAt={invoice.quote.expiresAt} onExpire={() => setExpired(true)} />
              ) : (
                <span className="text-sm font-semibold text-[#dc2626]">Rate expired</span>
              )}
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-[#6b7280]">You pay</span>
              <span className="font-mono font-semibold text-[#111827]">{formatNGN(invoice.quote.amountNGN)}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-[#6b7280]">Rate</span>
              <span className="font-mono text-[#111827]">1 USD = {invoice.quote.rate} NGN</span>
            </div>
            {expired && (
              <Button variant="ghost" size="sm" fullWidth className="mt-2" onClick={refreshQuote}>
                Refresh quote
              </Button>
            )}
          </div>

          <div className="border-t border-[#f3f4f6] pt-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#111827]">How do you want to pay?</p>

            <button
              disabled={expired}
              onClick={() => setStep('bank-details')}
              className="flex items-center gap-3 border border-[#e5e7eb] rounded-xl p-4 text-left hover:border-[#1a56db] transition-colors disabled:opacity-50"
            >
              <Landmark size={18} className="text-[#1a56db] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111827]">Bank transfer</p>
                <p className="text-xs text-[#9ca3af]">Wire NGN to our onramp partner</p>
              </div>
            </button>

            <button
              disabled={expired || !canPayFromWallet}
              onClick={payViaWallet}
              className="flex items-center gap-3 border border-[#e5e7eb] rounded-xl p-4 text-left hover:border-[#1a56db] transition-colors disabled:opacity-50"
            >
              <Wallet size={18} className="text-[#1a56db] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111827]">Treasury wallet</p>
                <p className="text-xs text-[#9ca3af]">
                  {canPayFromWallet
                    ? `Pay instantly · ${formatUSD(walletBalance)} available`
                    : `Insufficient balance · ${formatUSD(walletBalance)} available`}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'bank-details' && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-sm font-semibold text-[#111827]">Transfer {formatNGN(invoice.quote.amountNGN)} to:</p>
          {[
            ['Bank', ONRAMP_PARTNER_BANK.bankName],
            ['Account name', ONRAMP_PARTNER_BANK.accountName],
            ['Account number', ONRAMP_PARTNER_BANK.accountNumber],
            ['Reference', reference],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border-b border-[#f3f4f6] pb-2 last:border-0">
              <span className="text-sm text-[#6b7280]">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold text-[#111827]">{value}</span>
                <Copy size={13} className="text-[#9ca3af]" />
              </div>
            </div>
          ))}
          <p className="text-xs text-[#9ca3af]">
            Include the reference so we can match your payment automatically.
          </p>
          <Button variant="primary" fullWidth onClick={confirmTransferSent}>
            I've sent the transfer
          </Button>
        </div>
      )}

      {step === 'status' && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
          <div className="mb-8 mt-2 overflow-x-auto">
            <PipelineSteps status={invoice.status} timestamps={invoice.timestamps} />
          </div>
          {invoice.status === 'received_in_wallet' || invoice.status === 'received_in_bank' ? (
            <div className="flex items-center gap-2 text-[#16a34a] text-sm font-semibold mb-4">
              <CheckCircle2 size={16} /> Payment on its way to the receiver
            </div>
          ) : (
            <p className="text-sm text-[#6b7280] mb-4">
              {invoice.paymentMethod === 'wallet'
                ? 'Settling from your treasury wallet…'
                : "We're waiting to receive your bank transfer."}
            </p>
          )}
          <Button variant="ghost" fullWidth onClick={() => navigate('/africa/sender')}>
            Back to dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
