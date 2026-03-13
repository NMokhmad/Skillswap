import './Onboarding.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'

type Skill = { id: number; label: string; icon: string }
type OnboardingData = { user: { id: number; firstname: string }; skills: Skill[] }

export default function Onboarding() {
  const navigate = useNavigate()
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery<OnboardingData>({
    queryKey: ['onboarding'],
    queryFn: () => api.get('/api/onboarding/skills'),
  })

  function toggleSkill(id: number) {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      if (bio.trim()) formData.append('bio', bio.trim())
      if (avatar) formData.append('avatar', avatar)
      selectedSkills.forEach((id) => formData.append('skills', String(id)))
      if (newSkill.trim()) formData.append('new_skill', newSkill.trim())

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) throw new Error('Erreur lors de la soumission')
      navigate('/')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="ss-ob-page">
        <div className="ss-ob-card">
          <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  const skills = data?.skills ?? []
  const filteredSkills = skillSearch.trim()
    ? skills.filter((s) => s.label.toLowerCase().includes(skillSearch.toLowerCase()))
    : skills

  return (
    <div className="ss-ob-page">
      <div className="ss-ob-card">
        <div className="ss-ob-header">
          <h1 className="ss-ob-title">
            Bienvenue{data?.user.firstname ? `, ` : ''}<em>{data?.user.firstname ?? ''}</em>
          </h1>
          <p className="ss-ob-subtitle">Complétez votre profil pour commencer à échanger des compétences.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Photo de profil ── */}
          <div className="ss-ob-section">
            <div className="ss-ob-section-header">
              <p className="ss-ob-section-title">
                <i className="fa-solid fa-camera"></i>
                Photo de profil
              </p>
              <span className="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
            </div>
            <div className="ss-ob-avatar-wrap">
              <label className="ss-ob-avatar-zone" htmlFor="avatar-input">
                {avatar ? (
                  <img
                    src={URL.createObjectURL(avatar)}
                    className="ss-ob-avatar-img"
                    style={{ display: 'block' }}
                    alt="Aperçu"
                  />
                ) : (
                  <i className="fa-solid fa-camera ss-ob-avatar-icon"></i>
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                />
              </label>
              <span className="ss-ob-avatar-hint">Cliquez pour ajouter une photo</span>
              {avatar && <span className="ss-ob-avatar-filename">{avatar.name}</span>}
            </div>
          </div>

          <hr className="ss-ob-sep" />

          {/* ── Bio ── */}
          <div className="ss-ob-section">
            <div className="ss-ob-section-header">
              <p className="ss-ob-section-title">
                <i className="fa-solid fa-pen"></i>
                À propos de vous
              </p>
              <span className="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
            </div>
            <div className="ss-ob-textarea-wrap">
              <textarea
                className="ss-ob-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez de vous, de vos passions, de ce que vous souhaitez apprendre ou enseigner…"
                rows={4}
                maxLength={500}
              />
              <span className="ss-ob-bio-count">{bio.length}/500</span>
            </div>
          </div>

          <hr className="ss-ob-sep" />

          {/* ── Compétences ── */}
          <div className="ss-ob-section">
            <div className="ss-ob-section-header">
              <p className="ss-ob-section-title">
                <i className="fa-solid fa-star"></i>
                Vos compétences
              </p>
              <span className="ss-ob-badge ss-ob-badge--required">Recommandé</span>
            </div>

            <div className="ss-ob-search-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                className="ss-ob-search"
                placeholder="Rechercher une compétence…"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>

            <div className="ss-ob-skills-grid">
              {filteredSkills.map((s) => (
                <label key={s.id} className="ss-ob-pill">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(s.id)}
                    onChange={() => toggleSkill(s.id)}
                  />
                  <i className={`fa-solid ${s.icon}`}></i>
                  {s.label}
                  <i className="fa-solid fa-check ss-ob-pill-check"></i>
                </label>
              ))}
            </div>
          </div>

          <hr className="ss-ob-sep" />

          {/* ── Nouvelle compétence ── */}
          <div className="ss-ob-section">
            <div className="ss-ob-section-header">
              <p className="ss-ob-section-title">
                <i className="fa-solid fa-plus"></i>
                Proposer une compétence
              </p>
              <span className="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
            </div>
            <div className="ss-ob-input-wrap">
              <i className="fa-solid fa-lightbulb"></i>
              <input
                type="text"
                className="ss-ob-input"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ex : Calligraphie, Permaculture…"
              />
            </div>
            <p className="ss-ob-input-hint">Cette compétence sera soumise à validation.</p>
          </div>

          {error && (
            <p style={{ color: 'rgba(220,80,80,0.85)', fontSize: '0.88rem', margin: '1rem 0 0' }}>{error}</p>
          )}

          <div className="ss-ob-actions">
            <button type="submit" className="ss-ob-btn" disabled={submitting}>
              <i className="fa-solid fa-rocket"></i>
              {submitting ? 'Enregistrement…' : 'Commencer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
