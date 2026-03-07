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
  const [newSkill, setNewSkill] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery<OnboardingData>({
    queryKey: ['onboarding'],
    queryFn: () => api.get('/api/onboarding/skills'),
  })

  function toggleSkill(id: number) {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
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
      selectedSkills.forEach(id => formData.append('skills', String(id)))
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

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>

  const skills = data?.skills ?? []

  return (
    <main style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Bienvenue{data?.user.firstname ? `, ${data.user.firstname}` : ''} !</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Complétez votre profil pour commencer à échanger des compétences.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Avatar */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Photo de profil</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setAvatar(e.target.files?.[0] ?? null)}
            style={{ fontSize: '0.9rem' }}
          />
          {avatar && (
            <img
              src={URL.createObjectURL(avatar)}
              alt="Aperçu"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: '0.75rem', display: 'block' }}
            />
          )}
        </div>

        {/* Bio */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>À propos de vous</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Parlez de vous, de vos passions, de ce que vous souhaitez apprendre ou enseigner…"
            rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Compétences */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem' }}>Vos compétences</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {skills.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSkill(s.id)}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: '1px solid',
                  borderColor: selectedSkills.includes(s.id) ? '#6366f1' : '#e2e8f0',
                  borderRadius: '9999px',
                  background: selectedSkills.includes(s.id) ? '#6366f1' : 'white',
                  color: selectedSkills.includes(s.id) ? 'white' : '#334155',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <i className={`fa-solid ${s.icon}`}></i>
                {s.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Proposer une nouvelle compétence…"
            style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        {error && <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {submitting ? 'Enregistrement…' : 'Commencer →'}
        </button>
      </form>
    </main>
  )
}
