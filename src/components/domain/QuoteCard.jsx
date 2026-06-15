import CountdownTimer from '../ui/CountdownTimer'
import { CURRENCY_FLAGS, formatINR, formatRate, formatSource } from '../../lib/fx'
import { RefreshCw } from 'lucide-react'

export default function QuoteCard({ quote, onExpire, onRefresh }) {
  return (
    <div className="bg-gradient-to-br from-[#0061D3] to-[#00326D] rounded-2xl p-4 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-white/70 mb-0.5">Exchange rate</p>
          <p className="text-xl font-bold">
            {CURRENCY_FLAGS[quote.currency]} 1 {quote.currency} = {formatRate(quote.rate)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
          <span className="text-xs font-medium">Expires in</span>
          <CountdownTimer expiresAt={quote.expiresAt} onExpire={onExpire} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">You send</span>
          <span className="font-semibold">{formatSource(quote.total, quote.currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Recipient gets</span>
          <span className="font-bold text-base text-green-300">{formatINR(quote.amountINR)}</span>
        </div>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 mt-3 text-xs text-white/70 hover:text-white transition-colors"
        >
          <RefreshCw size={12} />
          Refresh rate
        </button>
      )}
    </div>
  )
}
