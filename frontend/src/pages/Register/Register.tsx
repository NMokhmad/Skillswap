import './Register.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ApiRequestError } from '../../api/client'

type FieldErrors = { firstname?: string; lastname?: string; email?: string; password?: string; confirmPassword?: string }

function getPasswordStrength(pwd: string): number {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordStrength = getPasswordStrength(form.password)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const { user } = await authApi.register(form)
      setUser(user)
      navigate('/onboarding')
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'VALIDATION_ERROR') {
        setErrors((err as any).errors || {})
      } else if (err instanceof ApiRequestError) {
        setErrors({ email: err.message })
      } else {
        setErrors({ email: "Erreur lors de l'inscription" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ss-reg-page">
      <div className="ss-reg-card">
        <div className="ss-reg-header">
          <h1 className="ss-reg-title">
            <em>Skill</em><strong>Swap</strong>
          </h1>
          <p className="ss-reg-subtitle">Créez votre compte gratuitement</p>
        </div>
        <hr className="ss-reg-divider" />

        <form onSubmit={handleSubmit}>
          <div className="ss-reg-row">
            <div className={`ss-reg-field${errors.firstname ? ' has-error' : ''}`}>
              <label htmlFor="firstname" className="ss-reg-label">Prénom</label>
              <div className="ss-reg-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  id="firstname" name="firstname" type="text"
                  className="ss-reg-input" placeholder="Prénom"
                  value={form.firstname} required onChange={handleChange}
                />
              </div>
              {errors.firstname && (
                <p className="ss-reg-error-msg">
                  <i className="fa-solid fa-circle-exclamation"></i>{errors.firstname}
                </p>
              )}
            </div>

            <div className={`ss-reg-field${errors.lastname ? ' has-error' : ''}`}>
              <label htmlFor="lastname" className="ss-reg-label">Nom</label>
              <div className="ss-reg-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  id="lastname" name="lastname" type="text"
                  className="ss-reg-input" placeholder="Nom"
                  value={form.lastname} required onChange={handleChange}
                />
              </div>
              {errors.lastname && (
                <p className="ss-reg-error-msg">
                  <i className="fa-solid fa-circle-exclamation"></i>{errors.lastname}
                </p>
              )}
            </div>
          </div>

          <div className={`ss-reg-field${errors.email ? ' has-error' : ''}`}>
            <label htmlFor="email" className="ss-reg-label">Email</label>
            <div className="ss-reg-input-wrap">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="email" name="email" type="email"
                className="ss-reg-input" placeholder="votre@email.fr"
                value={form.email} required onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="ss-reg-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>{errors.email}
              </p>
            )}
          </div>

          <div className={`ss-reg-field${errors.password ? ' has-error' : ''}`}>
            <label htmlFor="password" className="ss-reg-label">Mot de passe</label>
            <div className="ss-reg-input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                id="password" name="password" type="password"
                className="ss-reg-input" placeholder="••••••••"
                value={form.password} required onChange={handleChange}
              />
            </div>
            {form.password && (
              <div className="ss-strength-wrap">
                <div className="ss-strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`ss-strength-seg${passwordStrength >= i ? ` active-${i}` : ''}`} />
                  ))}
                </div>
                <ul className="ss-criteria-list">
                  <li className={`ss-criteria-item${form.password.length >= 8 ? ' valid' : ''}`}>
                    <i className={`fa-solid fa-${form.password.length >= 8 ? 'check' : 'xmark'}`}></i>8 caractères
                  </li>
                  <li className={`ss-criteria-item${/[A-Z]/.test(form.password) ? ' valid' : ''}`}>
                    <i className={`fa-solid fa-${/[A-Z]/.test(form.password) ? 'check' : 'xmark'}`}></i>Majuscule
                  </li>
                  <li className={`ss-criteria-item${/[0-9]/.test(form.password) ? ' valid' : ''}`}>
                    <i className={`fa-solid fa-${/[0-9]/.test(form.password) ? 'check' : 'xmark'}`}></i>Chiffre
                  </li>
                  <li className={`ss-criteria-item${/[^A-Za-z0-9]/.test(form.password) ? ' valid' : ''}`}>
                    <i className={`fa-solid fa-${/[^A-Za-z0-9]/.test(form.password) ? 'check' : 'xmark'}`}></i>Spécial
                  </li>
                </ul>
              </div>
            )}
            {errors.password && (
              <p className="ss-reg-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>{errors.password}
              </p>
            )}
          </div>

          <div className={`ss-reg-field${errors.confirmPassword ? ' has-error' : ''}`}>
            <label htmlFor="confirmPassword" className="ss-reg-label">Confirmer le mot de passe</label>
            <div className="ss-reg-input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className="ss-reg-input" placeholder="••••••••"
                value={form.confirmPassword} required onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && (
              <p className="ss-reg-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>{errors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" className="ss-reg-btn" disabled={isSubmitting}>
            <i className="fa-solid fa-user-plus"></i>
            {isSubmitting ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>

        <p className="ss-reg-login-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
