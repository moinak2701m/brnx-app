import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import useAfricaStore from '../../store'
import { formatUSD } from '../../lib/fx'

export default function ReceiverInvoices() {
  const navigate = useNavigate()
  const invoices = useAfricaStore((s) => s.invoices)
  const senders = useAfricaStore((s) => s.senders)

  const senderName = (id) => senders.find((s) => s.id === id)?.name || id

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Invoices</h1>
        <Button size="sm" onClick={() => navigate('/africa/receiver/invoices/new')}>
          <Plus size={14} className="mr-1" /> Create invoice
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">
              <th className="p-4">Invoice</th>
              <th className="p-4">Sender</th>
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-[#f3f4f6] last:border-0">
                <td className="p-4 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                <td className="p-4 text-[#6b7280]">{senderName(inv.senderId)}</td>
                <td className="p-4 text-[#6b7280]">{inv.description}</td>
                <td className="p-4 font-mono text-[#111827]">{formatUSD(inv.amountUSD)}</td>
                <td className="p-4">
                  <Badge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
