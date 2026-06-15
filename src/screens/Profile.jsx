import { useNavigate } from 'react-router-dom'
import { User, CreditCard, LogOut, ChevronRight, ShieldCheck, Bell } from 'lucide-react'
import { useStore } from '../store'

const MenuItem = ({ icon: Icon, label, sub, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-colors ${danger ? 'hover:bg-[#fef2f2]' : 'hover:bg-[#f9fafb]'}`}
  >
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-[#fef2f2]' : 'bg-[#f3f4f6]'}`}>
      <Icon size={18} className={danger ? 'text-[#dc2626]' : 'text-[#6b7280]'} />
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className={`text-[14px] font-medium ${danger ? 'text-[#dc2626]' : 'text-[#111827]'}`}>{label}</p>
      {sub && <p className="text-xs text-[#9ca3af] truncate">{sub}</p>}
    </div>
    {!danger && <ChevronRight size={16} className="text-[#9ca3af] flex-shrink-0" />}
  </button>
)

export default function Profile() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const paymentSource = useStore((s) => s.paymentSource)
  const logout = useStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[20px] font-bold text-[#111827]">Profile</h1>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-1">
        {/* Avatar card */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#eff6ff] to-white rounded-2xl mb-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0061D3] to-[#00326D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-[#111827] truncate">{user?.name}</p>
            <p className="text-xs text-[#9ca3af] truncate">{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck size={12} className="text-[#16a34a]" />
              <span className="text-xs text-[#16a34a] font-medium">KYC Verified</span>
            </div>
          </div>
        </div>
        <MenuItem
          icon={CreditCard}
          label="Payment Source"
          sub={paymentSource ? `${paymentSource.bankName} ${paymentSource.accountMasked}` : 'Add payment method'}
          onClick={() => navigate('/profile/payment-source')}
        />
        <MenuItem icon={Bell} label="Notifications" sub="All alerts enabled" onClick={() => {}} />
        <div className="my-1 border-t border-[#f3f4f6]" />
        <MenuItem icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
      </div>
    </div>
  )
}
