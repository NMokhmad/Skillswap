import './Search.css'
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
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }))
  }

  const results = data?.results ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <>
      <header className="ss-sr-header">
        <h1 className="ss-sr-title"><em>Recherche</em> de talents</h1>
        <p className="ss-sr-subtitle">Trouvez le talent qui correspond à vos besoins</p>
      </header>

      <main className="ss-sr-main">
        <div className="ss-sr-container">

          {/* ── Filtres ── */}
          <div className="ss-sr-filters">
            <div className="ss-sr-filter-group">
              <label className="ss-sr-filter-label">Nom du talent</label>
              <div className="ss-sr-input-wrap">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  className="ss-sr-input"
                  placeholder="Rechercher un talent…"
                  value={filters.q}
                  onChange={(e) => handleChange('q', e.target.value)}
                />
              </div>
            </div>

            <div className="ss-sr-filter-group">
              <label className="ss-sr-filter-label">Ville</label>
              <div className="ss-sr-input-wrap">
                <i className="fa-solid fa-map-marker-alt"></i>
                <input
                  type="text"
                  className="ss-sr-input"
                  placeholder="Paris, Lyon…"
                  value={filters.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
            </div>

            <div className="ss-sr-filter-group">
              <label className="ss-sr-filter-label">Trier par</label>
              <select
                className="ss-sr-select"
                value={filters.sort}
                onChange={(e) => handleChange('sort', e.target.value)}
              >
                <option value="rating_desc">Mieux notés</option>
                <option value="rating_asc">Moins bien notés</option>
                <option value="newest">Plus récents</option>
                <option value="popular">Populaires</option>
              </select>
            </div>

            <div className="ss-sr-filter-group">
              <label className="ss-sr-filter-label">Note minimale</label>
              <select
                className="ss-sr-select"
                value={filters.min_rating ?? 0}
                onChange={(e) => handleChange('min_rating', Number(e.target.value))}
              >
                <option value={0}>Toutes les notes</option>
                <option value={1}>≥ 1 étoile</option>
                <option value={2}>≥ 2 étoiles</option>
                <option value={3}>≥ 3 étoiles</option>
                <option value={4}>≥ 4 étoiles</option>
              </select>
            </div>
          </div>

          {/* ── Résultats ── */}
          {isLoading ? (
            <p style={{ textAlign: 'center', color: 'rgba(247,242,232,0.6)' }}>Chargement…</p>
          ) : (
            <>
              <div className="ss-sr-results-header">
                <p className="ss-sr-results-count">
                  <strong>{total}</strong> résultat{total !== 1 ? 's' : ''}
                </p>
                <div className="ss-sr-results-sep"></div>
              </div>

              {results.length === 0 ? (
                <div className="ss-sr-empty">
                  <i className="fa-solid fa-user-slash ss-sr-empty-icon"></i>
                  <p className="ss-sr-empty-title">Aucun talent trouvé</p>
                  <p className="ss-sr-empty-text">Essayez de modifier vos filtres de recherche.</p>
                </div>
              ) : (
                <div className="ss-sr-grid">
                  {results.map((user) => (
                    <article key={user.id} className="ss-sr-card">
                      <div className="ss-sr-avatar">
                        {user.image ? (
                          <img src={`/uploads/avatars/${user.image}`} alt={user.firstname} />
                        ) : (
                          user.firstname[0]
                        )}
                      </div>

                      <Link to={`/talents/${user.id}`} className="ss-sr-name">
                        {user.firstname} {user.lastname}
                      </Link>

                      {user.city && (
                        <p className="ss-sr-city">
                          <i className="fas fa-map-marker-alt"></i>
                          {user.city}
                        </p>
                      )}

                      <div className="ss-sr-stars">
                        <div className="ss-sr-stars-row">
                          {Array.from({ length: 5 }, (_, i) => (
                            <i key={i} className={`fas fa-star${i < Math.round(user.averageRating) ? ' filled' : ''}`}></i>
                          ))}
                        </div>
                        <span className="ss-sr-rating">
                          {user.averageRating > 0 ? `${user.averageRating.toFixed(1)}/5` : 'Pas de note'} ({user.reviewCount})
                        </span>
                      </div>

                      {user.skills.length > 0 && (
                        <div className="ss-sr-skills">
                          {user.skills.slice(0, 4).map((s) => (
                            <span key={s.id} className="ss-sr-pill">{s.label}</span>
                          ))}
                        </div>
                      )}

                      <Link to={`/talents/${user.id}`} className="ss-sr-card-btn">
                        <i className="fas fa-eye"></i>
                        Voir le profil
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="ss-sr-pagination">
                  <button
                    className="ss-sr-page-link"
                    onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
                    disabled={filters.page === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`ss-sr-page-link${p === filters.page ? ' is-current' : ''}`}
                      onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="ss-sr-page-link"
                    onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, (p.page ?? 1) + 1) }))}
                    disabled={filters.page === totalPages}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
