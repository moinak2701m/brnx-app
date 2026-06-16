import { useEffect, useRef } from 'react'
import { CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'transfer',
    title: 'Transfer delivered',
    body: '₹32,500 credited to HSBC · loan repayment',
    time: 'Today, 2:14 PM',
    unread: true,
  },
  {
    id: 'n2',
    type: 'rate',
    title: 'Great rate today',
    body: 'USD/INR hit ₹95+ — better than yesterday. Good time to send.',
    time: 'Today, 9:00 AM',
    unread: true,
  },
  {
    id: 'n3',
    type: 'transfer',
    title: 'Transfer delivered',
    body: '₹10,000 credited to Ramesh Mehta',
    time: '3 Jun',
    unread: false,
  },
  {
    id: 'n4',
    type: 'kyc',
    title: 'KYC approved',
    body: 'Identity verified. You can now send up to $10,000/month.',
    time: '1 May',
    unread: false,
  },
]

const TYPE_CONFIG = {
  transfer: { Icon: CheckCircle2, bg: 'bg-[#dcfce7]', color: 'text-[#16a34a]' },
  rate:     { Icon: TrendingUp,   bg: 'bg-[#fef9c3]', color: 'text-[#ca8a04]' },
  kyc:      { Icon: ShieldCheck,  bg: 'bg-[#eff6ff]', color: 'text-[#0061D3]' },
}

export default function NotificationsPanel({ onClose, isRead, onMarkRead, items = NOTIFICATIONS }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const list = isRead ? items.map((n) => ({ ...n, unread: false })) : items

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
        <h3 className="text-[15px] font-bold text-[#0f172a]">Notifications</h3>
        {!isRead && (
          <button
            onClick={onMarkRead}
            className="text-xs text-[#0061D3] font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
        {isRead && (
          <span className="text-xs text-[#9ca3af]">All caught up</span>
        )}
      </div>
      <div className="flex flex-col max-h-[400px] overflow-y-auto">
        {list.map((n) => {
          const { Icon, bg, color } = TYPE_CONFIG[n.type]
          return (
            <div
              key={n.id}
              className={`flex gap-3 px-5 py-4 border-b border-[#f9fafb] last:border-0 transition-colors hover:bg-[#fafafa] ${n.unread ? 'bg-[#f8fbff]' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={15} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] font-semibold leading-snug ${n.unread ? 'text-[#0f172a]' : 'text-[#374151]'}`}>
                    {n.title}
                  </p>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#0061D3] flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-[12px] text-[#6b7280] mt-0.5 leading-snug">{n.body}</p>
                <p className="text-[11px] text-[#9ca3af] mt-1.5">{n.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
