import { NavLink } from 'react-router-dom'
import { Home, Send, Clock, User } from 'lucide-react'

const TABS = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/send', icon: Send, label: 'Send' },
  { to: '/transactions', icon: Clock, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomTabBar() {
  return (
    <div className="flex-shrink-0 bg-white border-t border-[#e5e7eb] z-30">
      <div className="flex items-center justify-around pt-2 pb-3">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors min-w-0
               ${isActive ? 'text-[#1a56db]' : 'text-[#9ca3af]'}`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
