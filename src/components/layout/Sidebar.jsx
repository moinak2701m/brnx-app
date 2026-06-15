import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Send, Clock, User, Smartphone } from 'lucide-react'
import { useStore } from '../../store'
import { getRate } from '../../lib/fx'
import { setViewOverride } from '../../hooks/useIsDesktop'

const LINKS = [
  { to: '/home',         icon: Home,  label: 'Home' },
  { to: '/send',         icon: Send,  label: 'Send Money' },
  { to: '/transactions', icon: Clock, label: 'History' },
  { to: '/profile',      icon: User,  label: 'Profile' },
]

export default function Sidebar() {
  const user = useStore((s) => s.user)
  const rate = useMemo(() => getRate('USD'), [])

  return (
    <aside
      className="w-[220px] flex-shrink-0 h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0061D3 0%, #00326D 100%)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-[11px] tracking-tight">BX</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white text-[16px] font-bold tracking-tight">BRNX</span>
            <span className="text-white/40 text-[10px] font-medium">by Borderless</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-0.5 mb-2">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
               ${isActive
                 ? 'bg-white/20 text-white'
                 : 'text-white/55 hover:bg-white/10 hover:text-white/85'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live rate badge */}
      <div className="mx-3 mb-3 rounded-xl bg-white/10 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Live rate</span>
        </div>
        <p className="text-white font-bold text-[16px] leading-none">₹{rate.toFixed(2)}</p>
        <p className="text-white/40 text-[10px] mt-1">per US Dollar</p>
      </div>

      {/* Mobile view toggle */}
      <div className="px-3 mb-3">
        <button
          onClick={() => setViewOverride('mobile')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
        >
          <Smartphone size={14} strokeWidth={1.7} />
          Mobile view
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{user.name?.charAt(0) ?? 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
