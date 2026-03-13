import './Skills.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../api/skills'

export default function Skills() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['skills'], queryFn: skillsApi.getAll })

  const skills = data?.skills ?? []
  const filtered = search.trim()
    ? skills.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))
    : skills

  return (
    <div className="ss-sk-page">
      <header className="ss-sk-header">
        <h1 className="ss-sk-title"><em>Compétences</em></h1>
        <p className="ss-sk-subtitle">Explorez toutes les compétences disponibles</p>
        <div className="ss-sk-stats">
          <div className="ss-sk-stat-box">
            <span className="ss-sk-stat-num">{skills.length}</span>
            <span className="ss-sk-stat-label">Compétences</span>
          </div>
          {data && (
            <div className="ss-sk-stat-box">
              <span className="ss-sk-stat-num">{data.totalUsers}</span>
              <span className="ss-sk-stat-label">Talents</span>
            </div>
          )}
        </div>
      </header>

      <div className="ss-sk-body">
        <div className="ss-sk-search-wrap">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="ss-sk-search"
            placeholder="Rechercher une compétence…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
        ) : (
          <div className="ss-sk-grid">
            {filtered.map((s) => (
              <Link key={s.id} to={`/skills/${s.slug}`} className="ss-sk-card-link">
                <div className="ss-sk-card">
                  <span className="ss-sk-badge">
                    <i className="fa-solid fa-users"></i>
                    {s.userCount}
                  </span>
                  <div className="ss-sk-icon-wrap">
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  <p className="ss-sk-label">{s.label}</p>
                  <span className="ss-sk-cta">
                    <i className="fa-solid fa-arrow-right"></i> Voir les talents
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="ss-sk-bottom-cta">
          <p className="ss-sk-bottom-cta-title">Vous avez une compétence à partager ?</p>
          <p className="ss-sk-bottom-cta-text">Rejoignez notre communauté et échangez vos savoirs avec d'autres passionnés.</p>
          <Link to="/onboarding" className="ss-sk-bottom-cta-btn">
            <i className="fa-solid fa-plus"></i>
            Ajouter mes compétences
          </Link>
        </div>
      </div>
    </div>
  )
}
