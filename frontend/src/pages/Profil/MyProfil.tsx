import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { profilApi } from '../../api/profil'
import { useAuthStore } from '../../stores/authStore'

export default function MyProfil() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-profil'],
    queryFn: profilApi.getMyProfil,
  })

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (data?.user) {
      const u = data.user
      setForm({ firstname: u.firstname, lastname: u.lastname, email: u.email, bio: u.bio ?? '' })
    }
  }, [data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    const fd = new FormData()
    fd.append('firstname', form.firstname)
    fd.append('lastname', form.lastname)
    fd.append('email', form.email)
    fd.append('bio', form.bio)
    if (avatarFile) fd.append('avatar', avatarFile)

    try {
      const result = await profilApi.updateMyProfil(fd)
      if (result.status >= 400) {
        setError(result.message || 'Erreur lors de la mise à jour')
      } else {
        setUser(result.user)
        queryClient.invalidateQueries({ queryKey: ['my-profil'] })
        setSuccess(true)
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return
    try {
      await profilApi.deleteMyProfil()
      setUser(null)
      navigate('/')
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>

  const user = data?.user

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Mon profil</h1>

      {user?.image && (
        <img src={`/uploads/avatars/${user.image}`} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {success && <p style={{ color: '#22c55e' }}>Profil mis à jour avec succès !</p>}

        <div>
          <label htmlFor="firstname">Prénom</label>
          <input id="firstname" value={form.firstname} onChange={e => setForm(p => ({ ...p, firstname: e.target.value }))} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="lastname">Nom</label>
          <input id="lastname" value={form.lastname} onChange={e => setForm(p => ({ ...p, lastname: e.target.value }))} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={4} style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="avatar">Avatar</label>
          <input id="avatar" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] ?? null)} style={{ display: 'block', marginTop: '0.25rem' }} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <div>
        <h2 style={{ fontSize: '1rem', color: '#ef4444' }}>Zone dangereuse</h2>
        <button onClick={handleDelete} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
          Supprimer mon compte
        </button>
      </div>
    </main>
  )
}
