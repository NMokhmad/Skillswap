import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../navbar.css'
import NavLinks from './NavLinks'
import NotifDropdown from './NotifDropdown'
import UserDropdown from './UserDropdown'
import MobileUserMenu from './MobileUserMenu'

type User = {
  id: number
  firstname: string
}

type NavbarProps = {
  user: User | null
}

// Navbar est maintenant un orchestrateur :
// il gère les états partagés et délègue l'affichage aux sous-composants
export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate()

  // État du burger (partagé avec le rendu du menu)
  const [menuOpen, setMenuOpen] = useState(false)

  // Compteurs partagés entre mobile et desktop → restent ici
  const [notifCount, setNotifCount]     = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  // Polling des badges toutes les 30s
  useEffect(() => {
    if (!user) return

    async function loadBadges() {
      try {
        const [notifRes, msgRes] = await Promise.all([
          fetch('/api/notifications/count', { credentials: 'include' }),
          fetch('/api/messages/unread-count', { credentials: 'include' })
        ])
        if (notifRes.ok) setNotifCount((await notifRes.json()).count)
        if (msgRes.ok)   setMessageCount((await msgRes.json()).count)
      } catch { /* silently fail */ }
    }

    loadBadges()
    const interval = setInterval(loadBadges, 30000)
    return () => clearInterval(interval)
  }, [user])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  return (
    <nav className="ss-nav">
      <div className="ss-nav-inner">

        {/* ── Brand ── */}
        <div className="ss-nav-brand">
          <Link to="/" className="ss-nav-logo">SkillSwap</Link>

          {/* Menu mobile (cloche + avatar) : affiché seulement si connecté */}
          {user && (
            <MobileUserMenu
              user={user}
              notifCount={notifCount}
              messageCount={messageCount}
              onLogout={handleLogout}
            />
          )}

          <button
            className="ss-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <span></span><span></span><span></span><span></span>
          </button>
        </div>

        {/* ── Menu principal ── */}
        <div className={`ss-nav-menu ${menuOpen ? 'is-active' : ''}`}>

          {/* Liens statiques extraits dans NavLinks */}
          <NavLinks />

          <div className="ss-nav-actions">
            {user ? (
              <>
                {/* Cloche desktop extraite dans NotifDropdown */}
                <NotifDropdown
                  notifCount={notifCount}
                  onCountReset={() => setNotifCount(0)}
                />

                {/* Menu utilisateur desktop extrait dans UserDropdown */}
                <UserDropdown
                  user={user}
                  messageCount={messageCount}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <>
                <Link to="/login" className="ss-btn-nav ss-btn-nav--outline">
                  <i className="fas fa-sign-in-alt"></i>
                  Connexion
                </Link>
                <Link to="/register" className="ss-btn-nav ss-btn-nav--filled">
                  <i className="fas fa-user-plus"></i>
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}
