import { api } from './client'

export type Skill = { id: number; label: string; slug: string; icon: string }
export type TopUser = {
  id: number
  firstname: string
  lastname: string
  image: string | null
  interest: string | null
  avg_reviews: number
}

export const homepageApi = {
  get: () => api.get<{ skills: Skill[]; topUsers: TopUser[] }>('/api/homepage'),
}
