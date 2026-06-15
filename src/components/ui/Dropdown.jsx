import { ChevronDown } from 'lucide-react'

export default function Dropdown({ label, error, value, onChange, options, placeholder, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-[#111827]">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-[15px] appearance-none bg-white
            focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent
            ${!value ? 'text-[#9ca3af]' : 'text-[#111827]'}
            ${error ? 'border-[#dc2626]' : 'border-[#e5e7eb]'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}
