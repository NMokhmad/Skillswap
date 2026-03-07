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
import ProfilPublic from './pages/Profil/ProfilPublic'
import MyProfil from './pages/Profil/MyProfil'
import ProtectedRoute from './components/ProtectedRoute'
import Skills from './pages/Skills/Skills'
import Skill from './pages/Skills/Skill'
import Talents from './pages/Talents/Talents'
import Talent from './pages/Talents/Talent'
import Messages from './pages/Messages/Messages'
import Conversation from './pages/Messages/Conversation'
import Notifications from './pages/Notifications/Notifications'
import { useSocketStore } from './stores/socketStore'

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
  const { connect: connectSocket, disconnect: disconnectSocket } = useSocketStore()

  useEffect(() => {
    authApi.me()
      .then(({ user }) => { setUser(user); connectSocket() })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
    return () => { disconnectSocket() }
  }, [setUser, setLoading, connectSocket, disconnectSocket])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Homepage /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/user/:id/profil" element={<Layout><ProfilPublic /></Layout>} />
        <Route path="/mon-profil" element={<ProtectedRoute><Layout><MyProfil /></Layout></ProtectedRoute>} />
        <Route path="/skills" element={<Layout><Skills /></Layout>} />
        <Route path="/skills/:slug" element={<Layout><Skill /></Layout>} />
        <Route path="/talents" element={<Layout><Talents /></Layout>} />
        <Route path="/talents/:id" element={<Layout><Talent /></Layout>} />
        <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Layout><Conversation /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={<Layout><h1>Page introuvable</h1></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
