import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Plus, Landmark, User, Users, ArrowRight, Send as SendIcon, ArrowUpRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import TransactionRow from '../components/domain/TransactionRow'
import NotificationsPanel from '../components/domain/NotificationsPanel'
import { useStore } from '../store'
import { getRate, formatINR, formatSource } from '../lib/fx'
import useIsDesktop from '../hooks/useIsDesktop'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark, bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]' },
  self:   { Icon: User,     bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]' },
  family: { Icon: Users,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]' },
}

// ─── Mobile ──────────────────────────────────────────────────────────────────

function MobileHome({ user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend, unreadCount, onBellClick, showNotifications, onNotificationsClose, onMarkRead, notificationsRead }) {
  return (
    <div className="flex flex-col gap-0 pb-6 bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-xs text-[#9ca3af]">Good morning</p>
          <h1 className="text-[20px] font-bold text-[#111827]">{user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="relative">
          <button
            onClick={onBellClick}
            className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center relative"
          >
            <Bell size={18} className="text-[#6b7280]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dc2626]" />
            )}
          </button>
          {showNotifications && (
            <NotificationsPanel
              onClose={onNotificationsClose}
              isRead={notificationsRead}
              onMarkRead={onMarkRead}
            />
          )}
        </div>
      </div>

      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
        >
          <div>
            <p className="text-white/70 text-xs font-medium mb-0.5">Sending from</p>
            <p className="text-white font-bold text-[16px]">{paymentSource?.bankName}</p>
            <p className="text-white/60 text-xs">{paymentSource?.accountMasked} · {paymentSource?.currency ?? 'USD'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-2xl">🇺🇸</span>
            <button onClick={() => navigate('/profile/payment-source')} className="text-white/70 text-[10px] font-medium flex items-center gap-0.5">
              Change <ArrowRight size={10} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-[15px] font-semibold text-[#111827]">Send to</h2>
          <button onClick={() => navigate('/send')} className="text-xs text-[#1a56db] font-medium flex items-center gap-0.5">
            All <ArrowRight size={11} />
          </button>
        </div>
        <div className="flex gap-4 px-5 overflow-x-auto no-scrollbar pb-1">
          {beneficiaries.slice(0, 5).map((b, i) => {
            const cfg = PURPOSE_CONFIG[b.purpose] ?? PURPOSE_CONFIG.family
            return (
              <motion.button key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleQuickSend(b)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cfg.bg}`}><cfg.Icon size={20} className={cfg.color} /></div>
                <p className="text-[10px] text-[#6b7280] max-w-[52px] truncate text-center leading-tight">{b.name.split(' ')[0]}</p>
              </motion.button>
            )
          })}
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: beneficiaries.length * 0.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/send/add-beneficiary')} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center"><Plus size={20} className="text-[#6b7280]" /></div>
            <p className="text-[10px] text-[#9ca3af]">Add</p>
          </motion.button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="px-5">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[15px] font-semibold text-[#111827]">Recent Transfers</h2>
            <button onClick={() => navigate('/transactions')} className="text-xs text-[#1a56db] font-medium flex items-center gap-0.5">All <ArrowRight size={11} /></button>
          </div>
          {transactions.slice(0, 3).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Desktop ─────────────────────────────────────────────────────────────────

function DesktopHome({ user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend, unreadCount, onBellClick, showNotifications, onNotificationsClose, onMarkRead, notificationsRead }) {
  const rate = useMemo(() => getRate('USD'), [])
  const bankRate = +(rate * 0.956).toFixed(2)
  const savingPerDollar = +(rate - bankRate).toFixed(2)

  const [amountINR, setAmountINR] = useState('')
  const [selectedId, setSelectedId]   = useState(beneficiaries[0]?.id ?? '')
  const usd = amountINR && Number(amountINR) > 0 ? +(Number(amountINR) / rate).toFixed(2) : null

  const handleSend = () => {
    if (amountINR && Number(amountINR) >= 100) {
      const ben = beneficiaries.find((b) => b.id === selectedId) || beneficiaries[0]
      if (ben) {
        sessionStorage.setItem('send_beneficiary', JSON.stringify(ben))
        sessionStorage.setItem('send_amount', amountINR)
        navigate('/send/quote')
        return
      }
    }
    navigate('/send')
  }

  return (
    <div className="flex flex-col min-h-full bg-white px-10 py-10 gap-10">

      {/* ── Top row: greeting + bell ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-[#9ca3af] font-medium mb-0.5">Good morning</p>
          <h1 className="text-[28px] font-bold text-[#0f172a] leading-tight">{user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="relative">
          <button
            onClick={onBellClick}
            className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center relative hover:bg-[#f1f5f9] transition-colors"
          >
            <Bell size={17} className="text-[#64748b]" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
          {showNotifications && (
            <NotificationsPanel
              onClose={onNotificationsClose}
              isRead={notificationsRead}
              onMarkRead={onMarkRead}
            />
          )}
        </div>
      </div>

      {/* ── Rate + send widget ── */}
      <div>
        {/* Live label */}
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Live rate</p>
        </div>

        {/* The big number */}
        <div className="flex items-end gap-5 mb-2">
          <p className="text-[72px] font-black leading-none text-[#0f172a] tracking-tight">
            <span className="text-[#0061D3]">₹</span>{rate.toFixed(2)}
          </p>
          <div className="pb-3 flex flex-col gap-0.5">
            <span className="text-emerald-500 text-sm font-semibold">↑ Best market rate</span>
            <p className="text-[#94a3b8] text-xs">per US Dollar · Near-instant delivery</p>
          </div>
        </div>

        {/* Savings vs banks */}
        <p className="text-[13px] text-[#64748b] mb-8">
          Banks offer ₹{bankRate} — BRNX saves you{' '}
          <span className="text-emerald-600 font-semibold">₹{savingPerDollar} per dollar</span>
        </p>

        {/* Send widget */}
        <div className="flex items-stretch gap-3">
          {/* Amount */}
          <div className="flex-1 border-2 border-[#e2e8f0] rounded-2xl px-5 py-4 focus-within:border-[#0061D3] transition-colors bg-[#fafbff]">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Amount (INR)</p>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-semibold text-[#cbd5e1]">₹</span>
              <input
                type="number"
                value={amountINR}
                onChange={(e) => setAmountINR(e.target.value)}
                placeholder="20,000"
                className="flex-1 text-[26px] font-bold text-[#0f172a] outline-none bg-transparent w-0 placeholder:text-[#e2e8f0]"
              />
            </div>
            {usd !== null && (
              <p className="text-[12px] text-emerald-600 font-medium mt-2">
                ≈ ${usd} will be debited from your account
              </p>
            )}
          </div>

          {/* Beneficiary */}
          {beneficiaries.length > 0 && (
            <div className="border-2 border-[#e2e8f0] rounded-2xl px-5 py-4 focus-within:border-[#0061D3] transition-colors bg-[#fafbff] min-w-[180px]">
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Send to</p>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full text-[16px] font-bold text-[#0f172a] outline-none bg-transparent cursor-pointer"
              >
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSend}
            className="px-8 rounded-2xl text-white font-bold text-[15px] flex items-center gap-2.5 hover:opacity-90 active:scale-[0.98] transition-all flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
          >
            <SendIcon size={17} />
            Send Now
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[#f1f5f9]" />

      {/* ── Two-column: activity + recipients ── */}
      <div className="grid grid-cols-[1fr_280px] gap-12">

        {/* Recent transfers */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-[#0f172a]">Recent transfers</h2>
            <button onClick={() => navigate('/transactions')} className="text-[13px] text-[#0061D3] font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[15px] font-semibold text-[#0f172a] mb-1">No transfers yet</p>
              <p className="text-sm text-[#94a3b8]">Send money and it'll show up here</p>
            </div>
          ) : (
            <div>
              {transactions.map((tx, i) => {
                const cfg = PURPOSE_CONFIG[tx.purpose] ?? { Icon: ArrowUpRight, bg: 'bg-[#f0fdf4]', color: 'text-[#16a34a]' }
                return (
                  <motion.button
                    key={tx.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                    className="w-full flex items-center gap-4 py-3.5 border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc] rounded-xl px-3 -mx-3 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <cfg.Icon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[14px] font-semibold text-[#0f172a] truncate">{tx.beneficiaryName || 'Transfer'}</p>
                      <p className="text-xs text-[#94a3b8]">{tx.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] font-bold text-[#0f172a]">{formatINR(tx.amountINR)}</p>
                      <div className="flex justify-end mt-0.5">
                        <Badge status={tx.status} />
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {/* Recipients + payment source */}
        <div className="flex flex-col gap-8">

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[#0f172a]">Saved recipients</h2>
              <button onClick={() => navigate('/send')} className="text-[13px] text-[#0061D3] font-medium hover:underline">All</button>
            </div>
            <div className="flex flex-col">
              {beneficiaries.slice(0, 4).map((b, i) => {
                const cfg = PURPOSE_CONFIG[b.purpose] ?? PURPOSE_CONFIG.family
                return (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleQuickSend(b)}
                    className="flex items-center gap-3 py-3 rounded-xl hover:bg-[#f8fafc] transition-colors group -mx-2 px-2"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <cfg.Icon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[14px] font-semibold text-[#0f172a] truncate">{b.name}</p>
                      <p className="text-xs text-[#94a3b8] capitalize">{b.purpose}</p>
                    </div>
                    <ArrowRight size={14} className="text-[#cbd5e1] group-hover:text-[#0061D3] transition-colors flex-shrink-0" />
                  </motion.button>
                )
              })}
              <button
                onClick={() => navigate('/send/add-beneficiary')}
                className="flex items-center gap-3 py-3 rounded-xl text-[#94a3b8] hover:bg-[#f8fafc] transition-colors -mx-2 px-2"
              >
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#e2e8f0] flex items-center justify-center">
                  <Plus size={15} className="text-[#cbd5e1]" />
                </div>
                <p className="text-[14px] font-medium text-[#94a3b8]">Add recipient</p>
              </button>
            </div>
          </div>

          {/* Payment source */}
          <div>
            <h2 className="text-[13px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">Funding source</h2>
            <button
              onClick={() => navigate('/profile/payment-source')}
              className="w-full rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-bold text-[15px]">{paymentSource?.bankName}</p>
                  <p className="text-white/50 text-[12px] mt-0.5">{paymentSource?.accountMasked} · USD</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <ArrowRight size={13} className="text-white/40" />
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const user         = useStore((s) => s.user)
  const beneficiaries = useStore((s) => s.beneficiaries)
  const transactions  = useStore((s) => s.transactions)
  const paymentSource = useStore((s) => s.paymentSource)
  const notificationsUnread = useStore((s) => s.notificationsUnread)
  const markNotificationsRead = useStore((s) => s.markNotificationsRead)

  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsRead, setNotificationsRead] = useState(false)

  const handleBellClick = () => {
    setShowNotifications((v) => !v)
    if (!notificationsRead) {
      setNotificationsRead(true)
      markNotificationsRead()
    }
  }

  const handleMarkRead = () => {
    setNotificationsRead(true)
    markNotificationsRead()
  }

  const handleQuickSend = (b) => {
    sessionStorage.setItem('send_beneficiary', JSON.stringify(b))
    navigate('/send/amount')
  }

  const notifProps = {
    unreadCount: notificationsUnread,
    onBellClick: handleBellClick,
    showNotifications,
    onNotificationsClose: () => setShowNotifications(false),
    onMarkRead: handleMarkRead,
    notificationsRead,
  }

  const props = { user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend, ...notifProps }
  return isDesktop ? <DesktopHome {...props} /> : <MobileHome {...props} />
}
