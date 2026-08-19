import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import useAfricaStore, { DEMO_SENDER_ID } from '../../store'
import { formatUSD } from '../../lib/fx'

export default function SenderInvoices() {
  const navigate = useNavigate()
  const invoices = useAfricaStore((s) => s.invoices).filter((i) => i.senderId === DEMO_SENDER_ID)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">All invoices</h1>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f9fafb]">
            <tr className="border-b border-[#e5e7eb]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Invoice</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                <td className="px-4 py-3 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-[#6b7280]">{inv.description}</td>
                <td className="px-4 py-3 font-mono text-[#111827]">{formatUSD(inv.amountUSD)}</td>
                <td className="px-4 py-3">
                  <Badge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {inv.status === 'created' && (
                    <Button size="sm" onClick={() => navigate(`/africa/sender/invoices/${inv.id}/pay`)}>
                      Pay
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
