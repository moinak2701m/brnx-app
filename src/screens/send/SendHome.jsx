import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import BeneficiaryCard from '../../components/domain/BeneficiaryCard'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'

export default function SendHome() {
  const navigate = useNavigate()
  const beneficiaries = useStore((s) => s.beneficiaries)
  const deleteBeneficiary = useStore((s) => s.deleteBeneficiary)

  const handleSelect = (b) => {
    sessionStorage.setItem('send_beneficiary', JSON.stringify(b))
    navigate('/send/amount')
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-[20px] font-bold text-[#111827]">Send Home</h1>
        <button
          onClick={() => navigate('/send/add-beneficiary')}
          className="flex items-center gap-1.5 text-sm text-[#1a56db] font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
      <div className="flex-1 px-5 pb-6">
        {beneficiaries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[#111827]">No beneficiaries yet</p>
              <p className="text-sm text-[#9ca3af] mt-1">Add family members to send money home</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/send/add-beneficiary')}>
              Add Beneficiary
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-xs text-[#9ca3af] font-medium">Select recipient</p>
            {beneficiaries.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BeneficiaryCard
                  beneficiary={b}
                  onClick={() => handleSelect(b)}
                  onDelete={() => deleteBeneficiary(b.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
