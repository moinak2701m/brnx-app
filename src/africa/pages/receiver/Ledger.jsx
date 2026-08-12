import { Wallet } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import useAfricaStore from '../../store'
import { formatUSD } from '../../lib/fx'

export default function Ledger() {
  const invoices = useAfricaStore((s) => s.invoices)
  const senders = useAfricaStore((s) => s.senders)
  const getReceiverWalletBalance = useAfricaStore((s) => s.getReceiverWalletBalance)
  const withdrawInvoiceToBank = useAfricaStore((s) => s.withdrawInvoiceToBank)
  const withdrawAllToBank = useAfricaStore((s) => s.withdrawAllToBank)
  const toast = useToast()

  const senderName = (id) => senders.find((s) => s.id === id)?.name || id
  const walletBalance = getReceiverWalletBalance()
  const inWallet = invoices.filter((i) => i.status === 'received_in_wallet')

  const withdrawAll = () => {
    withdrawAllToBank()
    toast?.(`${formatUSD(walletBalance)} withdrawn to bank`)
  }

  const withdrawOne = (inv) => {
    withdrawInvoiceToBank(inv.id)
    toast?.(`${inv.invoiceNumber} withdrawn to bank`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Ledger</h1>

      <div className="bg-gradient-to-br from-[#0061D3] to-[#00326D] rounded-2xl p-6 text-white mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Wallet size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Wallet balance</span>
          </div>
          <p className="text-3xl font-bold">{formatUSD(walletBalance)}</p>
          <p className="text-xs opacity-70 mt-1">{inWallet.length} invoice{inWallet.length === 1 ? '' : 's'} settled to wallet</p>
        </div>
        <Button variant="secondary" disabled={walletBalance <= 0} onClick={withdrawAll}>
          Withdraw all to bank
        </Button>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">
              <th className="p-4">Invoice</th>
              <th className="p-4">Sender</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-[#f3f4f6] last:border-0">
                <td className="p-4 font-medium text-[#111827]">{inv.invoiceNumber}</td>
                <td className="p-4 text-[#6b7280]">{senderName(inv.senderId)}</td>
                <td className="p-4 font-mono text-[#111827]">{formatUSD(inv.amountUSD)}</td>
                <td className="p-4">
                  <Badge status={inv.status} />
                </td>
                <td className="p-4 text-right">
                  {inv.status === 'received_in_wallet' && (
                    <Button size="sm" variant="ghost" onClick={() => withdrawOne(inv)}>
                      Withdraw
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
