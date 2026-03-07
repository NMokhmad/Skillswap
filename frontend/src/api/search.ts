import { api } from './client'

export type SearchResult = {
  id: number
  firstname: string
  lastname: string
  image: string | null
  city: string | null
  skills: { id: number; label: string; slug: string }[]
  averageRating: number
  reviewCount: number
}

export type SearchResponse = {
  page: number
  limit: number
  total: number
  totalPages: number
  results: SearchResult[]
}

export type SearchFilters = {
  q?: string
  city?: string
  skills?: number[]
  sort?: 'rating_desc' | 'rating_asc' | 'newest' | 'popular'
  min_rating?: number
  page?: number
}

export const searchApi = {
  talents: (filters: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.city) params.set('city', filters.city)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.min_rating) params.set('min_rating', String(filters.min_rating))
    if (filters.page) params.set('page', String(filters.page))
    filters.skills?.forEach(id => params.append('skills[]', String(id)))
    return api.get<SearchResponse>(`/api/search/talents?${params}`)
  },
  autocomplete: (q: string) =>
    api.get<{ suggestions: { id: number; fullname: string; city: string }[] }>(`/api/search/autocomplete?q=${encodeURIComponent(q)}`),
  savedSearches: {
    get: () => api.get<{ searches: { id: number; name: string; filters: SearchFilters }[] }>('/api/search/saved'),
    save: (body: { name: string; filters: SearchFilters }) => api.post('/api/search/save', body),
    delete: (id: number) => api.delete(`/api/search/saved/${id}`),
  },
}
