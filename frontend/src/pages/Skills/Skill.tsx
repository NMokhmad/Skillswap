import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../api/skills'

export default function Skill() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['skill', slug],
    queryFn: () => skillsApi.getOne(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <main style={{ padding: '2rem' }}><p>Chargement…</p></main>
  if (isError || !data) return <main style={{ padding: '2rem' }}><p>Compétence introuvable.</p></main>

  const { skill } = data

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <i className={`fa-solid ${skill.icon}`} style={{ fontSize: '2.5rem', color: '#6366f1' }}></i>
        <div>
          <h1 style={{ margin: 0 }}>{skill.label}</h1>
          <p style={{ margin: 0, color: '#64748b' }}>{skill.users.length} talent{skill.users.length !== 1 ? 's' : ''} maîtrisent cette compétence</p>
        </div>
      </div>

      {skill.users.length === 0 ? (
        <p>Aucun talent pour cette compétence.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {skill.users.map(u => (
            <Link
              key={u.id}
              to={`/user/${u.id}/profil`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}
            >
              {u.image ? (
                <img src={`/uploads/avatars/${u.image}`} alt={u.firstname} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{u.firstname} {u.lastname}</div>
                {u.bio && <div style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{u.bio}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
