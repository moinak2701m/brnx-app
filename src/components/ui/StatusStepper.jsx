import { CheckCircle2, ArrowRightLeft, Building2, Banknote } from 'lucide-react'

const STEP_ICONS = [CheckCircle2, ArrowRightLeft, Building2, Banknote]

const STEP_SUBS = [
  'Your payment has been authorised',
  'Funds received by our partner',
  'Converting and routing to beneficiary bank',
  'INR deposited to recipient account',
]

export default function StatusStepper({ steps, completedUpTo = -1 }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isComplete = i <= completedUpTo
        const isActive   = i === completedUpTo + 1
        const Icon = STEP_ICONS[i] ?? CheckCircle2

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
                ${isComplete ? 'bg-[#dcfce7]' : isActive ? 'bg-[#eff6ff]' : 'bg-[#f3f4f6]'}`}>
                <Icon size={15} className={isComplete ? 'text-[#16a34a]' : isActive ? 'text-[#1a56db]' : 'text-[#d1d5db]'} />
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-6 overflow-hidden bg-[#e5e7eb]">
                  <div className={`w-full transition-all duration-300 ${isComplete ? 'h-full bg-[#bbf7d0]' : 'h-0'}`} />
                </div>
              )}
            </div>
            <div className="pb-4 pt-0.5">
              <p className={`text-sm font-semibold transition-colors duration-300
                ${isComplete ? 'text-[#111827]' : isActive ? 'text-[#1a56db]' : 'text-[#9ca3af]'}`}>
                {step}
                {isComplete && <span className="ml-2 text-xs font-normal text-[#16a34a]">✓</span>}
                {isActive  && <span className="ml-2 text-xs font-normal text-[#f59e0b]">In progress</span>}
              </p>
              {STEP_SUBS[i] && (
                <p className="text-xs text-[#9ca3af] mt-0.5">{STEP_SUBS[i]}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
