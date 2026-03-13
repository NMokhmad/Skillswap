import './Skill.css'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../api/skills'

export default function Skill() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['skill', slug],
    queryFn: () => skillsApi.getOne(slug!),
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="ss-sp-page">
        <main className="ss-sp-main">
          <div className="ss-sp-container">
            <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
          </div>
        </main>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="ss-sp-page">
        <main className="ss-sp-main">
          <div className="ss-sp-container">
            <div className="ss-sp-empty">
              <i className="fa-solid fa-triangle-exclamation ss-sp-empty-icon"></i>
              <p className="ss-sp-empty-title">Compétence introuvable</p>
              <p className="ss-sp-empty-text">Cette compétence n'existe pas ou a été supprimée.</p>
            </div>
            <div className="ss-sp-back-wrap">
              <Link to="/skills" className="ss-sp-back-btn">
                <i className="fa-solid fa-arrow-left"></i>
                Toutes les compétences
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const { skill } = data

  return (
    <div className="ss-sp-page">
      <main className="ss-sp-main">
        <div className="ss-sp-container">
          <div className="ss-sp-header">
            <div className="ss-sp-icon-wrap">
              <i className={`fa-solid ${skill.icon}`}></i>
            </div>
            <h1 className="ss-sp-title">{skill.label}</h1>
            <div className="ss-sp-counter">
              <i className="fa-solid fa-users"></i>
              {skill.users.length} talent{skill.users.length !== 1 ? 's' : ''} maîtris{skill.users.length !== 1 ? 'ent' : 'e'} cette compétence
            </div>
          </div>

          {skill.users.length === 0 ? (
            <div className="ss-sp-empty">
              <i className="fa-solid fa-user-slash ss-sp-empty-icon"></i>
              <p className="ss-sp-empty-title">Aucun talent pour l'instant</p>
              <p className="ss-sp-empty-text">Soyez le premier à proposer cette compétence.</p>
            </div>
          ) : (
            <>
              <h2 className="ss-sp-section-title">
                <i className="fa-solid fa-users"></i>
                Talents disponibles
              </h2>
              <div className="ss-sp-grid">
                {skill.users.map((u) => (
                  <Link key={u.id} to={`/user/${u.id}/profil`} className="ss-sp-card-link">
                    <div className="ss-sp-card">
                      <div className="ss-sp-card-avatar">
                        {u.image ? (
                          <img
                            src={`/uploads/avatars/${u.image}`}
                            alt={u.firstname}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <p className="ss-sp-card-name">{u.firstname} {u.lastname}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="ss-sp-back-wrap">
            <Link to="/skills" className="ss-sp-back-btn">
              <i className="fa-solid fa-arrow-left"></i>
              Toutes les compétences
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
