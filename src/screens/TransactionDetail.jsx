import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ScreenHeader from '../components/layout/ScreenHeader'
import Badge from '../components/ui/Badge'
import StatusStepper from '../components/ui/StatusStepper'
import { useStore } from '../store'
import { formatINR, formatSource } from '../lib/fx'

const JOURNEY_STEPS = [
  'Transfer initiated',
  'Payment verified',
  'Arriving in India',
  'Credited to account',
]

const PURPOSE_LABELS = {
  loan:   'Repayment Transfer',
  self:   'Self Transfer',
  family: 'Family Transfer',
}

export default function TransactionDetail() {
  const { txId } = useParams()
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const tx = transactions.find((t) => t.id === txId)

  useEffect(() => {
    if (!tx) navigate('/transactions', { replace: true })
  }, [tx, navigate])

  if (!tx) return null

  const stepsDone = tx.status === 'credited' ? 3 : tx.status === 'processing' ? 2 : 1
  const typeLabel = PURPOSE_LABELS[tx.purpose] ?? 'Transfer'

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Transaction Details" />
      <div className="px-5 pb-6">
        <div className="flex flex-col items-center py-6 gap-2">
          <p className="text-4xl font-bold text-[#111827]">{formatINR(tx.amountINR)}</p>
          <Badge status={tx.status} size="lg" />
          <p className="text-sm text-[#9ca3af] mt-1">{tx.date}</p>
        </div>
        <div className="bg-[#f9fafb] rounded-2xl p-4 mb-5">
          <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-3">Details</p>
          {[
            ['Type', typeLabel],
            ['Recipient', tx.beneficiaryName || '—'],
            ['Amount sent', formatSource(tx.amountSource || 0, tx.currency || 'USD')],
            ['INR received', formatINR(tx.amountINR)],
            ['Date', tx.date],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-[#f3f4f6] last:border-0">
              <span className="text-sm text-[#9ca3af]">{k}</span>
              <span className="text-sm font-medium text-[#111827]">{v}</span>
            </div>
          ))}
        </div>
        <div className="px-1">
          <p className="text-xs text-[#9ca3af] font-medium uppercase tracking-wide mb-4">Payment Journey</p>
          <StatusStepper steps={JOURNEY_STEPS} completedUpTo={stepsDone} />
        </div>
      </div>
    </div>
  )
}
