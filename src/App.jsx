import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Layout from './components/Layout'
import { EmptyState } from './components/ui'
import { PanelSkeleton } from './components/Skeletons'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Collections from './pages/Collections'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import GiftStudio from './pages/GiftStudio'
import Profile from './pages/Profile'
import { Login, Signup } from './pages/Auth'

function NotFound() {
  return (
    <div className="py-16">
      <EmptyState
        icon={Compass}
        title="Lost the sparkle?"
        message="We couldn’t find that page — but there’s plenty more to discover."
        action={<Link to="/home" className="btn-primary">Back to home</Link>}
      />
    </div>
  )
}

// Pages that show personal data need a signed-in user.
function RequireAuth({ children }) {
  const { user, ready, loggedOut } = useAuth()
  const location = useLocation()
  if (!ready) return <PanelSkeleton className="h-96" />
  if (!user && loggedOut) return <Navigate to="/home" replace />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/gift-studio" element={<GiftStudio />} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
