import { Link } from 'react-router-dom'

type User = {
  id: number
  firstname: string
}

type MobileUserMenuProps = {
  user: User
  notifCount: number
  messageCount: number
  onLogout: () => void
}

export default function MobileUserMenu({ user, notifCount, messageCount, onLogout }: MobileUserMenuProps) {
  return (
    <div className="ss-nav-mobile-right">
      {/* Cloche mobile */}
      <div className="ss-notif-bell-wrap">
        <Link to="/notifications" className="ss-notif-btn">
          <i className="fa-solid fa-bell"></i>
          {notifCount > 0 && (
            <span className="notif-badge">
              {notifCount > 99 ? '99+' : notifCount}
            </span>
          )}
        </Link>
      </div>

      {/* Avatar + dropdown mobile */}
      <div className="ss-avatar-wrap">
        <button className="ss-avatar-btn" aria-label="Menu utilisateur">
          <i className="fas fa-user-circle"></i>
        </button>
        <div className="ss-dropdown ss-dropdown--left">
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
          <button onClick={onLogout} className="ss-dropdown-item ss-dropdown-item--logout">
            <i className="fas fa-sign-out-alt"></i>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
}
