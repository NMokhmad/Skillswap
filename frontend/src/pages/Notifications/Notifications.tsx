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
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Notifications {data && <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>({data.total})</span>}</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            style={{ padding: '0.4rem 1rem', border: '1px solid #6366f1', color: '#6366f1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {isLoading ? (
        <p>Chargement…</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: '#64748b' }}>Aucune notification.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: n.is_read ? 'white' : '#f0f0ff',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas ${typeIcon[n.type] ?? typeIcon.default}`} style={{ color: '#6366f1', fontSize: '0.9rem' }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {n.action_url ? (
                    <Link to={n.action_url} style={{ color: '#1e293b', textDecoration: 'none', fontWeight: n.is_read ? 400 : 600 }}>
                      {n.content}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.content}</span>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {new Date(n.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      title="Marquer comme lu"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '0.85rem' }}
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif.mutate(n.id)}
                    title="Supprimer"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Précédent</button>
              <span style={{ padding: '0.5rem 1rem' }}>Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant →</button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
