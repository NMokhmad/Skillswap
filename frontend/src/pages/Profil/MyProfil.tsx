import './MyProfil.css'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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
    try {
      await profilApi.deleteMyProfil()
      setUser(null)
      navigate('/')
    } catch {
      setError('Erreur lors de la suppression')
      setShowDeleteModal(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <header className="ss-profil-header">
          <i className="fa-solid fa-user-circle ss-profil-header-icon"></i>
          <h1 className="ss-profil-title">Mon profil</h1>
        </header>
        <main className="ss-profil-main">
          <div className="ss-profil-center">
            <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
          </div>
        </main>
      </>
    )
  }

  const user = data?.user

  return (
    <>
      <header className="ss-profil-header">
        <i className="fa-solid fa-user-circle ss-profil-header-icon"></i>
        <h1 className="ss-profil-title">Mon profil</h1>
        <p className="ss-profil-subtitle">Gérez vos informations personnelles</p>
      </header>

      <main className="ss-profil-main">
        <div className="ss-profil-center">

          {/* ── Carte infos actuelles ── */}
          <div className="ss-profil-card">
            <div className="ss-profil-avatar-section">
              <div className="ss-profil-avatar-wrap">
                {user?.image ? (
                  <img src={`/uploads/avatars/${user.image}`} alt="Avatar" className="ss-profil-avatar-img" />
                ) : (
                  <i className="fa-solid fa-user ss-profil-avatar-default"></i>
                )}
              </div>
              <span className="ss-profil-badge">
                <i className="fa-solid fa-star"></i>
                Membre SkillSwap
              </span>
            </div>

            <div className="ss-profil-info-list">
              <div className="ss-profil-info-row">
                <i className="fa-solid fa-user ss-profil-info-icon"></i>
                <div className="ss-profil-info-body">
                  <span className="ss-profil-info-label">Nom complet</span>
                  <span className="ss-profil-info-value">{user?.firstname} {user?.lastname}</span>
                </div>
              </div>
              <div className="ss-profil-info-row">
                <i className="fa-solid fa-envelope ss-profil-info-icon"></i>
                <div className="ss-profil-info-body">
                  <span className="ss-profil-info-label">Email</span>
                  <span className="ss-profil-info-value">{user?.email}</span>
                </div>
              </div>
              {user?.bio && (
                <div className="ss-profil-info-row">
                  <i className="fa-solid fa-pen ss-profil-info-icon"></i>
                  <div className="ss-profil-info-body">
                    <span className="ss-profil-info-label">Bio</span>
                    <span className="ss-profil-info-value">{user.bio}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Formulaire d'édition ── */}
          <div className="ss-profil-edit-card">
            <div className="ss-profil-edit-header">
              <i className="fa-solid fa-pen-to-square ss-profil-edit-header-icon"></i>
              <h2 className="ss-profil-edit-title">Modifier mes informations</h2>
              <p className="ss-profil-edit-subtitle">Les modifications sont appliquées immédiatement</p>
            </div>

            {success && (
              <div className="ss-profil-info-msg">
                <i className="fa-solid fa-circle-check"></i>
                Profil mis à jour avec succès !
              </div>
            )}
            {error && (
              <div className="ss-profil-info-msg" style={{ borderColor: 'rgba(220,80,80,0.35)', color: 'rgba(220,80,80,0.85)' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="ss-profil-field">
                <label className="ss-profil-field-label">
                  <i className="fa-solid fa-camera"></i>Photo de profil
                </label>
                <div className="ss-profil-avatar-edit-wrap">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} className="ss-profil-avatar-edit-img" alt="Aperçu" />
                  ) : user?.image ? (
                    <img src={`/uploads/avatars/${user.image}`} className="ss-profil-avatar-edit-img" alt="Avatar actuel" />
                  ) : (
                    <div className="ss-profil-avatar-edit-default">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                </div>
                <label className="ss-profil-upload-wrap">
                  <span className="ss-profil-upload-cta">
                    <i className="fa-solid fa-upload"></i>Choisir une image
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
                  </span>
                  <span className="ss-profil-upload-filename">
                    {avatarFile ? avatarFile.name : 'Aucun fichier sélectionné'}
                  </span>
                </label>
              </div>

              <div className="ss-profil-field">
                <label htmlFor="firstname" className="ss-profil-field-label">
                  <i className="fa-solid fa-user"></i>Prénom
                </label>
                <input
                  id="firstname" className="ss-profil-input" value={form.firstname} required
                  onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                />
              </div>

              <div className="ss-profil-field">
                <label htmlFor="lastname" className="ss-profil-field-label">
                  <i className="fa-solid fa-user"></i>Nom
                </label>
                <input
                  id="lastname" className="ss-profil-input" value={form.lastname} required
                  onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                />
              </div>

              <div className="ss-profil-field">
                <label htmlFor="email" className="ss-profil-field-label">
                  <i className="fa-solid fa-envelope"></i>Email
                </label>
                <input
                  id="email" type="email" className="ss-profil-input" value={form.email} required
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="ss-profil-field">
                <label htmlFor="bio" className="ss-profil-field-label">
                  <i className="fa-solid fa-pen"></i>Bio
                </label>
                <textarea
                  id="bio" className="ss-profil-textarea" value={form.bio} rows={4}
                  placeholder="Parlez de vous…"
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                />
                <p className="ss-profil-bio-help">{form.bio.length} caractères</p>
              </div>

              <div className="ss-profil-form-actions">
                <button type="submit" className="ss-profil-btn-primary" disabled={isSubmitting}>
                  <i className="fa-solid fa-floppy-disk"></i>
                  {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  className="ss-profil-btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fa-solid fa-trash"></i>
                  Supprimer mon compte
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ── Modal de confirmation suppression ── */}
      <div className={`ss-profil-modal${showDeleteModal ? ' ss-profil-modal--active' : ''}`}>
        <div className="ss-profil-modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
        <div className="ss-profil-modal-box">
          <button className="ss-profil-modal-close" onClick={() => setShowDeleteModal(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <i className="fa-solid fa-triangle-exclamation ss-profil-modal-warning-icon"></i>
          <h2 className="ss-profil-modal-title">Supprimer mon compte</h2>
          <p className="ss-profil-modal-subtitle">Cette action est irréversible.</p>
          <div className="ss-profil-warning-box">
            <i className="fa-solid fa-circle-exclamation"></i>
            Toutes vos données seront définitivement supprimées.
          </div>
          <div className="ss-profil-modal-actions">
            <button className="ss-profil-btn-outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </button>
            <button className="ss-profil-btn-delete-confirm" onClick={handleDelete}>
              <i className="fa-solid fa-trash"></i>
              Confirmer la suppression
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
