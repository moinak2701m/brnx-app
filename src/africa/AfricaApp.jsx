import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../components/ui/Toast'
import Layout from './components/Layout'
import RolePick from './pages/RolePick'
import KybUpload from './pages/sender/KybUpload'
import KybPending from './pages/sender/KybPending'
import KybApproved from './pages/sender/KybApproved'
import SenderHome from './pages/sender/Home'
import SenderInvoices from './pages/sender/Invoices'
import PayInvoice from './pages/sender/PayInvoice'
import Treasury from './pages/sender/Treasury'
import ReceiverHome from './pages/receiver/Home'
import Senders from './pages/receiver/Senders'
import ReceiverInvoices from './pages/receiver/Invoices'
import InvoiceNew from './pages/receiver/InvoiceNew'
import Ledger from './pages/receiver/Ledger'
import Settings from './pages/receiver/Settings'

const router = createBrowserRouter([
  {
    path: '/africa',
    element: <Layout />,
    children: [
      { index: true, element: <RolePick /> },
      { path: 'sender/kyb', element: <KybUpload /> },
      { path: 'sender/kyb/pending', element: <KybPending /> },
      { path: 'sender/kyb/approved', element: <KybApproved /> },
      { path: 'sender', element: <SenderHome /> },
      { path: 'sender/invoices', element: <SenderInvoices /> },
      { path: 'sender/invoices/:invoiceId/pay', element: <PayInvoice /> },
      { path: 'sender/treasury', element: <Treasury /> },
      { path: 'receiver', element: <ReceiverHome /> },
      { path: 'receiver/senders', element: <Senders /> },
      { path: 'receiver/invoices', element: <ReceiverInvoices /> },
      { path: 'receiver/invoices/new', element: <InvoiceNew /> },
      { path: 'receiver/ledger', element: <Ledger /> },
      { path: 'receiver/settings', element: <Settings /> },
    ],
  },
])

export default function AfricaApp() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
