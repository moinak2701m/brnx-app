import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Sidebar from './Sidebar'
import useAfricaStore from '../store'

export default function Layout() {
  const navigate = useNavigate()
  const activeRole = useAfricaStore((s) => s.activeRole)
  const setActiveRole = useAfricaStore((s) => s.setActiveRole)
  const senderKybStatus = useAfricaStore((s) => s.senderKybStatus)

  const goSender = () => {
    setActiveRole('sender')
    if (senderKybStatus === 'approved') navigate('/africa/sender')
    else if (senderKybStatus === 'pending') navigate('/africa/sender/kyb/pending')
    else navigate('/africa/sender/kyb')
  }

  const goReceiver = () => {
    setActiveRole('receiver')
    navigate('/africa/receiver')
  }

  return (
    <div className="flex w-full min-h-screen bg-[#f9fafb]">
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e5e7eb] flex items-center px-5 gap-4 z-40">
        <a href="/" className="flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#111827]">
          <ArrowLeft size={15} /> All demos
        </a>
        <div className="h-5 w-px bg-[#e5e7eb]" />
        <img src="/assets/dragonfly-logo.svg" alt="Dragonfly" className="h-5 w-auto" />
        <span className="text-sm font-semibold text-[#111827]">Africa Invoice Payments</span>

        <div className="ml-auto flex items-center gap-1 bg-[#f3f4f6] rounded-full p-1">
          <button
            onClick={goSender}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors
              ${activeRole === 'sender' ? 'bg-[#1a56db] text-white' : 'text-[#4b5563] hover:text-[#111827]'}`}
          >
            Sender
          </button>
          <button
            onClick={goReceiver}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors
              ${activeRole === 'receiver' ? 'bg-[#1a56db] text-white' : 'text-[#4b5563] hover:text-[#111827]'}`}
          >
            Receiver
          </button>
        </div>
      </div>

      <div className="flex w-full pt-14">
        <Sidebar />
        <main className="flex-1 min-w-0 p-8 max-w-[1200px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
