import './Messages.css'
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi } from '../../api/messages'
import type { MessageItem } from '../../api/messages'
import { useAuthStore } from '../../stores/authStore'
import { useSocketStore } from '../../stores/socketStore'

export default function Conversation() {
  const { userId } = useParams<{ userId: string }>()
  const otherId = Number(userId)
  const { user: currentUser } = useAuthStore()
  const { socket } = useSocketStore()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversation', otherId],
    queryFn: () => messagesApi.getConversation(otherId),
    enabled: !!otherId,
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return
    const handler = (msg: MessageItem) => {
      if (
        (msg.sender_id === otherId && msg.receiver_id === currentUser?.id) ||
        (msg.sender_id === currentUser?.id && msg.receiver_id === otherId)
      ) {
        queryClient.setQueryData(['conversation', otherId], (prev: typeof data) => {
          if (!prev) return prev
          return { ...prev, messages: [...prev.messages, msg] }
        })
        queryClient.invalidateQueries({ queryKey: ['messages'] })
      }
    }
    socket.on('message:new', handler)
    return () => { socket.off('message:new', handler) }
  }, [socket, otherId, currentUser?.id, queryClient, data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || sending) return
    setSending(true)
    try {
      await messagesApi.sendMessage(otherId, content.trim())
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['conversation', otherId] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    } finally {
      setSending(false)
    }
  }

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>
  if (isError || !data) return <main style={{ padding: '2rem' }}><p>Conversation introuvable.</p></main>

  const { otherUser, messages } = data

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <Link to="/messages" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.85rem' }}>← Retour</Link>
        {otherUser.image ? (
          <img src={`/uploads/avatars/${otherUser.image}`} alt={otherUser.firstname} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
          </div>
        )}
        <Link to={`/user/${otherUser.id}/profil`} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
          {otherUser.firstname} {otherUser.lastname}
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUser?.id
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                background: isMine ? '#6366f1' : '#f1f5f9',
                color: isMine ? 'white' : '#1e293b',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}>
                {msg.content}
                <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7, textAlign: isMine ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Écrivez un message…"
          style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          style={{ padding: '0.6rem 1.25rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </main>
  )
}
