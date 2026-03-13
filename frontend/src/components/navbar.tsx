import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './navbar.css'

// ── Types ──────────────────────────────────────────────────────────────────
// On définit la forme des objets qu'on manipule (TypeScript)
type User = {
  id: number
  firstname: string
}

type Notification = {
  id: number
  content: string
  type_notification: 'message' | 'review' | 'follow'
  is_read: boolean
  action_url: string | null
  created_at: string
}

// ── Props ──────────────────────────────────────────────────────────────────
// Ce que le composant attend de son parent (équivalent des variables EJS)
type NavbarProps = {
  user: User | null  // null = non connecté
}

// ── Composant ──────────────────────────────────────────────────────────────
export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate()

  // État du menu burger (ouvert/fermé) — remplace le JS burgerMenu.js
  const [menuOpen, setMenuOpen] = useState(false)

  // Compteurs pour les badges
  const [notifCount, setNotifCount]     = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  // Liste des notifications pour le dropdown desktop
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)

  // ── Équivalent de loadNotifBadge() + setInterval ────────────────────────
  // useEffect avec [user] = s'exécute au montage et si user change
  useEffect(() => {
    if (!user) return  // pas connecté → rien à charger

    async function loadBadges() {
      try {
        const [notifRes, msgRes] = await Promise.all([
          fetch('/api/notifications/count'),
          fetch('/api/messages/unread-count')
        ])
        if (notifRes.ok) {
          const data = await notifRes.json()
          setNotifCount(data.count)
        }
        if (msgRes.ok) {
          const data = await msgRes.json()
          setMessageCount(data.count)
        }
      } catch { /* silently fail */ }
    }

    loadBadges()

    // return = cleanup : React appelle ça quand le composant se démonte
    const interval = setInterval(loadBadges, 30000)
    return () => clearInterval(interval)
  }, [user])

  // ── Équivalent de loadNotifDropdown() ───────────────────────────────────
  async function loadNotifDropdown() {
    try {
      const res = await fetch('/api/notifications/recent')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications)
    } catch { /* silently fail */ }
  }

  // ── Équivalent du form POST /logout ─────────────────────────────────────
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    navigate('/login')
  }

  // ── Équivalent du click "Tout lire" ─────────────────────────────────────
  async function handleMarkAllRead(e: React.MouseEvent) {
    e.preventDefault()
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setNotifCount(0)
    loadNotifDropdown()
  }

  const iconMap: Record<string, string> = {
    message: 'fa-envelope',
    review:  'fa-star',
    follow:  'fa-user-plus'
  }

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <nav className="ss-nav">
      <div className="ss-nav-inner">

        {/* ── Brand ── */}
        <div className="ss-nav-brand">
          {/* <a href="/"> → <Link to="/"> (react-router gère la navigation sans reload) */}
          <Link to="/" className="ss-nav-logo">SkillSwap</Link>

          {/* <% if (user) { %> → {user && (...)} */}
          {user && (
            <div className="ss-nav-mobile-right">
              <div className="ss-notif-bell-wrap">
                <Link to="/notifications" className="ss-notif-btn">
                  <i className="fa-solid fa-bell"></i>
                  {/* Badge visible seulement si count > 0 (pas de style display:none) */}
                  {notifCount > 0 && (
                    <span className="notif-badge">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="ss-avatar-wrap">
                <button className="ss-avatar-btn" aria-label="Menu utilisateur">
                  <i className="fas fa-user-circle"></i>
                </button>
                <div className="ss-dropdown ss-dropdown--left">
                  {/* /user/<%= user.id %>/profil → `/user/${user.id}/profil` */}
                  <Link to={`/user/${user.id}/profil`} className="ss-dropdown-item">
                    <i className="fas fa-user ss-di-amber"></i>
                    Mon profil
                  </Link>
                  <Link to="/messages" className="ss-dropdown-item">
                    <i className="fas fa-envelope ss-di-amber"></i>
                    Messages
                    {messageCount > 0 && (
                      <span className="message-badge">
                        {messageCount > 99 ? '99+' : messageCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/notifications" className="ss-dropdown-item">
                    <i className="fas fa-bell ss-di-amber"></i>
                    Notifications
                  </Link>
                  <hr className="ss-dropdown-sep" />
                  {/* form POST /logout → bouton avec fonction handleLogout */}
                  <button onClick={handleLogout} className="ss-dropdown-item ss-dropdown-item--logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Burger : onClick toggle l'état menuOpen */}
          <button
            className="ss-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* ── Menu ── */}
        {/* Classe CSS dynamique selon l'état : remplace le JS burgerMenu */}
        <div className={`ss-nav-menu ${menuOpen ? 'is-active' : ''}`}>
          <div className="ss-nav-links">
            <Link to="/" className="ss-nav-link">
              <i className="fas fa-home"></i>
              <span>Accueil</span>
            </Link>
            <Link to="/talents" className="ss-nav-link">
              <i className="fas fa-users"></i>
              <span>Talents</span>
            </Link>
            <Link to="/skills" className="ss-nav-link">
              <i className="fas fa-star"></i>
              <span>Compétences</span>
            </Link>
            <Link to="/search" className="ss-nav-link">
              <i className="fas fa-search"></i>
              <span>Recherche</span>
            </Link>
            <Link to="/help" className="ss-nav-link">
              <i className="fas fa-question-circle"></i>
              <span>Aide</span>
            </Link>
          </div>

          <div className="ss-nav-actions">
            {/* <% if (user) { %> ... <% } else { %> → ternaire user ? (...) : (...) */}
            {user ? (
              <>
                {/* Cloche desktop : onMouseEnter/Leave remplace addEventListener */}
                <div
                  className={`ss-notif-wrap ${notifPanelOpen ? 'is-active' : ''}`}
                  onMouseEnter={() => { setNotifPanelOpen(true); loadNotifDropdown() }}
                  onMouseLeave={() => setNotifPanelOpen(false)}
                >
                  <Link to="/notifications" className="ss-notif-btn">
                    <i className="fa-solid fa-bell"></i>
                    {notifCount > 0 && (
                      <span className="notif-badge">
                        {notifCount > 99 ? '99+' : notifCount}
                      </span>
                    )}
                  </Link>
                  <div className="ss-dropdown ss-dropdown--notif">
                    <div className="notif-dropdown-header">
                      <strong>Notifications</strong>
                      <a href="#" onClick={handleMarkAllRead} className="notif-dropdown-mark-all">
                        Tout lire
                      </a>
                    </div>
                    <div className="notif-dropdown-list">
                      {notifications.length === 0 ? (
                        <p className="notif-dropdown-empty">Aucune notification</p>
                      ) : (
                        // .map() remplace la boucle forEach qui créait des éléments DOM
                        // key={n.id} est obligatoire en React pour identifier chaque élément
                        notifications.map(n => (
                          <a
                            key={n.id}
                            href={n.action_url || '/notifications'}
                            className={`notif-dropdown-item ${n.is_read ? '' : 'notif-dropdown-item-unread'}`}
                          >
                            <span className="ss-di-icon">
                              <i className={`fa-solid ${iconMap[n.type_notification] || 'fa-bell'}`}></i>
                            </span>
                            <span className="notif-dropdown-item-text">{n.content}</span>
                            <span className="notif-dropdown-item-date">
                              {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          </a>
                        ))
                      )}
                    </div>
                    <Link to="/notifications" className="notif-dropdown-footer">
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>

                {/* Prénom + dropdown desktop */}
                <div className="ss-user-wrap">
                  <button className="ss-user-btn">
                    <i className="fas fa-user-circle"></i>
                    {/* <%= user.firstname %> → {user.firstname} */}
                    <span>{user.firstname}</span>
                    <i className="fas fa-chevron-down ss-chevron"></i>
                  </button>
                  <div className="ss-dropdown ss-dropdown--right">
                    <Link to={`/user/${user.id}/profil`} className="ss-dropdown-item">
                      <i className="fas fa-user ss-di-amber"></i>
                      Mon profil
                    </Link>
                    <Link to="/messages" className="ss-dropdown-item">
                      <i className="fas fa-envelope ss-di-amber"></i>
                      Messages
                      {messageCount > 0 && (
                        <span className="message-badge">
                          {messageCount > 99 ? '99+' : messageCount}
                        </span>
                      )}
                    </Link>
                    <hr className="ss-dropdown-sep" />
                    <button onClick={handleLogout} className="ss-dropdown-item ss-dropdown-item--logout">
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Pas connecté */
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
