import './ProfilPublic.css'
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
    <div className="ss-pp-page">

      {/* ── Header ── */}
      <header className="ss-pp-header">
        <div className="ss-pp-header-inner">

          {/* Avatar */}
          <div className="ss-pp-avatar">
            {user.image ? (
              <img src={`/uploads/avatars/${user.image}`} alt={user.firstname} />
            ) : (
              <i className="fas fa-user ss-pp-avatar-placeholder"></i>
            )}
          </div>

          {/* Nom */}
          <h1 className="ss-pp-name">{user.firstname} {user.lastname}</h1>

          {/* Ville + intérêt */}
          {(user.interest || user.city) && (
            <div className="ss-pp-meta">
              {user.interest && (
                <span className="ss-pp-meta-item">
                  <i className="fas fa-briefcase"></i>
                  {user.interest}
                </span>
              )}
              {user.city && (
                <span className="ss-pp-meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  {user.city}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="ss-pp-stats">
            <div className="ss-pp-stat-box">
              <span className="ss-pp-stat-num">{user.followerCount}</span>
              <span className="ss-pp-stat-label">Abonnés</span>
            </div>
            <div className="ss-pp-stat-box">
              <span className="ss-pp-stat-num">{user.reviewCount}</span>
              <span className="ss-pp-stat-label">Avis</span>
            </div>
            {user.averageRating > 0 && (
              <div className="ss-pp-stat-box">
                <span className="ss-pp-stat-num">{user.averageRating.toFixed(1)}</span>
                <span className="ss-pp-stat-label">
                  <span className="ss-pp-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fas fa-star${i < Math.round(user.averageRating) ? ' filled' : ''}`}></i>
                    ))}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Bouton message */}
          <Link to={`/messages/${user.id}`} className="ss-pp-btn">
            <i className="fas fa-envelope"></i>
            Envoyer un message
          </Link>

        </div>
      </header>

      {/* ── Body ── */}
      <div className="ss-pp-body">

        {/* Bio */}
        {user.bio && (
          <section className="ss-pp-section">
            <h2 className="ss-pp-section-title">À propos</h2>
            <p className="ss-pp-bio-text">{user.bio}</p>
          </section>
        )}

        {/* Compétences */}
        {user.skills.length > 0 && (
          <section className="ss-pp-section">
            <h2 className="ss-pp-section-title">Compétences</h2>
            <div className="ss-pp-pills">
              {user.skills.map(s => (
                <Link key={s.id} to={`/skills/${s.slug}`} className="ss-pp-pill">
                  {s.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Avis */}
        {user.reviews.length > 0 && (
          <section className="ss-pp-section">
            <h2 className="ss-pp-section-title">Avis ({user.reviewCount})</h2>
            <div className="ss-pp-reviews-list">
              {user.reviews.map(r => (
                <div key={r.id} className="ss-pp-review-card">
                  <div className="ss-pp-review-header">
                    <span className="ss-pp-reviewer-name">
                      {r.reviewer.firstname} {r.reviewer.lastname}
                    </span>
                    <span className="ss-pp-review-date">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="ss-pp-review-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={`fas fa-star${i < r.rate ? ' filled' : ''}`}></i>
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="ss-pp-review-text">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
