import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Button from '../components/ui/Button'
import { useStore } from '../store'

export default function KycPending() {
  const navigate = useNavigate()
  const setKycStatus = useStore((s) => s.setKycStatus)

  const simulateApproval = () => {
    setKycStatus('approved')
    navigate('/kyc/approved', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-white px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#fef3c7] flex items-center justify-center"
        >
          <Clock size={36} className="text-[#f97316]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-[#111827]">Verification in progress</h1>
          <p className="text-[#6b7280] mt-2 text-sm leading-relaxed">
            We're reviewing your documents. This usually takes less than 24 hours. We'll notify you once done.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-[#f9fafb] rounded-2xl p-4 text-left"
        >
          <p className="text-sm font-medium text-[#111827] mb-3">What happens next?</p>
          {[
            { label: 'Document review', active: true },
            { label: 'Identity match', active: false },
            { label: 'Account activation', active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? 'bg-[#f97316]' : 'bg-[#e5e7eb]'}`} />
              <span className={`text-sm ${s.active ? 'text-[#111827] font-medium' : 'text-[#9ca3af]'}`}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="pb-8 flex flex-col gap-3">
        <Button variant="primary" fullWidth onClick={simulateApproval}>
          Simulate Approval (Demo)
        </Button>
        <Button variant="ghost" fullWidth onClick={() => navigate('/login')}>
          Back to Login
        </Button>
      </div>
    </div>
  )
}
