import { Fragment } from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'payment_initiated', label: 'Payment Initiated' },
  { key: 'received_in_wallet', label: 'Received in Wallet' },
  { key: 'received_in_bank', label: 'Received in Bank' },
]

const formatWhen = (iso) => {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PipelineSteps({ status, timestamps = {} }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="flex w-full items-start">
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const upcoming = i > currentIndex

        return (
          <Fragment key={step.key}>
            {i > 0 && (
              <div
                key={`line-${step.key}`}
                className={`h-0.5 flex-1 mt-4 ${i - 1 < currentIndex ? 'bg-[#16a34a]' : 'bg-[#e5e7eb]'}`}
              />
            )}
            <div className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: 96 }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${done ? 'bg-[#16a34a] text-white' : active ? 'bg-[#1a56db] text-white' : 'bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb]'}`}
              >
                {done ? <Check size={15} /> : i + 1}
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold leading-tight ${upcoming ? 'text-[#9ca3af]' : 'text-[#111827]'}`}>{step.label}</p>
                {timestamps[step.key] && (
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">{formatWhen(timestamps[step.key])}</p>
                )}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
