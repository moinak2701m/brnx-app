import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../../components/layout/ScreenHeader'
import StepProgress from '../../components/ui/StepProgress'
import QuoteCard from '../../components/domain/QuoteCard'
import PillSelector from '../../components/ui/PillSelector'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { getQuote, CURRENCY_FLAGS } from '../../lib/fx'

const STEPS = ['Amount', 'Quote', 'Review', 'Done']
const CURRENCIES = Object.keys(CURRENCY_FLAGS).map((c) => ({ value: c, label: `${CURRENCY_FLAGS[c]} ${c}` }))

export default function PayQuote() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const setActivePayment = useStore((s) => s.setActivePayment)
  const loans = useStore((s) => s.loans)
  const loan = loans.find((l) => l.id === loanId)
  const amountINR = Number(sessionStorage.getItem('pay_amount') || 0)

  const [currency, setCurrency] = useState('USD')
  const [quote, setQuote] = useState(() => getQuote(amountINR, 'USD'))
  const [expired, setExpired] = useState(false)

  const refresh = useCallback(() => {
    setExpired(false)
    setQuote(getQuote(amountINR, currency))
  }, [amountINR, currency])

  const handleCurrencyChange = (c) => {
    setCurrency(c)
    setExpired(false)
    setQuote(getQuote(amountINR, c))
  }

  const handleContinue = () => {
    setActivePayment({ loanId, quote, type: 'repayment' })
    navigate(`/loans/${loanId}/pay/review`)
  }

  if (!loan) return null

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Exchange Rate" subtitle="Rate locked for 2 minutes" />
      <StepProgress steps={STEPS} currentStep={1} />
      <div className="px-5 pb-6 flex flex-col gap-4 mt-2">
        <PillSelector options={CURRENCIES} value={currency} onChange={handleCurrencyChange} label="Pay from" />
        {expired ? (
          <div className="bg-[#fef2f2] rounded-2xl p-5 text-center flex flex-col items-center gap-3">
            <p className="text-[#dc2626] font-semibold">Rate has expired</p>
            <p className="text-sm text-[#9ca3af]">Exchange rates update every 2 minutes</p>
            <Button variant="primary" onClick={refresh}>Refresh Rate</Button>
          </div>
        ) : (
          <QuoteCard quote={quote} onExpire={() => setExpired(true)} onRefresh={refresh} />
        )}
        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleContinue} disabled={expired}>
            Lock Rate & Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
