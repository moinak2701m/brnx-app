import { NavLink } from 'react-router-dom'
import { Home, Send, Clock, User, Smartphone } from 'lucide-react'
import { useStore } from '../../store'
import { setViewOverride } from '../../hooks/useIsDesktop'

const LINKS = [
  { to: '/home',         icon: Home,  label: 'Home' },
  { to: '/send',         icon: Send,  label: 'Send Money' },
  { to: '/transactions', icon: Clock, label: 'History' },
  { to: '/profile',      icon: User,  label: 'Profile' },
]

export default function Sidebar() {
  const user = useStore((s) => s.user)

  return (
    <aside className="w-[240px] flex-shrink-0 h-full flex flex-col border-r border-[#e5e7eb] bg-white">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
          />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold tracking-tight text-[#111827]">BRNX</span>
            <span className="text-[10px] text-[#9ca3af] font-medium">by Borderless</span>
          </div>
        </div>
      </div>

      <div className="px-5 mb-1">
        <p className="text-[10px] font-semibold text-[#c4c9d4] uppercase tracking-widest px-2">Menu</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors
               ${isActive
                 ? 'bg-[#eff6ff] text-[#1a56db]'
                 : 'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* View toggle */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setViewOverride('mobile')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] transition-colors"
        >
          <Smartphone size={16} strokeWidth={1.7} />
          Mobile view
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-t border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
            >
              <span className="text-white text-sm font-bold">{user.name?.charAt(0) ?? 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#111827] truncate">{user.name}</p>
              <p className="text-[11px] text-[#9ca3af] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
