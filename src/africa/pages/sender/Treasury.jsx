import { useState } from 'react'
import { Wallet, Copy, CheckCircle2 } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import CountdownTimer from '../../../components/ui/CountdownTimer'
import useAfricaStore from '../../store'
import { formatUSD, formatNGN } from '../../lib/fx'
import { ONRAMP_PARTNER_BANK } from '../../lib/mock'

export default function Treasury() {
  const walletBalance = useAfricaStore((s) => s.senderWallet.balanceUSD)
  const topUps = useAfricaStore((s) => s.treasuryTopUps)
  const getTreasuryQuote = useAfricaStore((s) => s.getTreasuryQuote)
  const confirmTreasuryTopUp = useAfricaStore((s) => s.confirmTreasuryTopUp)

  const [step, setStep] = useState('form') // form | quote | done
  const [amountNGN, setAmountNGN] = useState('')
  const [quote, setQuote] = useState(null)
  const [expired, setExpired] = useState(false)

  const parsedAmount = parseFloat(amountNGN) || 0

  const getQuote = () => {
    if (parsedAmount <= 0) return
    setQuote(getTreasuryQuote(parsedAmount))
    setExpired(false)
    setStep('quote')
  }

  const refreshQuote = () => {
    setQuote(getTreasuryQuote(parsedAmount))
    setExpired(false)
  }

  const confirmTopUp = () => {
    confirmTreasuryTopUp(quote)
    setStep('done')
  }

  const startOver = () => {
    setStep('form')
    setAmountNGN('')
    setQuote(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Treasury</h1>
      <p className="text-[#6b7280] mb-6">Pre-fund your USD wallet so invoice payments settle instantly.</p>

      <div className="bg-gradient-to-br from-[#0061D3] to-[#00326D] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Wallet size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">Wallet balance</span>
        </div>
        <p className="text-3xl font-bold">{formatUSD(walletBalance)}</p>
        <p className="text-xs opacity-70 mt-1">USDT · 1:1 USD</p>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
        {step === 'form' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#111827]">Top up wallet</p>
            <Input
              label="Amount (NGN)"
              type="number"
              placeholder="e.g. 500000"
              value={amountNGN}
              onChange={(e) => setAmountNGN(e.target.value)}
            />
            <Button variant="primary" disabled={parsedAmount <= 0} onClick={getQuote}>
              Get quote
            </Button>
          </div>
        )}

        {step === 'quote' && quote && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Live quote</span>
                {!expired ? (
                  <CountdownTimer expiresAt={quote.expiresAt} onExpire={() => setExpired(true)} />
                ) : (
                  <span className="text-sm font-semibold text-[#dc2626]">Rate expired</span>
                )}
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#6b7280]">You send</span>
                <span className="font-mono font-semibold text-[#111827]">{formatNGN(quote.amountNGN)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#6b7280]">Rate</span>
                <span className="font-mono text-[#111827]">1 USD = {quote.rate} NGN</span>
              </div>
              <div className="flex justify-between text-sm py-1 font-semibold">
                <span className="text-[#111827]">Wallet credit</span>
                <span className="font-mono text-[#16a34a]">{formatUSD(quote.amountUSD)}</span>
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-4 flex flex-col gap-3">
              {[
                ['Bank', ONRAMP_PARTNER_BANK.bankName],
                ['Account name', ONRAMP_PARTNER_BANK.accountName],
                ['Account number', ONRAMP_PARTNER_BANK.accountNumber],
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

            {expired ? (
              <Button variant="ghost" fullWidth onClick={refreshQuote}>
                Refresh quote
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={confirmTopUp}>
                I've sent the transfer
              </Button>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 size={32} className="text-[#16a34a]" />
            <p className="text-sm font-semibold text-[#111827]">Top-up submitted</p>
            <p className="text-xs text-[#9ca3af]">Your wallet will be credited in a few seconds.</p>
            <Button variant="ghost" onClick={startOver}>
              Top up again
            </Button>
          </div>
        )}
      </div>

      {topUps.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-[#111827] mb-3">Top-up history</p>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl divide-y divide-[#f3f4f6]">
            {topUps.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-[#6b7280]">{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="font-mono text-[#111827]">{formatNGN(t.amountNGN)}</span>
                <span className="font-mono font-semibold text-[#16a34a]">+{formatUSD(t.amountUSD)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
