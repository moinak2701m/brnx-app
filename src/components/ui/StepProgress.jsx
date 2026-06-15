import { Check } from 'lucide-react'

export default function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full px-4 py-4">
      {steps.map((step, i) => {
        const completed = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${completed ? 'bg-[#1a56db] text-white' : active ? 'bg-[#1a56db] text-white' : 'border-2 border-[#e5e7eb] text-[#9ca3af]'}`}
              >
                {completed ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-[#1a56db]' : completed ? 'text-[#6b7280]' : 'text-[#9ca3af]'}`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-1 mb-4 rounded transition-all ${completed ? 'bg-[#1a56db]' : 'bg-[#e5e7eb]'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
