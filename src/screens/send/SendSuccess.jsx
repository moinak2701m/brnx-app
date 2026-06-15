import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Zap, Banknote, ArrowRightLeft, Building2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'
import { formatINR, formatSource } from '../../lib/fx'

const STAGES = [
  { Icon: CheckCircle2,   label: 'Transfer initiated',  sub: 'Your payment has been authorised' },
  { Icon: ArrowRightLeft, label: 'Payment received',    sub: 'Funds received by our partner' },
  { Icon: Building2,      label: 'Routing to India',    sub: 'Converting and routing to beneficiary bank' },
  { Icon: Banknote,       label: 'Credited to account', sub: 'INR deposited to recipient account' },
]

// Demo fallback delays (ms) — used when no txId is present
const DEMO_DELAYS = [1200, 1800, 1600, 900]

const POLL_INTERVAL = 3000 // ms

export default function SendSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const txId = searchParams.get('txId')

  const transactions = useStore((s) => s.transactions)
  const lastTx = transactions[0]

  const [activeStage, setActiveStage] = useState(0)
  const done = activeStage >= STAGES.length

  const started  = useRef(false)
  const pollRef  = useRef(null)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (txId) {
      // ── API mode: poll status endpoint ───────────────────────────────────────
      const poll = async () => {
        try {
          const res  = await fetch(`/api/transfers/${txId}`)
          const data = await res.json()
          if (data.stage !== undefined) {
            // stage from API is 0-3 (index of last completed stage + 1 = activeStage equivalent)
            // API returns stage = index of the stage that is currently "done up to"
            // We map: stage 0 → activeStage 0, stage 3 → activeStage 4 (all done)
            const apiStage = data.done ? STAGES.length : data.stage
            setActiveStage((prev) => Math.max(prev, apiStage))
          }
          if (data.done) {
            clearInterval(pollRef.current)
          }
        } catch (_) {
          // Network error — keep polling silently
        }
      }

      poll() // immediate first check
      pollRef.current = setInterval(poll, POLL_INTERVAL)
      return () => clearInterval(pollRef.current)
    } else {
      // ── Demo mode: timer-based stage advancement ──────────────────────────────
      let stage = 0
      const advance = () => {
        if (stage >= DEMO_DELAYS.length) return
        setTimeout(() => {
          stage++
          setActiveStage(stage)
          advance()
        }, DEMO_DELAYS[stage])
      }
      advance()
    }
  }, [txId]) // eslint-disable-line

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex flex-col px-6 pt-10 pb-6 gap-6">

        {/* Hero */}
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-500
              ${done ? 'bg-[#dcfce7]' : 'bg-[#eff6ff]'}`}
          >
            {done
              ? <CheckCircle2 size={40} className="text-[#16a34a]" />
              : <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-9 h-9 rounded-full"
                  style={{ border: '3px solid #1a56db', borderTopColor: 'transparent' }}
                />
            }
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={done ? 'done' : 'progress'}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-2xl font-bold text-[#111827]"
              >
                {done ? 'Money on its way.' : 'Sending…'}
              </motion.h1>
            </AnimatePresence>
            {lastTx && (
              <p className="text-[#6b7280] mt-1 text-sm">
                {formatINR(lastTx.amountINR)} to {lastTx.beneficiaryName}
              </p>
            )}
          </motion.div>
        </div>

        {/* Transfer summary */}
        {lastTx && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#f9fafb] rounded-2xl p-4"
          >
            {[
              ['You sent',       formatSource(lastTx.amountSource, lastTx.currency)],
              ['Recipient gets', formatINR(lastTx.amountINR)],
              ['To',             lastTx.beneficiaryName],
              ['Date',           lastTx.date],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#9ca3af]">{k}</span>
                <span className={`text-sm font-semibold ${k === 'Recipient gets' ? 'text-[#16a34a]' : 'text-[#111827]'}`}>{v}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Live tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#1a56db]" />
            <p className="text-xs font-medium text-[#6b7280]">Transfer tracker · Near instant</p>
          </div>
          <div className="flex flex-col">
            {STAGES.map((stage, i) => {
              const isComplete = i < activeStage
              const isActive   = i === activeStage && !done
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: i <= activeStage ? 1 : 0.4 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500
                        ${isComplete ? 'bg-[#dcfce7]' : isActive ? 'bg-[#eff6ff]' : 'bg-[#f3f4f6]'}`}
                    >
                      <stage.Icon size={15} className={isComplete ? 'text-[#16a34a]' : isActive ? 'text-[#1a56db]' : 'text-[#d1d5db]'} />
                    </motion.div>
                    {i < STAGES.length - 1 && (
                      <div className="w-0.5 h-6 overflow-hidden bg-[#e5e7eb]">
                        <motion.div
                          className="w-full bg-[#bbf7d0]"
                          initial={{ height: '0%' }}
                          animate={{ height: isComplete ? '100%' : '0%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-semibold transition-colors duration-300
                      ${isComplete ? 'text-[#111827]' : isActive ? 'text-[#1a56db]' : 'text-[#9ca3af]'}`}>
                      {stage.label}
                      {isActive && <span className="ml-2 text-xs font-normal text-[#f59e0b]">In progress</span>}
                      {isComplete && <span className="ml-2 text-xs font-normal text-[#16a34a]">✓</span>}
                    </p>
                    <p className="text-xs text-[#9ca3af]">{stage.sub}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 pt-2">
          <Button variant="primary" fullWidth onClick={() => navigate('/home')}>Back to Home</Button>
          <Button variant="ghost"   fullWidth onClick={() => navigate('/transactions')}>View History</Button>
        </div>
      </div>
    </div>
  )
}
