import './Talents.css'
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
    <div className="ss-tal-page">
      <header className="ss-tal-header">
        <h1 className="ss-tal-title"><em>Talents</em></h1>
        <p className="ss-tal-subtitle">Découvrez les membres de notre communauté</p>
        {data && (
          <div className="ss-tal-stats">
            <div className="ss-tal-stat-box">
              <span className="ss-tal-stat-num">{data.total}</span>
              <span className="ss-tal-stat-label">Talents</span>
            </div>
            <div className="ss-tal-stat-box">
              <span className="ss-tal-stat-num">{totalPages}</span>
              <span className="ss-tal-stat-label">Pages</span>
            </div>
          </div>
        )}
      </header>

      <div className="ss-tal-body">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
        ) : (
          <>
            <div className="ss-tal-grid">
              {results.map((u) => (
                <article key={u.id} className="ss-tal-card">
                  <div className="ss-tal-avatar">
                    {u.image ? (
                      <img src={`/uploads/avatars/${u.image}`} alt={u.firstname} />
                    ) : (
                      u.firstname[0]
                    )}
                  </div>

                  <Link to={`/user/${u.id}/profil`} className="ss-tal-name">
                    {u.firstname} {u.lastname}
                  </Link>

                  <div className="ss-tal-stars">
                    <div className="ss-tal-stars-row">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={`fas fa-star${i < Math.round(u.averageRating) ? ' filled' : ''}`}></i>
                      ))}
                    </div>
                    <span className="ss-tal-rating">
                      {u.averageRating > 0 ? `${u.averageRating.toFixed(1)}/5` : 'Pas encore de note'} ({u.reviewCount})
                    </span>
                  </div>

                  {u.skills.length > 0 && (
                    <div className="ss-tal-skills">
                      {u.skills.slice(0, 3).map((s) => (
                        <Link key={s.id} to={`/skills/${s.slug}`} className="ss-tal-pill">{s.label}</Link>
                      ))}
                    </div>
                  )}

                  <div className="ss-tal-actions">
                    <Link to={`/user/${u.id}/profil`} className="ss-tal-message">
                      <i className="fas fa-eye"></i>
                      Voir le profil
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="ss-tal-pagination">
                <button
                  className="ss-tal-page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`ss-tal-page-link${p === page ? ' is-current' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="ss-tal-page-link"
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
    </div>
  )
}
