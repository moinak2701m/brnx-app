export default function Input({
  label,
  hint,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  readOnly = false,
  suffix,
  className = '',
  inputClassName = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#111827]">{label}</label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full border rounded-xl px-4 py-3 text-[15px] text-[#111827] placeholder-[#9ca3af]
            focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent
            ${readOnly ? 'bg-[#f9fafb] cursor-default' : 'bg-white'}
            ${error ? 'border-[#dc2626]' : 'border-[#e5e7eb]'}
            ${inputClassName}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
            {suffix}
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}
