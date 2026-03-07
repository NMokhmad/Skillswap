import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchApi, type SearchFilters } from '../../api/search'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    sort: (searchParams.get('sort') as SearchFilters['sort']) || 'rating_desc',
    min_rating: Number(searchParams.get('min_rating')) || 0,
    page: Number(searchParams.get('page')) || 1,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: () => searchApi.talents(filters),
  })

  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.q) params.q = filters.q
    if (filters.city) params.city = filters.city
    if (filters.sort && filters.sort !== 'rating_desc') params.sort = filters.sort
    if (filters.min_rating) params.min_rating = String(filters.min_rating)
    if (filters.page && filters.page > 1) params.page = String(filters.page)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  function handleChange(field: keyof SearchFilters, value: string | number) {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }))
  }

  const results = data?.results ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Recherche de talents</h1>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Nom du talent…"
          value={filters.q}
          onChange={e => handleChange('q', e.target.value)}
          style={{ padding: '0.5rem', minWidth: '200px' }}
        />
        <input
          type="text"
          placeholder="Ville…"
          value={filters.city}
          onChange={e => handleChange('city', e.target.value)}
          style={{ padding: '0.5rem', minWidth: '160px' }}
        />
        <select
          value={filters.sort}
          onChange={e => handleChange('sort', e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="rating_desc">Mieux notés</option>
          <option value="rating_asc">Moins bien notés</option>
          <option value="newest">Plus récents</option>
          <option value="popular">Populaires</option>
        </select>
        <select
          value={filters.min_rating ?? 0}
          onChange={e => handleChange('min_rating', Number(e.target.value))}
          style={{ padding: '0.5rem' }}
        >
          <option value={0}>Toutes les notes</option>
          <option value={1}>≥ 1 étoile</option>
          <option value={2}>≥ 2 étoiles</option>
          <option value={3}>≥ 3 étoiles</option>
          <option value={4}>≥ 4 étoiles</option>
        </select>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <p>Chargement…</p>
      ) : (
        <>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            {total} résultat{total !== 1 ? 's' : ''}
          </p>

          {results.length === 0 ? (
            <p>Aucun talent trouvé.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {results.map(user => (
                <article key={user.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {user.image ? (
                      <img
                        src={`/uploads/avatars/${user.image}`}
                        alt={user.firstname}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-user" style={{ color: '#94a3b8' }}></i>
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        <Link to={`/talents/${user.id}`}>{user.firstname} {user.lastname}</Link>
                      </h3>
                      {user.city && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}><i className="fas fa-map-marker-alt"></i> {user.city}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fas fa-star`} style={{ color: i < Math.round(user.averageRating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.8rem' }}></i>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.25rem' }}>
                      {user.averageRating > 0 ? `${user.averageRating.toFixed(1)}/5` : 'Pas de note'} ({user.reviewCount})
                    </span>
                  </div>

                  {user.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      {user.skills.slice(0, 4).map(s => (
                        <span key={s.id} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s.label}</span>
                      ))}
                    </div>
                  )}

                  <Link to={`/talents/${user.id}`} style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 500 }}>
                    Voir le profil →
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => setFilters(p => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
                disabled={filters.page === 1}
              >
                ← Précédent
              </button>
              <span style={{ padding: '0.5rem 1rem' }}>
                Page {filters.page} / {totalPages}
              </span>
              <button
                onClick={() => setFilters(p => ({ ...p, page: Math.min(totalPages, (p.page ?? 1) + 1) }))}
                disabled={filters.page === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
