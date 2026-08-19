import PipelineSteps from './PipelineSteps'
import Badge from '../../components/ui/Badge'
import { formatUSD, formatNGN } from '../lib/fx'

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const PAYMENT_METHOD_LABEL = {
  bank_transfer: 'Bank transfer',
  wallet: 'Treasury wallet',
}

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-[#f3f4f6] last:border-0">
    <span className="text-sm text-[#6b7280] w-36 flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-[#111827] text-right break-all">{value ?? '—'}</span>
  </div>
)

const SectionCard = ({ title, children }) => (
  <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
    <h3 className="text-sm font-semibold text-[#374151] mb-3 pb-2 border-b border-[#f3f4f6]">{title}</h3>
    {children}
  </div>
)

export default function TransactionDetailPanel({ invoice, counterpartyName, viewerRole = 'receiver' }) {
  if (!invoice) return null
  const isSender = viewerRole === 'sender'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider">{invoice.invoiceNumber}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">{invoice.description}</p>
        </div>
        <Badge status={invoice.status} size="lg" />
      </div>

      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider">
            {invoice.status === 'received_in_bank' ? (isSender ? 'Amount paid' : 'Amount received') : 'Amount due'}
          </p>
          <p className="text-3xl font-bold text-[#16a34a] mt-0.5">{formatUSD(invoice.amountUSD)}</p>
        </div>
        {invoice.quote && (
          <div className="text-right">
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider">{isSender ? 'You pay' : 'Sender pays'}</p>
            <p className="text-xl font-semibold text-[#374151] mt-0.5">{formatNGN(invoice.quote.amountNGN)}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#374151] mb-4">Settlement pipeline</h3>
        <div className="overflow-x-auto">
          <PipelineSteps status={invoice.status} timestamps={invoice.timestamps} />
        </div>
      </div>

      <SectionCard title="Transaction summary">
        <DetailRow label="Invoice ID" value={invoice.invoiceNumber} />
        <DetailRow label={isSender ? 'Receiver' : 'Sender'} value={counterpartyName} />
        <DetailRow label="Payment method" value={invoice.paymentMethod ? PAYMENT_METHOD_LABEL[invoice.paymentMethod] : 'Not yet chosen'} />
        <DetailRow label="Created" value={formatDate(invoice.timestamps?.created)} />
      </SectionCard>

      <SectionCard title="Exchange rate">
        {invoice.quote ? (
          <>
            <DetailRow label={isSender ? 'You sent' : 'Sender sent'} value={formatNGN(invoice.quote.amountNGN)} />
            <DetailRow label={isSender ? 'Receiver gets' : 'You receive'} value={formatUSD(invoice.amountUSD)} />
            <DetailRow label="Rate" value={`1 USD = ${invoice.quote.rate} NGN`} />
          </>
        ) : (
          <p className="text-sm text-[#9ca3af]">No rate information yet — a quote hasn't been generated.</p>
        )}
      </SectionCard>
    </div>
  )
}
