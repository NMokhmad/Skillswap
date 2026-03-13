import './Notifications.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../api/notifications'

const typeIcon: Record<string, string> = {
  message: 'fa-envelope',
  follow: 'fa-user-plus',
  review: 'fa-star',
  default: 'fa-bell',
}

export default function Notifications() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getAll(page),
  })

  const markRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteNotif = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.notifications ?? []
  const totalPages = data?.totalPages ?? 1
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <main className="ss-notif-main">
      <div className="ss-notif-container">
        <div className="ss-notif-header">
          <div className="ss-notif-title-wrap">
            <h1 className="ss-notif-title">
              <i className="fa-solid fa-bell"></i>
              Notifications
            </h1>
            {data && (
              <p className="ss-notif-subtitle">{data.total} notification{data.total !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="ss-notif-mark-all"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <i className="fa-solid fa-check-double"></i>
              Tout marquer comme lu
            </button>
          )}
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
        ) : notifications.length === 0 ? (
          <div className="ss-notif-empty">
            <i className="fa-solid fa-bell-slash ss-notif-empty-icon"></i>
            <p className="ss-notif-empty-title">Aucune notification</p>
            <p className="ss-notif-empty-text">Vous êtes à jour !</p>
          </div>
        ) : (
          <>
            <div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`ss-notif-item${!n.is_read ? ' ss-notif-item--unread' : ''}`}
                >
                  <div className="ss-notif-icon-box">
                    <i className={`fas ${typeIcon[n.type] ?? typeIcon.default}`}></i>
                  </div>

                  <div className="ss-notif-content">
                    {n.action_url ? (
                      <Link to={n.action_url} className="ss-notif-text" style={{ textDecoration: 'none', fontWeight: n.is_read ? 400 : 600 }}>
                        {n.content}
                      </Link>
                    ) : (
                      <p className="ss-notif-text" style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.content}</p>
                    )}
                    <p className="ss-notif-time">
                      <i className="fa-regular fa-clock"></i>
                      {new Date(n.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="ss-notif-actions">
                    {n.action_url && (
                      <Link to={n.action_url} className="ss-notif-view-btn" title="Voir">
                        <i className="fas fa-arrow-right"></i>
                      </Link>
                    )}
                    {!n.is_read && (
                      <button
                        className="ss-notif-read-btn"
                        onClick={() => markRead.mutate(n.id)}
                        title="Marquer comme lu"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    <button
                      className="ss-notif-delete-btn"
                      onClick={() => deleteNotif.mutate(n.id)}
                      title="Supprimer"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="ss-notif-pagination">
                <button
                  className="ss-notif-page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`ss-notif-page-link${p === page ? ' ss-notif-page-link--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="ss-notif-page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
