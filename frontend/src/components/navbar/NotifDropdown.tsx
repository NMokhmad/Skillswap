import { useState } from 'react'
import { Link } from 'react-router-dom'

type Notification = {
  id: number
  content: string
  type_notification: 'message' | 'review' | 'follow'
  is_read: boolean
  action_url: string | null
  created_at: string
}

// Props reçues depuis Navbar : le compteur et une fonction pour le remettre à 0
type NotifDropdownProps = {
  notifCount: number
  onCountReset: () => void
}

const iconMap: Record<string, string> = {
  message: 'fa-envelope',
  review:  'fa-star',
  follow:  'fa-user-plus'
}

export default function NotifDropdown({ notifCount, onCountReset }: NotifDropdownProps) {
  // État local : la liste des notifs et l'ouverture du panel
  // Ces états n'ont pas besoin de remonter dans Navbar → ils restent ici
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  async function loadNotifications() {
    try {
      const res = await fetch('/api/notifications/recent', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications)
    } catch { /* silently fail */ }
  }

  async function handleMarkAllRead(e: React.MouseEvent) {
    e.preventDefault()
    await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' })
    onCountReset()         // remonte l'action au parent pour mettre le badge à 0
    loadNotifications()
  }

  return (
    <div
      className={`ss-notif-wrap ${isOpen ? 'is-active' : ''}`}
      onMouseEnter={() => { setIsOpen(true); loadNotifications() }}
      onMouseLeave={() => setIsOpen(false)}
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
  )
}
