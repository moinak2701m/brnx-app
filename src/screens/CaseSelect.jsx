import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, GraduationCap } from 'lucide-react'
import Card from '../components/ui/Card'

const CASES = [
  {
    key: 'india',
    icon: GraduationCap,
    title: 'India — Inward Remittance',
    subtitle: 'Repay education loans & send money home from the US',
    tag: 'Consumer · Mobile',
  },
  {
    key: 'africa',
    icon: Building2,
    title: 'Africa — Outward Invoice Payments',
    subtitle: 'Pay & receive B2B invoices across African corridors, crypto-native',
    tag: 'B2B · Desktop',
  },
]

export default function CaseSelect() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-full bg-white px-6 pt-14 pb-10">
      <div className="mb-8">
        <img src="/assets/dragonfly-logo.svg" alt="Dragonfly" className="w-32 mb-6" />
        <h1 className="text-2xl font-bold text-[#111827]">Which demo are you running?</h1>
        <p className="text-[#6b7280] mt-1">Pick a case to load — you can switch back anytime.</p>
      </div>

      <div className="flex flex-col gap-4">
        {CASES.map((c, i) => {
          const Icon = c.icon
          const body = (
            <Card className="hover:border-[#1a56db] transition-colors" onClick={c.key === 'india' ? () => navigate('/splash') : undefined}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[#1a56db]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#1a56db] uppercase tracking-widest">{c.tag}</span>
                  <h2 className="text-base font-bold text-[#111827] mt-0.5">{c.title}</h2>
                  <p className="text-sm text-[#6b7280] mt-1">{c.subtitle}</p>
                </div>
                <ArrowRight size={18} className="text-[#94a3b8] flex-shrink-0 mt-2" />
              </div>
            </Card>
          )

          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {c.key === 'africa' ? (
                <a href="/africa" className="block">{body}</a>
              ) : (
                body
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
