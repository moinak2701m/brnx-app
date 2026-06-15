import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import LoanCard from '../../components/domain/LoanCard'
import Button from '../../components/ui/Button'
import { useStore } from '../../store'

export default function LoanList() {
  const navigate = useNavigate()
  const loans = useStore((s) => s.loans)

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-[20px] font-bold text-[#111827]">My Loans</h1>
        <button
          onClick={() => navigate('/loans/add/step1')}
          className="flex items-center gap-1.5 text-sm text-[#1a56db] font-medium"
        >
          <Plus size={16} />
          Add Loan
        </button>
      </div>
      <div className="flex-1 px-5 pb-6">
        {loans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[#111827]">No loans yet</p>
              <p className="text-sm text-[#9ca3af] mt-1">Add your education loan to start repaying</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/loans/add/step1')}>
              Add Your First Loan
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {loans.map((loan, i) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <LoanCard loan={loan} onClick={() => navigate(`/loans/${loan.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
