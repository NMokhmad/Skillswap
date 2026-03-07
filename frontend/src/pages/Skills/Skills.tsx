import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../api/skills'

export default function Skills() {
  const { data, isLoading } = useQuery({ queryKey: ['skills'], queryFn: skillsApi.getAll })

  const skills = data?.skills ?? []

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Toutes les compétences</h1>
      {data && <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{skills.length} compétences · {data.totalUsers} talents</p>}
      {isLoading ? (
        <p>Chargement…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {skills.map(s => (
            <Link
              key={s.id}
              to={`/skills/${s.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}
            >
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.5rem', color: '#6366f1', width: 28, textAlign: 'center' }}></i>
              <div>
                <div style={{ fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.userCount} talent{s.userCount !== 1 ? 's' : ''}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
