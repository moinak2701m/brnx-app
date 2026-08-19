import { useState } from 'react'
import { Copy } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import CountdownTimer from '../../../components/ui/CountdownTimer'
import Badge from '../../../components/ui/Badge'
import PipelineSteps, { TOPUP_STEPS } from '../../components/PipelineSteps'
import useAfricaStore from '../../store'
import { formatUSD, formatNGN } from '../../lib/fx'
import { ONRAMP_PARTNER_BANK } from '../../lib/mock'

export default function Treasury() {
  const walletBalance = useAfricaStore((s) => s.senderWallet.balanceUSD)
  const topUps = useAfricaStore((s) => s.treasuryTopUps)
  const initiateTreasuryTopUp = useAfricaStore((s) => s.initiateTreasuryTopUp)
  const confirmTreasuryTransferSent = useAfricaStore((s) => s.confirmTreasuryTransferSent)
  const declineTreasuryTopUp = useAfricaStore((s) => s.declineTreasuryTopUp)

  const [step, setStep] = useState('form') // form | bank-details | status
  const [amountUSD, setAmountUSD] = useState('')
  const [topUp, setTopUp] = useState(null)
  const [expired, setExpired] = useState(false)

  // Keep the in-flight top-up's status live as the store updates it.
  const liveTopUp = useAfricaStore((s) => s.treasuryTopUps.find((t) => t.id === topUp?.id)) || topUp

  const parsedAmount = parseFloat(amountUSD) || 0

  const getQuote = () => {
    if (parsedAmount <= 0) return
    setTopUp(initiateTreasuryTopUp(parsedAmount))
    setExpired(false)
    setStep('bank-details')
  }

  const refreshQuote = () => {
    setTopUp(initiateTreasuryTopUp(parsedAmount))
    setExpired(false)
  }

  const confirmTransferSent = () => {
    confirmTreasuryTransferSent(topUp.id)
    setStep('status')
  }

  const declineQuote = () => {
    declineTreasuryTopUp(topUp.id)
    setTopUp(null)
    setExpired(false)
    setStep('form')
  }

  const startOver = () => {
    setStep('form')
    setAmountUSD('')
    setTopUp(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Treasury</h1>
      <p className="text-[#6b7280] mb-6">Pre-fund your USD wallet so invoice payments settle instantly.</p>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-6 inline-block mb-6">
        <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">Wallet Balance</p>
        <p className="text-3xl font-bold text-[#111827]">{formatUSD(walletBalance)}</p>
        <p className="text-xs text-[#9ca3af] mt-1">USDT · 1:1 USD</p>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-6">
        {step === 'form' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#111827]">Top up wallet</p>
            <Input
              label="Amount (USD)"
              type="number"
              placeholder="e.g. 300"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
            />
            <Button variant="primary" disabled={parsedAmount <= 0} onClick={getQuote}>
              Get quote
            </Button>
          </div>
        )}

        {step === 'bank-details' && topUp && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider">Live quote</span>
                {!expired ? (
                  <CountdownTimer expiresAt={topUp.quote.expiresAt} onExpire={() => setExpired(true)} />
                ) : (
                  <span className="text-sm font-semibold text-[#dc2626]">Rate expired</span>
                )}
              </div>
              <div className="flex justify-between text-sm py-1 font-semibold">
                <span className="text-[#111827]">Wallet credit</span>
                <span className="font-mono text-[#16a34a]">{formatUSD(topUp.amountUSD)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#6b7280]">You send</span>
                <span className="font-mono font-semibold text-[#111827]">{formatNGN(topUp.quote.amountNGN)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#6b7280]">Rate</span>
                <span className="font-mono text-[#111827]">1 USD = {topUp.quote.rate} NGN</span>
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#111827]">Transfer {formatNGN(topUp.quote.amountNGN)} to:</p>
              {[
                ['Bank', ONRAMP_PARTNER_BANK.bankName],
                ['Account name', ONRAMP_PARTNER_BANK.accountName],
                ['Account number', ONRAMP_PARTNER_BANK.accountNumber],
                ['Reference', `DGF-${topUp.id.slice(-6)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[#6b7280]">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-[#111827]">{value}</span>
                    <Copy size={13} className="text-[#9ca3af]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={declineQuote}>
                Decline
              </Button>
              {expired ? (
                <Button variant="primary" fullWidth onClick={refreshQuote}>
                  Refresh quote
                </Button>
              ) : (
                <Button variant="primary" fullWidth onClick={confirmTransferSent}>
                  I've sent the transfer
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'status' && liveTopUp && (
          <div>
            <div className="mb-6 mt-2 overflow-x-auto">
              <PipelineSteps status={liveTopUp.status} timestamps={liveTopUp.timestamps} steps={TOPUP_STEPS} />
            </div>
            <p className="text-sm text-[#6b7280] mb-4">
              {liveTopUp.status === 'received_in_wallet'
                ? `${formatUSD(liveTopUp.amountUSD)} is now available in your wallet.`
                : "We're waiting to receive your bank transfer."}
            </p>
            <Button variant="ghost" fullWidth onClick={startOver}>
              Top up again
            </Button>
          </div>
        )}
      </div>

      {topUps.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[#111827] mb-3">Top-up history</p>
          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] divide-y divide-[#f3f4f6]">
            {topUps.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 text-sm hover:bg-[#f9fafb] transition-colors">
                <span className="text-[#6b7280]">
                  {t.timestamps?.created
                    ? new Date(t.timestamps.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
                <span className="font-mono text-[#111827]">{t.quote?.amountNGN ? formatNGN(t.quote.amountNGN) : '—'}</span>
                <span className="font-mono font-semibold text-[#16a34a]">+{formatUSD(t.amountUSD)}</span>
                <Badge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
