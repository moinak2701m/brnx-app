import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AdminDashboard from './pages/AdminDashboard'

const root = createRoot(document.getElementById('root'))

if (window.location.pathname.startsWith('/admin')) {
  root.render(<StrictMode><AdminDashboard /></StrictMode>)
} else {
  root.render(<StrictMode><App /></StrictMode>)
}
