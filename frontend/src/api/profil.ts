import { api } from './client'
import type { AuthUser } from '../stores/authStore'

export type ProfilPublicUser = {
  id: number
  firstname: string
  lastname: string
  bio: string | null
  city: string | null
  image: string | null
  interest: string | null
  skills: { id: number; label: string; slug: string }[]
  reviews: {
    id: number; rate: number; comment: string | null; created_at: string
    reviewer: { id: number; firstname: string; lastname: string; image: string | null }
  }[]
  averageRating: number
  reviewCount: number
  followerCount: number
  isFollowing: boolean
}

export type MyProfilUser = AuthUser & {
  bio: string | null
  city: string | null
  image: string | null
  interest: string | null
  skills: { id: number; label: string; slug: string }[]
}

export const profilApi = {
  getProfil: (id: number) => api.get<{ user: ProfilPublicUser }>(`/api/user/${id}/profil`),
  getMyProfil: () => api.get<{ user: MyProfilUser }>('/api/me/profil'),
  updateMyProfil: (formData: FormData) =>
    fetch('/api/me/profil', { method: 'PUT', credentials: 'include', body: formData }).then(r => r.json()),
  deleteMyProfil: () => api.delete<{ success: boolean }>('/api/me/profil'),
}
