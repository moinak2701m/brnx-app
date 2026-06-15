import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Dropdown from '../components/ui/Dropdown'
import { useStore } from '../store'

const COUNTRIES = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'EU', label: '🇪🇺 Europe' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'UK', label: '🇬🇧 United Kingdom' },
]

export default function SignUp() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '' })

  const setInput = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const canSubmit = form.name && form.email && form.phone && form.country

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    login()
    setLoading(false)
    navigate('/kyc/upload', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex flex-col px-6 pt-12 pb-8 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <img src="/assets/borderless-logo.svg" alt="Borderless" className="w-36 mb-6" />
          <h1 className="text-2xl font-bold text-[#111827]">Create account</h1>
          <p className="text-[#6b7280] mt-1">Join thousands of students sending money home</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col gap-3"
        >
          <Input label="Full name" value={form.name} onChange={setInput('name')} placeholder="Arjun Mehta" />
          <Input label="Email address" value={form.email} onChange={setInput('email')} type="email" placeholder="arjun@email.com" />
          <Input label="Phone number" value={form.phone} onChange={setInput('phone')} type="tel" placeholder="+1 (734) 555-0142" />
          <Dropdown
            label="Country of residence"
            options={COUNTRIES}
            value={form.country}
            onChange={setField('country')}
            placeholder="Select country"
          />
        </motion.div>
        <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
          Continue to KYC
        </Button>
        <p className="text-center text-sm text-[#6b7280]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a56db] font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
