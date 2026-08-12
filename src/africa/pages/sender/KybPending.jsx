import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import useAfricaStore from '../../store'

export default function KybPending() {
  const navigate = useNavigate()
  const senderKybStatus = useAfricaStore((s) => s.senderKybStatus)

  useEffect(() => {
    if (senderKybStatus === 'approved') navigate('/africa/sender/kyb/approved', { replace: true })
  }, [senderKybStatus, navigate])

  return (
    <div className="max-w-md mx-auto pt-16 flex flex-col items-center text-center gap-5">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-full bg-[#fef3c7] flex items-center justify-center"
      >
        <Clock size={28} className="text-[#f97316]" />
      </motion.div>
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Reviewing your details</h1>
        <p className="text-[#6b7280] mt-2 text-sm">
          This usually takes a few seconds in this demo (a real review takes longer).
        </p>
      </div>
    </div>
  )
}
