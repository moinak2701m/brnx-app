import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Button from '../../../components/ui/Button'

export default function KybApproved() {
  const navigate = useNavigate()

  return (
    <div className="max-w-md mx-auto pt-16 flex flex-col items-center text-center gap-5">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center"
      >
        <CheckCircle2 size={28} className="text-[#16a34a]" />
      </motion.div>
      <div>
        <h1 className="text-xl font-bold text-[#111827]">You're verified!</h1>
        <p className="text-[#6b7280] mt-2 text-sm">
          Lagos Foods Ltd can now pay invoices and manage a treasury wallet on Dragonfly.
        </p>
      </div>
      <Button variant="primary" onClick={() => navigate('/africa/sender')}>
        Go to dashboard
      </Button>
    </div>
  )
}
