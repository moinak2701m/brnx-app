import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import SlideOver from '../../components/SlideOver'
import TransactionDetailPanel from '../../components/TransactionDetailPanel'
import useAfricaStore from '../../store'
import { formatUSD } from '../../lib/fx'

const formatWhen = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Ledger() {
  const invoices = useAfricaStore((s) => s.invoices)
  const senders = useAfricaStore((s) => s.senders)
  const [selectedId, setSelectedId] = useState(null)

  const senderName = (id) => senders.find((s) => s.id === id)?.name || id

  // The ledger is the money-movement trail - only invoices sitting
  // somewhere on their way to (or already in) the bank, not the whole
  // invoice book. Everything off-ramps automatically; there's nothing
  // to action here.
  const settlements = invoices
    .filter((i) => i.paymentMethod)
    .sort((a, b) => new Date(b.timestamps.payment_initiated) - new Date(a.timestamps.payment_initiated))

  const selected = settlements.find((i) => i.id === selectedId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Ledger</h1>
      <p className="text-[#6b7280] mb-6">Every payment settles straight to your bank account automatically.</p>

      {settlements.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-8 text-center text-sm text-[#9ca3af]">
          No settlements yet.
        </div>
      ) : (
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f9fafb]">
              <tr className="border-b border-[#e5e7eb]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Sender</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Settled to bank</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {settlements.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className="border-t border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{senderName(inv.senderId)}</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">{formatUSD(inv.amountUSD)}</td>
                  <td className="px-4 py-3">
                    <Badge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">{formatWhen(inv.timestamps.received_in_bank)}</td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={16} className="text-[#9ca3af]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SlideOver
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title="Transaction detail"
        subtitle={selected?.invoiceNumber}
      >
        <TransactionDetailPanel invoice={selected} senderName={selected ? senderName(selected.senderId) : ''} />
      </SlideOver>
    </div>
  )
}
