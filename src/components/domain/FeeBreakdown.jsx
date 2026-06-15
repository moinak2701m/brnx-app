import { formatINR, formatRate, formatSource } from '../../lib/fx'

export default function FeeBreakdown({ quote }) {
  const rows = [
    { label: 'Exchange rate', value: `1 ${quote.currency} = ${formatRate(quote.rate)}` },
    { label: 'You send', value: formatSource(quote.total, quote.currency), bold: true },
    { label: 'INR credited', value: formatINR(quote.amountINR), bold: true, highlight: true },
  ]
  return (
    <div className="bg-[#f9fafb] rounded-2xl p-4 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className={`flex justify-between text-sm ${i === 1 ? 'border-t border-[#e5e7eb] pt-2 mt-2' : ''}`}>
          <span className="text-[#6b7280]">{row.label}</span>
          <span className={`font-medium ${row.highlight ? 'text-[#16a34a]' : row.bold ? 'text-[#111827]' : 'text-[#374151]'}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
