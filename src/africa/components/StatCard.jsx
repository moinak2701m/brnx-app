export default function StatCard({ title, value, hint, valueClassName = '' }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-[#9ca3af] tracking-widest uppercase">{title}</span>
      <span className={`text-2xl font-bold ${valueClassName || 'text-[#111827]'}`}>{value}</span>
      {hint && <span className="text-xs text-[#9ca3af]">{hint}</span>}
    </div>
  )
}
