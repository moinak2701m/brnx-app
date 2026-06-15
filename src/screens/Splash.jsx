import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store'

export default function Splash() {
  const navigate = useNavigate()
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const kycStatus = useStore((s) => s.kycStatus)

  useEffect(() => {
    const t = setTimeout(() => {
      if (isAuthenticated) {
        if (kycStatus === 'approved') navigate('/home', { replace: true })
        else if (kycStatus === 'pending') navigate('/kyc/pending', { replace: true })
        else navigate('/kyc/upload', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 1800)
    return () => clearTimeout(t)
  }, [isAuthenticated, kycStatus, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-[#0061D3] to-[#00326D]">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        <img src="/assets/borderless-logo.svg" alt="Borderless" className="w-44 brightness-0 invert" />
        <p className="text-white/70 text-sm font-medium tracking-wide">Transfer money to India, instantly.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-10"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
