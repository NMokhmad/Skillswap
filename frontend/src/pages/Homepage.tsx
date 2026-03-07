import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { homepageApi } from '../api/homepage'

export default function Homepage() {
  const navigate = useNavigate()
  const [searchQ, setSearchQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: homepageApi.get,
  })

  const skills = data?.skills ?? []
  const topUsers = data?.topUsers ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`)
  }

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="ss-hero">
        <div className="ss-hero-glow ss-hero-glow--right"></div>
        <div className="ss-hero-glow ss-hero-glow--left"></div>

        <div className="ss-hero-content">
          <p className="ss-kicker">
            <span className="ss-kicker-line"></span>
            Échangez &bull; Apprenez &bull; Grandissez
            <span className="ss-kicker-line"></span>
          </p>

          <h1 className="ss-hero-title">
            Bienvenue sur<br /><em>SkillSwap</em>
          </h1>

          <p className="ss-hero-sub">Votre aventure d'apprentissage commence ici.</p>

          <div className="ss-hero-actions">
            <Link to="/skills" className="ss-btn ss-btn--primary">Explorer les compétences</Link>
            <Link to="/talents" className="ss-btn ss-btn--ghost">
              <i className="fa-solid fa-users"></i>
              Découvrir les talents
            </Link>
          </div>

          {/* Hero search */}
          <form className="ss-hero-search" onSubmit={handleSearch}>
            <div className="ss-hero-search-wrap">
              <input
                type="text"
                className="ss-hero-search-input"
                placeholder="Rechercher un talent par nom..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="ss-hero-search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Rechercher</span>
              </button>
            </div>
          </form>

          {/* Carrousel compétences */}
          {skills.length > 0 && (
            <div className="ss-skills-carousel">
              <p className="ss-carousel-label">Compétences populaires</p>
              <div className="ss-slider">
                <div className="ss-track">
                  {[...skills, ...skills].map((skill, index) => (
                    <Link
                      key={`${skill.id}-${index}`}
                      to={`/skills/${skill.slug}`}
                      className={`ss-skill-chip ss-skill-chip--${index % 6}`}
                      title={skill.label}
                    >
                      <i className={`fa-solid ${skill.icon}`}></i>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ À PROPOS ══ */}
      <section className="ss-about" id="about">
        <div className="ss-about-grid">
          <div className="ss-about-text">
            <span className="ss-tag">
              <i className="fa-solid fa-info-circle"></i>
              À propos
            </span>
            <h2 className="ss-section-title">Qui sommes-nous&nbsp;?</h2>
            <div className="ss-about-body">
              <p><strong>Skill Swap</strong> est une plateforme innovante conçue pour permettre l'échange de compétences et de connaissances au sein d'une communauté. Elle repose sur l'idée que chacun possède quelque chose d'unique à offrir.</p>
              <p>Skill Swap vise à encourager l'apprentissage mutuel, la collaboration et l'établissement de relations dans un environnement convivial et enrichissant.</p>
            </div>
            <div className="ss-stats">
              <div className="ss-stat"><span className="ss-stat-num">500+</span><span className="ss-stat-label">Membres</span></div>
              <div className="ss-stat"><span className="ss-stat-num">1200+</span><span className="ss-stat-label">Échanges</span></div>
              <div className="ss-stat"><span className="ss-stat-num">{skills.length}</span><span className="ss-stat-label">Compétences</span></div>
            </div>
          </div>
          <div className="ss-about-visual">
            <img src="/img/shutterstock_1521006890.png" alt="À propos de SkillSwap" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ══ TOP PROFILS ══ */}
      <section className="ss-profiles" id="profiles">
        <div className="ss-container">
          <div className="ss-section-header">
            <span className="ss-tag ss-tag--amber">
              <i className="fa-solid fa-trophy"></i>
              Talents d'exception
            </span>
            <h2 className="ss-section-title ss-section-title--light">Nos Meilleurs Profils</h2>
            <p className="ss-section-sub">Découvrez les talents les mieux notés de notre communauté</p>
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center' }}>Chargement…</p>
          ) : (
            <div className="ss-profiles-grid">
              {topUsers.map((user, index) => (
                <article key={user.id} className="ss-profile-card">
                  {index < 3 && (
                    <div className="ss-rank-badge">
                      <i className="fa-solid fa-crown"></i>
                      Top {index + 1}
                    </div>
                  )}
                  <div className="ss-card-img">
                    <img
                      src={user.image ? `/uploads/avatars/${user.image}` : '/img/default-avatar.png'}
                      alt={`Profil ${user.firstname}`}
                      loading="lazy"
                    />
                    <div className="ss-card-overlay"></div>
                  </div>
                  <div className="ss-card-body">
                    <div className={`ss-card-avatar ss-avatar--${index % 3}`}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="ss-card-info">
                      <h3>
                        <Link to={`/talents/${user.id}`} className="ss-card-name">
                          {user.firstname} {user.lastname}
                        </Link>
                      </h3>
                      {user.interest && (
                        <p className="ss-card-interest">
                          <i className="fa-solid fa-briefcase"></i>
                          {user.interest}
                        </p>
                      )}
                      <div className="ss-rating">
                        {user.avg_reviews > 0 ? (
                          <>
                            <div className="ss-stars">
                              {Array.from({ length: 5 }, (_, i) => (
                                <i key={i} className={`fas fa-star ${i < user.avg_reviews ? 'ss-star--on' : 'ss-star--off'}`}></i>
                              ))}
                            </div>
                            <span className="ss-rating-score">{Number(user.avg_reviews).toFixed(1)}/5</span>
                          </>
                        ) : (
                          <span className="ss-no-rating">Pas encore de note</span>
                        )}
                      </div>
                      <Link to={`/talents/${user.id}`} className="ss-btn ss-btn--card">
                        Voir le profil
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="ss-see-all">
            <Link to="/talents" className="ss-btn ss-btn--outline-light">
              <i className="fa-solid fa-users"></i>
              Voir tous les talents
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
