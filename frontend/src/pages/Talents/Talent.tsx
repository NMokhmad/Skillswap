import './Talent.css'
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

  if (isLoading) {
    return (
      <main className="ss-tp-main">
        <div className="ss-tp-container">
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
        </div>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="ss-tp-main">
        <div className="ss-tp-container">
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Talent introuvable.</p>
        </div>
      </main>
    )
  }

  const { talent } = data
  const isOwnProfile = currentUser?.id === talent.id

  return (
    <main className="ss-tp-main">
      <div className="ss-tp-container">
        <div className="ss-tp-grid">

          {/* ── Colonne principale ── */}
          <div>
            {/* Header profil */}
            <div className="ss-tp-card ss-tp-header">
              <div className="ss-tp-avatar">
                {talent.image ? (
                  <img src={`/uploads/avatars/${talent.image}`} alt={talent.firstname} />
                ) : (
                  talent.firstname[0]
                )}
              </div>
              <h1 className="ss-tp-name">{talent.firstname} {talent.lastname}</h1>

              {talent.averageRating > 0 && (
                <>
                  <div className="ss-tp-stars-row">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fas fa-star${i < Math.round(talent.averageRating) ? ' filled' : ''}`}></i>
                    ))}
                  </div>
                  <span className="ss-tp-rating">
                    {talent.averageRating.toFixed(1)}/5 · {talent.reviewCount} avis
                  </span>
                </>
              )}

              <div className="ss-tp-actions">
                {!isOwnProfile && currentUser && (
                  <Link to={`/messages/${talent.id}`} className="ss-tp-btn-message">
                    <i className="fas fa-envelope"></i>
                    Envoyer un message
                  </Link>
                )}
                {isOwnProfile && (
                  <Link to="/mon-profil" className="ss-tp-btn-follow">
                    Modifier mon profil
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {talent.bio && (
              <div className="ss-tp-card">
                <h2 className="ss-tp-section-title">
                  <i className="fas fa-user"></i>À propos
                </h2>
                <hr className="ss-tp-divider" />
                <p className="ss-tp-bio">{talent.bio}</p>
              </div>
            )}

            {/* Compétences */}
            {talent.skills.length > 0 && (
              <div className="ss-tp-card">
                <h2 className="ss-tp-section-title">
                  <i className="fas fa-star"></i>Compétences
                </h2>
                <hr className="ss-tp-divider" />
                <div className="ss-tp-skills">
                  {talent.skills.map((s) => (
                    <Link key={s.id} to={`/skills/${s.slug}`} className="ss-tp-pill">{s.label}</Link>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            <div className="ss-tp-card">
              <div className="ss-tp-reviews-header">
                <h2 className="ss-tp-section-title">
                  <i className="fas fa-star"></i>Avis ({talent.reviewCount})
                </h2>
              </div>

              {talent.reviews.length === 0 ? (
                <p className="ss-tp-no-reviews">Pas encore d'avis pour ce talent.</p>
              ) : (
                talent.reviews.map((r) => (
                  <div key={r.id} className="ss-tp-review-card">
                    <div className="ss-tp-review-meta">
                      <div className="ss-tp-reviewer">
                        <div className="ss-tp-reviewer-avatar">
                          {r.reviewer.firstname[0]}
                        </div>
                        <div>
                          <span className="ss-tp-reviewer-name">
                            {r.reviewer.firstname} {r.reviewer.lastname}
                          </span>
                          <p className="ss-tp-review-date">
                            {new Date(r.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="ss-tp-review-stars-display">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fas fa-star${i < r.rate ? ' filled' : ''}`}></i>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="ss-tp-review-content">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="ss-tp-sidebar">
            <div className="ss-tp-card">
              <h3 className="ss-tp-sidebar-title">
                <i className="fas fa-chart-bar"></i>Statistiques
              </h3>
              <div className="ss-tp-stat-box">
                <span className="ss-tp-stat-label">
                  <i className="fas fa-users"></i>Abonnés
                </span>
                <span className="ss-tp-stat-value">{talent.followerCount}</span>
              </div>
              <div className="ss-tp-stat-box">
                <span className="ss-tp-stat-label">
                  <i className="fas fa-star"></i>Avis
                </span>
                <span className="ss-tp-stat-value">{talent.reviewCount}</span>
              </div>
            </div>

            {(talent.city || talent.interest) && (
              <div className="ss-tp-card">
                {talent.interest && (
                  <div className="ss-tp-contact">
                    <i className="fas fa-briefcase"></i>
                    {talent.interest}
                  </div>
                )}
                {talent.city && (
                  <div className="ss-tp-contact" style={{ marginTop: talent.interest ? '0.75rem' : 0 }}>
                    <i className="fas fa-map-marker-alt"></i>
                    {talent.city}
                  </div>
                )}
              </div>
            )}
          </aside>

        </div>
      </div>
    </main>
  )
}
