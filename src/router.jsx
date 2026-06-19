import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthenticatedLayout from './components/layout/AuthenticatedLayout'

// Onboarding
import Splash from './screens/Splash'
import Login from './screens/Login'
import SignUp from './screens/SignUp'
import KycUpload from './screens/KycUpload'
import KycPending from './screens/KycPending'
import KycApproved from './screens/KycApproved'

// Authenticated
import Home from './screens/Home'
import SendHome from './screens/send/SendHome'
import AddBeneficiary from './screens/send/AddBeneficiary'
import SendAmount from './screens/send/SendAmount'
import SendQuote from './screens/send/SendQuote'
import SendReview from './screens/send/SendReview'
import SendSuccess from './screens/send/SendSuccess'
import TransactionList from './screens/TransactionList'
import TransactionDetail from './screens/TransactionDetail'
import Profile from './screens/Profile'
import PaymentSource from './screens/PaymentSource'
import AdminDashboard from './pages/AdminDashboard'

export const router = createBrowserRouter([
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/', element: <Navigate to="/splash" replace /> },
  { path: '/splash', element: <Splash /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/kyc/upload', element: <KycUpload /> },
  { path: '/kyc/pending', element: <KycPending /> },
  { path: '/kyc/approved', element: <KycApproved /> },
  {
    element: <AuthenticatedLayout />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/send', element: <SendHome /> },
      { path: '/send/add-beneficiary', element: <AddBeneficiary /> },
      { path: '/send/amount', element: <SendAmount /> },
      { path: '/send/quote', element: <SendQuote /> },
      { path: '/send/review', element: <SendReview /> },
      { path: '/send/success', element: <SendSuccess /> },
      { path: '/transactions', element: <TransactionList /> },
      { path: '/transactions/:txId', element: <TransactionDetail /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profile/payment-source', element: <PaymentSource /> },
    ],
  },
])
