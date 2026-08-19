import { NavLink } from 'react-router-dom'
import { Home, FileText, Wallet, Users, BookOpen, Settings } from 'lucide-react'
import useAfricaStore from '../store'

const SENDER_LINKS = [
  { to: '/africa/sender', icon: Home, label: 'Home', end: true },
  { to: '/africa/sender/invoices', icon: FileText, label: 'Invoices' },
  { to: '/africa/sender/treasury', icon: Wallet, label: 'Treasury' },
]

const RECEIVER_LINKS = [
  { to: '/africa/receiver', icon: Home, label: 'Home', end: true },
  { to: '/africa/receiver/senders', icon: Users, label: 'Senders' },
  { to: '/africa/receiver/invoices', icon: FileText, label: 'Invoices' },
  { to: '/africa/receiver/ledger', icon: BookOpen, label: 'Ledger' },
  { to: '/africa/receiver/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const activeRole = useAfricaStore((s) => s.activeRole)
  const links = activeRole === 'sender' ? SENDER_LINKS : activeRole === 'receiver' ? RECEIVER_LINKS : []

  if (!links.length) return null

  return (
    <aside className="w-48 flex-shrink-0 h-full bg-white border-r border-[#f3f4f6] flex flex-col py-6">
      <nav className="px-3 flex flex-col gap-0.5">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
               ${isActive ? 'bg-[#eff6ff] text-[#1a56db]' : 'text-[#4b5563] hover:bg-[#f9fafb]'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
