import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/ui/Toast'
import PhoneFrame from './components/layout/PhoneFrame'
import useIsDesktop from './hooks/useIsDesktop'

export default function App() {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#f9fafb', overflow: 'hidden' }}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </div>
    )
  }

  return (
    <PhoneFrame>
      <div style={{ width: '100%', height: '100%' }}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </div>
    </PhoneFrame>
  )
}
