import { api } from './client'

export type TalentUser = {
  id: number; firstname: string; lastname: string
  image: string | null; city: string | null; interest: string | null
  skills: { id: number; label: string; slug: string }[]
  averageRating: number; reviewCount: number
}

export type TalentDetail = TalentUser & {
  bio: string | null
  reviews: {
    id: number; rate: number; comment: string | null; created_at: string
    reviewer: { id: number; firstname: string; lastname: string; image: string | null }
  }[]
  followerCount: number
  isFollowing: boolean
}

export const talentsApi = {
  getAll: (page = 1) => api.get<{ page: number; limit: number; total: number; totalPages: number; results: TalentUser[] }>(`/api/talents?page=${page}`),
  getOne: (id: number) => api.get<{ talent: TalentDetail }>(`/api/talents/${id}`),
}
