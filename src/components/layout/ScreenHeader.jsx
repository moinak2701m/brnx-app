import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'

export default function ScreenHeader({ title, subtitle, onBack, closeIcon = false, right }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div className="flex items-center gap-3 px-5 pt-4 pb-3 bg-white">
      <button
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors flex-shrink-0"
      >
        {closeIcon ? <X size={20} className="text-[#111827]" /> : <ArrowLeft size={20} className="text-[#111827]" />}
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-[17px] font-semibold text-[#111827] truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#6b7280] truncate">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
