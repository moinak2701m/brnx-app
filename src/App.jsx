import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/ui/Toast'
import PhoneFrame from './components/layout/PhoneFrame'
import useIsDesktop from './hooks/useIsDesktop'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App() {
  const isDesktop = useIsDesktop()

  const isAdmin = window.location.pathname.startsWith('/admin')

  if (isDesktop) {
    return (
      <div style={{ width: '100vw', height: isAdmin ? 'auto' : '100vh', background: '#f9fafb', overflow: isAdmin ? 'visible' : 'hidden' }}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div style={{ width: '100%', height: '100%' }}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </div>
    </PhoneFrame>
  )
}
