import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useStore } from '../store'

export default function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const setKycStatus = useStore((s) => s.setKycStatus)
  const kycStatus = useStore((s) => s.kycStatus)
  const [email, setEmail] = useState('arjun@email.com')
  const [password, setPassword] = useState('••••••••')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    login()
    setLoading(false)
    if (kycStatus === 'approved') navigate('/home', { replace: true })
    else if (kycStatus === 'pending') navigate('/kyc/pending', { replace: true })
    else navigate('/kyc/upload', { replace: true })
  }

  const handleDemoSkip = () => {
    login()
    setKycStatus('approved')
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          <div>
            <img src="/assets/borderless-logo.svg" alt="Borderless" className="w-36 mb-6" />
            <h1 className="text-2xl font-bold text-[#111827]">Welcome back</h1>
            <p className="text-[#6b7280] mt-1">Sign in to your account</p>
          </div>
          <div className="flex flex-col gap-3">
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          <Button variant="primary" fullWidth onClick={handleLogin} loading={loading}>
            Sign In
          </Button>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-xs text-[#9ca3af] flex-shrink-0">or</span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>
          <button
            onClick={handleDemoSkip}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#e5e7eb] text-sm font-medium text-[#374151] hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
          >
            <Zap size={14} />
            Skip to Demo Dashboard
          </button>
          <p className="text-center text-sm text-[#6b7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1a56db] font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
