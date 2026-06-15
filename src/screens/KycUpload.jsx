import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ScreenHeader from '../components/layout/ScreenHeader'
import FileUpload from '../components/ui/FileUpload'
import Button from '../components/ui/Button'
import { useStore } from '../store'

export default function KycUpload() {
  const navigate = useNavigate()
  const setKycStatus = useStore((s) => s.setKycStatus)
  const [frontFile, setFrontFile] = useState(null)
  const [selfieFile, setSelfieFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = frontFile && selfieFile

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setKycStatus('pending')
    setLoading(false)
    navigate('/kyc/pending', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <ScreenHeader title="Identity Verification" onBack={() => navigate('/login')} />
      <div className="px-6 pt-4 pb-8 flex flex-col gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-[#eff6ff] rounded-2xl p-4 mb-2">
            <p className="text-sm text-[#1e40af] font-medium">Why do we need this?</p>
            <p className="text-xs text-[#3b82f6] mt-1 leading-relaxed">
              As a regulated money transfer operator, we are required to verify your identity to comply with AML/KYC regulations.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <FileUpload
            label="Government-issued ID (front)"
            hint="Passport, Driver's license, or National ID"
            onChange={setFrontFile}
          />
          <FileUpload
            label="Selfie with ID"
            hint="Hold your ID next to your face"
            accept="image/*"
            onChange={setSelfieFile}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
            Submit for Verification
          </Button>
          <p className="text-xs text-center text-[#9ca3af] mt-3">
            Your documents are encrypted and stored securely. Verification typically takes 24 hours.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
