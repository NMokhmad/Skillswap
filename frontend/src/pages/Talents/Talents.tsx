import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { talentsApi } from '../../api/talents'

export default function Talents() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['talents', page],
    queryFn: () => talentsApi.getAll(page),
  })

  const results = data?.results ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Talents</h1>
      {data && <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{data.total} talents</p>}
      {isLoading ? (
        <p>Chargement…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {results.map((u) => (
              <article key={u.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {u.image ? (
                    <img src={`/uploads/avatars/${u.image}`} alt={u.firstname} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-user" style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>
                      <Link to={`/user/${u.id}/profil`} style={{ color: 'inherit', textDecoration: 'none' }}>{u.firstname} {u.lastname}</Link>
                    </h3>
                    {u.city && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}><i className="fas fa-map-marker-alt"></i> {u.city}</p>}
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className="fas fa-star" style={{ color: i < Math.round(u.averageRating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }}></i>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.25rem' }}>
                      {u.averageRating > 0 ? `${u.averageRating.toFixed(1)}/5` : 'Pas de note'} ({u.reviewCount})
                    </span>
                  </div>
                  {u.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {u.skills.slice(0, 3).map(s => (
                        <span key={s.id} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s.label}</span>
                      ))}
                    </div>
                  )}
                  <Link to={`/user/${u.id}/profil`} style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 500 }}>
                    Voir le profil →
                  </Link>
                </div>
              </article>
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
