import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 0.5rem', color: '#6366f1' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>Page introuvable</p>
      <Link to="/" style={{ padding: '0.6rem 1.5rem', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
        Retour à l'accueil
      </Link>
    </main>
  )
}
