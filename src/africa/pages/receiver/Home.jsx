import { useNavigate } from 'react-router-dom'
import { Wallet, FileText, Landmark } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import StatCard from '../../components/StatCard'
import useAfricaStore from '../../store'
import { formatUSD } from '../../lib/fx'

export default function ReceiverHome() {
  const navigate = useNavigate()
  const invoices = useAfricaStore((s) => s.invoices)
  const getReceiverWalletBalance = useAfricaStore((s) => s.getReceiverWalletBalance)

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amountUSD, 0)
  const settledTotal = invoices
    .filter((i) => i.status === 'received_in_bank')
    .reduce((sum, i) => sum + i.amountUSD, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Atlas Supply Co</h1>
      <p className="text-[#6b7280] mb-6">Invoice and settlement overview</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Total invoiced" value={formatUSD(totalInvoiced)} icon={FileText} />
        <StatCard title="Wallet balance" value={formatUSD(getReceiverWalletBalance())} icon={Wallet} hint="Ready to withdraw" />
        <StatCard title="Received in bank" value={formatUSD(settledTotal)} icon={Landmark} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#111827]">Recent invoices</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/africa/receiver/invoices')}>
          View all
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl divide-y divide-[#f3f4f6]">
        {invoices.slice(0, 6).map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-4">
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
