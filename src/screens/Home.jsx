import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Plus, Landmark, User, Users, ArrowRight, TrendingUp, Send as SendIcon } from 'lucide-react'
import TransactionRow from '../components/domain/TransactionRow'
import { useStore } from '../store'
import useIsDesktop from '../hooks/useIsDesktop'

const PURPOSE_CONFIG = {
  loan:   { Icon: Landmark, bg: 'bg-[#eff6ff]', color: 'text-[#1a56db]' },
  self:   { Icon: User,     bg: 'bg-[#d1fae5]', color: 'text-[#16a34a]' },
  family: { Icon: Users,    bg: 'bg-[#ede9fe]', color: 'text-[#7c3aed]' },
}

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
          <button
            onClick={() => navigate('/send')}
            className="text-xs text-[#1a56db] font-medium flex items-center gap-0.5"
          >
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
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-[#1a56db] font-medium flex items-center gap-0.5"
            >
              All <ArrowRight size={11} />
            </button>
          </div>
          {transactions.slice(0, 3).map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onClick={() => navigate(`/transactions/${tx.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DesktopHome({ user, beneficiaries, transactions, paymentSource, navigate, handleQuickSend }) {
  return (
    <div className="p-8 flex flex-col gap-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#9ca3af]">Good morning</p>
          <h1 className="text-2xl font-bold text-[#111827]">{user?.name?.split(' ')[0]}</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center relative shadow-sm">
          <Bell size={18} className="text-[#6b7280]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#dc2626]" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-[#1a56db]" />
              <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Live rate</p>
            </div>
            <p className="text-[22px] font-bold text-[#111827]">
              1 USD = <span className="text-[#1a56db]">₹86.24</span>
            </p>
            <p className="text-xs text-[#9ca3af] mt-1">Best market rate · No hidden fees</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex-1"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
              <h2 className="text-[15px] font-semibold text-[#111827]">Recent Transfers</h2>
              <button
                onClick={() => navigate('/transactions')}
                className="text-xs text-[#1a56db] font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={11} />
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-[#9ca3af]">No transfers yet</p>
              </div>
            ) : (
              <div className="px-5 py-2">
                {transactions.slice(0, 6).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => navigate(`/transactions/${tx.id}`)} />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
          >
            <p className="text-white/70 text-xs font-medium mb-1">Sending from</p>
            <p className="text-white font-bold text-[18px]">{paymentSource?.bankName}</p>
            <p className="text-white/60 text-xs mt-0.5">{paymentSource?.accountMasked} · {paymentSource?.currency ?? 'USD'}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-2xl">🇺🇸</span>
              <button
                onClick={() => navigate('/profile/payment-source')}
                className="text-white/70 text-[11px] font-medium flex items-center gap-1"
              >
                Change <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-[#111827]">Quick Send</h2>
              <button
                onClick={() => navigate('/send')}
                className="text-xs text-[#1a56db] font-medium flex items-center gap-1"
              >
                All <ArrowRight size={11} />
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {beneficiaries.slice(0, 4).map((b, i) => {
                const cfg = PURPOSE_CONFIG[b.purpose] ?? PURPOSE_CONFIG.family
                return (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickSend(b)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${cfg.bg}`}>
                      <cfg.Icon size={18} className={cfg.color} />
                    </div>
                    <p className="text-[10px] text-[#6b7280] max-w-[50px] truncate text-center">
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
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-11 h-11 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                  <Plus size={18} className="text-[#6b7280]" />
                </div>
                <p className="text-[10px] text-[#9ca3af]">Add</p>
              </motion.button>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/send')}
            className="w-full py-3.5 rounded-2xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
          >
            <SendIcon size={17} />
            Send Money to India
          </motion.button>
        </div>
      </div>
    </div>
  )
}

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
