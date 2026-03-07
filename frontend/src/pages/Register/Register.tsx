import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ApiRequestError } from '../../api/client'

type FieldErrors = { firstname?: string; lastname?: string; email?: string; password?: string; confirmPassword?: string }

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <main>
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit}>
        {(['firstname', 'lastname', 'email', 'password', 'confirmPassword'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field}>{field}</label>
            <input
              id={field} name={field} type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]} required onChange={handleChange}
            />
            {errors[field] && <span className="error">{errors[field]}</span>}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Inscription…' : "S'inscrire"}
        </button>
      </form>
      <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
    </main>
  )
}
