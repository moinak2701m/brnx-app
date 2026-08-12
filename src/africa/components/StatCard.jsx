export default function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center">
            <Icon size={16} className="text-[#1a56db]" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#111827]">{value}</p>
      {hint && <p className="text-xs text-[#9ca3af] mt-1">{hint}</p>}
    </div>
  )
}
