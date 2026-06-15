import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import StatusStepper from '../../components/ui/StatusStepper'
import { useStore } from '../../store'
import { runPaymentSimulation } from '../../lib/simulation'

const STEPS = ['Initiating transfer', 'On-ramp to stablecoin rails', 'Routing to Indian bank', 'Crediting to loan account']

export default function PayProcessing() {
  const { loanId } = useParams()
  const navigate = useNavigate()
  const activePayment = useStore((s) => s.activePayment)
  const addTransaction = useStore((s) => s.addTransaction)
  const clearActivePayment = useStore((s) => s.clearActivePayment)
  const [completedUpTo, setCompletedUpTo] = useState(-1)

  useEffect(() => {
    if (!activePayment) {
      navigate('/loans', { replace: true })
      return
    }
    runPaymentSimulation((step) => {
      setCompletedUpTo(step)
      if (step === 3) {
        addTransaction({
          type: 'repayment',
          loanId,
          amountINR: activePayment.quote.amountINR,
          amountSource: activePayment.quote.total,
          currency: activePayment.quote.currency,
          status: 'credited',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        })
        clearActivePayment()
        setTimeout(() => navigate(`/loans/${loanId}/pay/success`, { replace: true }), 600)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="flex flex-col px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-[#eff6ff] flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full"
              style={{ border: '3px solid #1a56db', borderTopColor: 'transparent' }}
            />
          </div>
          <h1 className="text-xl font-bold text-[#111827]">Processing payment</h1>
          <p className="text-sm text-[#9ca3af] mt-1">Please don't close this screen</p>
        </motion.div>
        <StatusStepper steps={STEPS} completedUpTo={completedUpTo} />
      </div>
    </div>
  )
}
