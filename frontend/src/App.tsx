import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { authApi } from './api/auth'
import Navbar from './components/navbar'
import Footer from './components/footer'
// Pages (importées au fur et à mesure de la migration)
import Help from './pages/Help/Help'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Homepage from './pages/Homepage'
import Search from './pages/Search/Search'

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return (
    <>
      <Navbar user={user} />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />

        {/* Routes protégées — décommenter au fur et à mesure */}
        {/* <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<Layout><h1>Page introuvable</h1></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
