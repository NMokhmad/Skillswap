import './Login.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ApiRequestError } from '../../api/client'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { user } = await authApi.login({ email, password })
      setUser(user)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Erreur de connexion')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ss-login-page">
      <div className="ss-login-card">
        <div className="ss-login-header">
          <h1 className="ss-login-title">
            <em>Skill</em><strong>Swap</strong>
          </h1>
          <p className="ss-login-subtitle">Connectez-vous à votre compte</p>
        </div>
        <hr className="ss-login-divider" />

        {error && (
          <div className="ss-login-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ss-login-field">
            <label htmlFor="email" className="ss-login-label">Email</label>
            <div className="ss-login-input-wrap">
              <i className="fa-solid fa-envelope"></i>
              <input
                id="email"
                type="email"
                className="ss-login-input"
                placeholder="votre@email.fr"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="ss-login-field">
            <label htmlFor="password" className="ss-login-label">Mot de passe</label>
            <div className="ss-login-input-wrap">
              <i className="fa-solid fa-lock"></i>
              <input
                id="password"
                type="password"
                className="ss-login-input"
                placeholder="••••••••"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="ss-login-btn" disabled={isSubmitting}>
            <i className="fa-solid fa-right-to-bracket"></i>
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="ss-login-register-link">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
