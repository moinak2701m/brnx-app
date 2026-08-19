import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../components/StatCard'
import useAfricaStore from '../../store'
import { formatUSD } from '../../lib/fx'

export default function ReceiverHome() {
  const navigate = useNavigate()
  const invoices = useAfricaStore((s) => s.invoices)

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amountUSD, 0)
  const inTransitTotal = invoices
    .filter((i) => i.status === 'payment_initiated' || i.status === 'received_in_wallet')
    .reduce((sum, i) => sum + i.amountUSD, 0)
  const settledTotal = invoices
    .filter((i) => i.status === 'received_in_bank')
    .reduce((sum, i) => sum + i.amountUSD, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Atlas Supply Co</h1>
      <p className="text-[#6b7280] mb-6">Invoice and settlement overview</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Total invoiced" value={formatUSD(totalInvoiced)} />
        <StatCard title="In transit" value={formatUSD(inTransitTotal)} hint="Settling to bank automatically" />
        <StatCard title="Received in bank" value={formatUSD(settledTotal)} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#111827]">Recent invoices</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/africa/receiver/invoices')}>
          View all
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] divide-y divide-[#f3f4f6]">
        {invoices.slice(0, 6).map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-[#f9fafb] transition-colors">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{inv.invoiceNumber} · {inv.description}</p>
              <p className="text-xs text-[#9ca3af] mt-0.5">{formatUSD(inv.amountUSD)}</p>
            </div>
            <Badge status={inv.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
