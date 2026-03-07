import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profilApi } from '../../api/profil'

export default function ProfilPublic() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profil', id],
    queryFn: () => profilApi.getProfil(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>
  if (isError || !data) return <main style={{ padding: '2rem' }}><p>Utilisateur introuvable.</p></main>

  const { user } = data

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header profil */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        {user.image ? (
          <img src={`/uploads/avatars/${user.image}`} alt={user.firstname} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-user" style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
          </div>
        )}
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>{user.firstname} {user.lastname}</h1>
          {user.interest && <p style={{ margin: '0 0 0.25rem', color: '#64748b' }}><i className="fas fa-briefcase"></i> {user.interest}</p>}
          {user.city && <p style={{ margin: 0, color: '#64748b' }}><i className="fas fa-map-marker-alt"></i> {user.city}</p>}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span><strong>{user.followerCount}</strong> abonnés</span>
            <span><strong>{user.reviewCount}</strong> avis</span>
            {user.averageRating > 0 && (
              <span>
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className="fas fa-star" style={{ color: i < Math.round(user.averageRating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }}></i>
                ))}
                {' '}{user.averageRating.toFixed(1)}/5
              </span>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
            <Link to={`/messages/${user.id}`} className="ss-btn ss-btn--primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              <i className="fas fa-envelope"></i> Envoyer un message
            </Link>
          </div>
        </div>
      </div>

      {user.bio && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>À propos</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{user.bio}</p>
        </section>
      )}

      {user.skills.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Compétences</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {user.skills.map(s => (
              <Link key={s.id} to={`/skills/${s.slug}`} style={{ background: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', color: '#334155', textDecoration: 'none' }}>
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {user.reviews.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Avis ({user.reviewCount})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {user.reviews.map(r => (
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
