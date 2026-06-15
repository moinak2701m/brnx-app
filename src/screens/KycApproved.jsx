import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'

export default function KycApproved() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/home', { replace: true }), 3000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex flex-col min-h-full bg-white px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-12">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-20 h-20 rounded-full bg-[#dcfce7] flex items-center justify-center"
        >
          <CheckCircle2 size={40} className="text-[#16a34a]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h1 className="text-2xl font-bold text-[#111827]">You're verified!</h1>
          <p className="text-[#6b7280] mt-2 text-sm leading-relaxed">
            Your identity has been verified. You can now send money to India instantly.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full bg-[#f0fdf4] rounded-2xl p-4 text-left space-y-2"
        >
          {['Send money to family', 'Support your goals in India', 'Track all transactions'].map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#16a34a]" />
              <span className="text-sm text-[#374151]">{f}</span>
            </div>
          ))}
        </motion.div>
        <p className="text-xs text-[#9ca3af]">Taking you to the app in a moment…</p>
      </div>
      <div className="pb-8">
        <Button variant="primary" fullWidth onClick={() => navigate('/home', { replace: true })}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
