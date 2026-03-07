import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { messagesApi } from '../../api/messages'

export default function Messages() {
  const { data, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: messagesApi.getConversations,
  })

  const conversations = data?.conversations ?? []

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Messages</h1>
      {isLoading ? (
        <p>Chargement…</p>
      ) : conversations.length === 0 ? (
        <p style={{ color: '#64748b' }}>Aucune conversation pour l'instant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {conversations.map(({ user, lastMessage, unreadCount }) => (
            <Link
              key={user.id}
              to={`/messages/${user.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit', background: unreadCount > 0 ? '#f8fafc' : 'white' }}
            >
              {user.image ? (
                <img src={`/uploads/avatars/${user.image}`} alt={user.firstname} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: unreadCount > 0 ? 700 : 500 }}>{user.firstname} {user.lastname}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastMessage.content}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(lastMessage.created_at).toLocaleDateString('fr-FR')}
                </span>
                {unreadCount > 0 && (
                  <span style={{ background: '#6366f1', color: 'white', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
