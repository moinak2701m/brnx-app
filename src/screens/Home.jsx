import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Plus, Landmark, User, Users, ArrowRight, Send as SendIcon, ChevronRight } from 'lucide-react'
import TransactionRow from '../components/domain/TransactionRow'
import { useStore } from '../store'
import { getRate, formatINR, formatSource } from '../lib/fx'
import useIsDesktop from '../hooks/useIsDesktop'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark, bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]' },
  self:   { Icon: User,     bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]' },
  family: { Icon: Users,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]' },
}

// ─── Mobile ────────────────────────────────────────────────────────────────

function MobileHome({ user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend }) {
  return (
    <div className="flex flex-col gap-0 pb-6 bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-xs text-[#9ca3af]">Good morning</p>
          <h1 className="text-[20px] font-bold text-[#111827]">{user?.name?.split(' ')[0]}</h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center relative">
          <Bell size={18} className="text-[#6b7280]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dc2626]" />
        </button>
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
            <button
              onClick={() => navigate('/profile/payment-source')}
              className="text-white/70 text-[10px] font-medium flex items-center gap-0.5"
            >
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
              <motion.button
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSend(b)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cfg.bg}`}>
                  <cfg.Icon size={20} className={cfg.color} />
                </div>
                <p className="text-[10px] text-[#6b7280] max-w-[52px] truncate text-center leading-tight">
                  {b.name.split(' ')[0]}
                </p>
              </motion.button>
            )
          })}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: beneficiaries.length * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/send/add-beneficiary')}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
              <Plus size={20} className="text-[#6b7280]" />
            </div>
            <p className="text-[10px] text-[#9ca3af]">Add</p>
          </motion.button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="px-5">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[15px] font-semibold text-[#111827]">Recent Transfers</h2>
            <button onClick={() => navigate('/transactions')} className="text-xs text-[#1a56db] font-medium flex items-center gap-0.5">
              All <ArrowRight size={11} />
            </button>
          </div>
          {transactions.slice(0, 3).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Desktop ────────────────────────────────────────────────────────────────

function DesktopHome({ user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend }) {
  const rate = useMemo(() => getRate('USD'), [])
  const [amountINR, setAmountINR] = useState('')
  const usd = amountINR && Number(amountINR) > 0 ? +(Number(amountINR) / rate).toFixed(2) : null
  const totalSent = transactions.reduce((sum, tx) => sum + (tx.amountSource || 0), 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-0px)]">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-8 py-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0061D3 0%, #001f5c 100%)' }}
      >
        <div>
          <p className="text-white/60 text-sm mb-0.5">Good morning</p>
          <h1 className="text-[28px] font-bold text-white leading-tight">{user?.name?.split(' ')[0]}</h1>
          <p className="text-white/50 text-sm mt-1">Ready to send money home?</p>
        </div>

        <div className="flex items-center gap-10">
          {/* Rate */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">Live rate</span>
            </div>
            <p className="text-white text-[32px] font-bold leading-none">₹{rate.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-1">per US Dollar · Best market rate</p>
          </div>

          {/* Bell */}
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative hover:bg-white/20 transition-colors">
            <Bell size={18} className="text-white" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-400" />
          </button>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="flex-shrink-0 grid grid-cols-3 divide-x divide-[#e5e7eb] border-b border-[#e5e7eb] bg-white">
        {[
          { label: 'Sent this month',     value: totalSent > 0 ? formatSource(totalSent, 'USD') : '$0.00' },
          { label: 'Active beneficiaries', value: String(beneficiaries.length || 0) },
          { label: 'Avg savings vs banks', value: '3.8×' },
        ].map(({ label, value }) => (
          <div key={label} className="px-7 py-4">
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-[22px] font-bold text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: recent transfers */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white">
          <div className="flex items-center justify-between px-7 py-4 border-b border-[#f3f4f6] sticky top-0 bg-white z-10">
            <h2 className="text-[14px] font-semibold text-[#111827]">Recent Transfers</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[#1a56db] font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={11} />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-8">
              <p className="text-[15px] font-semibold text-[#111827]">No transfers yet</p>
              <p className="text-sm text-[#9ca3af]">Send money and it will show up here</p>
            </div>
          ) : (
            <div className="px-6 py-2">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <TransactionRow tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: send widget */}
        <div className="w-[300px] flex-shrink-0 flex flex-col overflow-y-auto bg-[#f9fafb] border-l border-[#e5e7eb]">

          {/* Send form */}
          <div className="p-5 border-b border-[#e5e7eb]">
            <p className="text-[12px] font-semibold text-[#111827] uppercase tracking-wide mb-4">Quick Send</p>

            {/* Amount input */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 mb-2 focus-within:border-[#1a56db] transition-colors">
              <p className="text-[10px] text-[#9ca3af] font-medium mb-1">You send (INR)</p>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-semibold text-[#9ca3af]">₹</span>
                <input
                  type="number"
                  value={amountINR}
                  onChange={(e) => setAmountINR(e.target.value)}
                  placeholder="20,000"
                  className="flex-1 text-[20px] font-bold text-[#111827] outline-none bg-transparent w-0"
                />
              </div>
            </div>

            {usd !== null && (
              <div className="flex items-center justify-between bg-[#f0fdf4] rounded-lg px-3 py-2 mb-3">
                <span className="text-[11px] text-[#6b7280]">Recipient gets approx.</span>
                <span className="text-[13px] font-bold text-[#16a34a]">${usd} USD</span>
              </div>
            )}

            <div className="flex items-center justify-between px-1 mb-4">
              <span className="text-[11px] text-[#9ca3af]">Rate</span>
              <span className="text-[11px] font-semibold text-[#111827]">1 USD = ₹{rate.toFixed(2)}</span>
            </div>

            {/* Beneficiary chips */}
            <p className="text-[10px] text-[#9ca3af] font-medium uppercase tracking-wide mb-2">Send to</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {beneficiaries.slice(0, 3).map((b) => {
                const cfg = PURPOSE_CONFIG[b.purpose] ?? PURPOSE_CONFIG.family
                return (
                  <button
                    key={b.id}
                    onClick={() => handleQuickSend(b)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#e5e7eb] rounded-lg hover:border-[#1a56db] hover:bg-[#eff6ff] transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg}`}>
                      <cfg.Icon size={11} className={cfg.color} />
                    </div>
                    <span className="text-[12px] font-medium text-[#111827]">{b.name.split(' ')[0]}</span>
                  </button>
                )
              })}
              <button
                onClick={() => navigate('/send/add-beneficiary')}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-[#d1d5db] rounded-lg text-[#9ca3af] hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
              >
                <Plus size={11} />
                <span className="text-[12px]">Add</span>
              </button>
            </div>

            <button
              onClick={() => navigate('/send')}
              className="w-full py-3 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
            >
              <SendIcon size={14} />
              Send Money
            </button>
          </div>

          {/* Payment source */}
          <div className="p-5">
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-3">Payment source</p>
            <button
              onClick={() => navigate('/profile/payment-source')}
              className="w-full rounded-xl overflow-hidden text-left hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
            >
              <div className="px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-[13px]">{paymentSource?.bankName}</p>
                  <p className="text-white/50 text-[11px]">{paymentSource?.accountMasked} · USD</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <ChevronRight size={14} className="text-white/40" />
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Export ─────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const user = useStore((s) => s.user)
  const beneficiaries = useStore((s) => s.beneficiaries)
  const transactions = useStore((s) => s.transactions)
  const paymentSource = useStore((s) => s.paymentSource)

  const handleQuickSend = (b) => {
    sessionStorage.setItem('send_beneficiary', JSON.stringify(b))
    navigate('/send/amount')
  }

  const props = { user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend }
  return isDesktop ? <DesktopHome {...props} /> : <MobileHome {...props} />
}
