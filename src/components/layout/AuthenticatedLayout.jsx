import { Outlet, Navigate } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'
import Sidebar from './Sidebar'
import { useStore } from '../../store'
import useIsDesktop from '../../hooks/useIsDesktop'

export default function AuthenticatedLayout() {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const isDesktop = useIsDesktop()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (isDesktop) {
    return (
      <div className="flex w-full h-screen bg-[#f9fafb]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  )
}
