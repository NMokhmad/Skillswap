import { api } from './client'

export type Skill = { id: number; label: string; slug: string; icon: string; userCount: number }
export type SkillUser = { id: number; firstname: string; lastname: string; image: string | null; bio: string | null }

export const skillsApi = {
  getAll: () => api.get<{ skills: Skill[]; totalUsers: number }>('/api/skills'),
  getOne: (slug: string) => api.get<{ skill: { id: number; label: string; slug: string; icon: string; users: SkillUser[] } }>(`/api/skills/${slug}`),
}
