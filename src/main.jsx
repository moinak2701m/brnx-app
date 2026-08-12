import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AdminDashboard from './pages/AdminDashboard'
import AfricaApp from './africa/AfricaApp'

const root = createRoot(document.getElementById('root'))

if (window.location.pathname.startsWith('/admin')) {
  root.render(<StrictMode><AdminDashboard /></StrictMode>)
} else if (window.location.pathname.startsWith('/africa')) {
  root.render(<StrictMode><AfricaApp /></StrictMode>)
} else {
  root.render(<StrictMode><App /></StrictMode>)
}
