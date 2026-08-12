import { useNavigate } from 'react-router-dom'
import { Building2, Send } from 'lucide-react'
import useAfricaStore from '../store'

export default function RolePick() {
  const navigate = useNavigate()
  const setActiveRole = useAfricaStore((s) => s.setActiveRole)
  const senderKybStatus = useAfricaStore((s) => s.senderKybStatus)

  const pickSender = () => {
    setActiveRole('sender')
    if (senderKybStatus === 'approved') navigate('/africa/sender')
    else if (senderKybStatus === 'pending') navigate('/africa/sender/kyb/pending')
    else navigate('/africa/sender/kyb')
  }

  const pickReceiver = () => {
    setActiveRole('receiver')
    navigate('/africa/receiver')
  }

  return (
    <div className="max-w-2xl mx-auto pt-10">
      <h1 className="text-2xl font-bold text-[#111827] mb-2">Who are you demoing as?</h1>
      <p className="text-[#6b7280] mb-8">
        Both roles share the same invoices — flip between them anytime from the top bar.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <button
          onClick={pickSender}
          className="text-left bg-white border border-[#e5e7eb] rounded-2xl p-6 hover:border-[#1a56db] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-4">
            <Send size={20} className="text-[#1a56db]" />
          </div>
          <h2 className="text-base font-bold text-[#111827] mb-1">Sender (Nigeria)</h2>
          <p className="text-sm text-[#6b7280]">
            Pay incoming invoices in NGN, or fund a USD treasury wallet and pay instantly.
          </p>
        </button>

        <button
          onClick={pickReceiver}
          className="text-left bg-white border border-[#e5e7eb] rounded-2xl p-6 hover:border-[#1a56db] transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-4">
            <Building2 size={20} className="text-[#1a56db]" />
          </div>
          <h2 className="text-base font-bold text-[#111827] mb-1">Receiver (US)</h2>
          <p className="text-sm text-[#6b7280]">
            Onboard senders, create invoices, and track settlement into your wallet and bank.
          </p>
        </button>
      </div>
    </div>
  )
}
