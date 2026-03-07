import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { talentsApi } from '../../api/talents'
import { useAuthStore } from '../../stores/authStore'

export default function Talent() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['talent', id],
    queryFn: () => talentsApi.getOne(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>
  if (isError || !data) return <main style={{ padding: '2rem' }}><p>Talent introuvable.</p></main>

  const { talent } = data
  const isOwnProfile = currentUser?.id === talent.id

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        {talent.image ? (
          <img src={`/uploads/avatars/${talent.image}`} alt={talent.firstname} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-user" style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
          </div>
        )}
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>{talent.firstname} {talent.lastname}</h1>
          {talent.interest && <p style={{ margin: '0 0 0.25rem', color: '#64748b' }}><i className="fas fa-briefcase"></i> {talent.interest}</p>}
          {talent.city && <p style={{ margin: '0 0 0.5rem', color: '#64748b' }}><i className="fas fa-map-marker-alt"></i> {talent.city}</p>}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
            <span><strong>{talent.followerCount}</strong> abonnés</span>
            <span><strong>{talent.reviewCount}</strong> avis</span>
            {talent.averageRating > 0 && (
              <span>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className="fas fa-star" style={{ color: i < Math.round(talent.averageRating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }}></i>
                ))}
                {' '}{talent.averageRating.toFixed(1)}/5
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isOwnProfile && currentUser && (
              <Link to={`/messages/${talent.id}`} style={{ padding: '0.4rem 1rem', background: '#6366f1', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem' }}>
                <i className="fas fa-envelope"></i> Envoyer un message
              </Link>
            )}
            {isOwnProfile && (
              <Link to="/mon-profil" style={{ padding: '0.4rem 1rem', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem' }}>
                Modifier mon profil
              </Link>
            )}
          </div>
        </div>
      </div>

      {talent.bio && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>À propos</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{talent.bio}</p>
        </section>
      )}

      {talent.skills.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Compétences</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {talent.skills.map(s => (
              <Link key={s.id} to={`/skills/${s.slug}`} style={{ background: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', color: '#334155', textDecoration: 'none' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {talent.reviews.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Avis ({talent.reviewCount})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {talent.reviews.map(r => (
              <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>{r.reviewer.firstname} {r.reviewer.lastname}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className="fas fa-star" style={{ color: i < r.rate ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }}></i>
                    ))}
                  </div>
                </div>
                {r.comment && <p style={{ margin: 0, color: '#374151' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
