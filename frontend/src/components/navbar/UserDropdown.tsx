import { Link } from 'react-router-dom'

type User = {
  id: number
  firstname: string
}

// Props reçues depuis Navbar
type UserDropdownProps = {
  user: User
  messageCount: number
  onLogout: () => void   // la fonction logout vient du parent
}

export default function UserDropdown({ user, messageCount, onLogout }: UserDropdownProps) {
  return (
    <div className="ss-user-wrap">
      <button className="ss-user-btn">
        <i className="fas fa-user-circle"></i>
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
        {/* onLogout est passé depuis Navbar, pas défini ici */}
        <button onClick={onLogout} className="ss-dropdown-item ss-dropdown-item--logout">
          Déconnexion
        </button>
      </div>
    </div>
  )
}
