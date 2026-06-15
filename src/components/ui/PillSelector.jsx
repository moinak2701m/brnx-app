export default function PillSelector({ options, value, onChange, label }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#111827]">{label}</label>}
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
              ${value === o.value
                ? 'bg-[#1a56db] text-white border-[#1a56db]'
                : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56db]'
              }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
