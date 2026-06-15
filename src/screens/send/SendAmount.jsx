import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import Button from '../../components/ui/Button'
import { formatINR, formatSource, getRate } from '../../lib/fx'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']
const QUICK_AMOUNTS = [5000, 10000, 25000, 50000]

export default function SendAmount() {
  const navigate = useNavigate()
  const beneficiary = JSON.parse(sessionStorage.getItem('send_beneficiary') || '{}')
  const [amount, setAmount] = useState('')
  const rate = useMemo(() => getRate('USD'), [])

  const handleQuick = (v) => setAmount(String(v))
  const inr = Number(amount)
  const usd = inr > 0 ? +(inr / rate).toFixed(2) : 0
  const canContinue = inr >= 100

  const handleContinue = () => {
    sessionStorage.setItem('send_amount', amount)
    navigate('/send/quote')
  }

  return (
    <div className="flex flex-col min-h-full bg-white lg:max-w-[560px] lg:mx-auto lg:w-full">
      <ScreenHeader title="Send Money" subtitle={`To ${beneficiary.name || ''}`} />
      <StepProgress steps={STEPS} currentStep={0} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="relative w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-[#6b7280]">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full pl-12 pr-4 py-5 text-4xl font-bold text-[#111827] border-2 border-[#e5e7eb] rounded-2xl focus:border-[#1a56db] outline-none text-center"
            />
          </div>
          {inr > 0 && (
            <div className="flex items-center gap-2 bg-[#f0fdf4] rounded-xl px-4 py-2">
              <span className="text-sm text-[#6b7280]">You send approx.</span>
              <span className="text-sm font-bold text-[#16a34a]">{formatSource(usd, 'USD')}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-[#9ca3af] mb-2 font-medium">Quick amounts</p>
          <div className="flex gap-2 flex-wrap">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                onClick={() => handleQuick(v)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                  ${Number(amount) === v
                    ? 'bg-[#1a56db] text-white border-[#1a56db]'
                    : 'text-[#374151] border-[#e5e7eb] hover:border-[#1a56db] hover:text-[#1a56db]'
                  }`}
              >
                {formatINR(v)}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleContinue} disabled={!canContinue}>
            Get Quote
          </Button>
        </div>
      </div>
    </div>
  )
}
