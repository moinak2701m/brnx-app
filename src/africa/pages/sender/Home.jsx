import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, FileText, Clock3 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import StatCard from '../../components/StatCard'
import useAfricaStore, { DEMO_SENDER_ID } from '../../store'
import { formatUSD } from '../../lib/fx'

export default function SenderHome() {
  const navigate = useNavigate()
  const senderKybStatus = useAfricaStore((s) => s.senderKybStatus)
  const invoices = useAfricaStore((s) => s.invoices)
  const walletBalance = useAfricaStore((s) => s.senderWallet.balanceUSD)

  useEffect(() => {
    if (senderKybStatus !== 'approved') navigate('/africa/sender/kyb', { replace: true })
  }, [senderKybStatus, navigate])

  const mine = invoices.filter((i) => i.senderId === DEMO_SENDER_ID)
  const pending = mine.filter((i) => i.status === 'created')
  const paidTotal = mine
    .filter((i) => i.status === 'received_in_wallet' || i.status === 'received_in_bank')
    .reduce((sum, i) => sum + i.amountUSD, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-1">Lagos Foods Ltd</h1>
      <p className="text-[#6b7280] mb-6">Pending invoices and treasury overview</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Treasury wallet" value={formatUSD(walletBalance)} icon={Wallet} hint="USDT · 1:1 USD" />
        <StatCard title="Pending invoices" value={pending.length} icon={Clock3} />
        <StatCard title="Total paid" value={formatUSD(paidTotal)} icon={FileText} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#111827]">Pending invoices</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/africa/sender/invoices')}>
          View all
        </Button>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 text-center text-sm text-[#9ca3af]">
          No pending invoices right now.
        </div>
      ) : (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl divide-y divide-[#f3f4f6]">
          {pending.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{inv.invoiceNumber} · {inv.description}</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">{formatUSD(inv.amountUSD)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status="pending" />
                <Button size="sm" onClick={() => navigate(`/africa/sender/invoices/${inv.id}/pay`)}>
                  Pay
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
