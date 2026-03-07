import { api } from './client'

export type Notification = {
  id: number
  type: string
  content: string
  is_read: boolean
  action_url: string | null
  created_at: string
}

export const notificationsApi = {
  getAll: (page = 1): Promise<{ notifications: Notification[]; total: number; totalPages: number; page: number }> =>
    api.get(`/api/notifications?page=${page}`),

  markAsRead: (id: number): Promise<{ success: boolean }> =>
    api.post(`/api/notifications/${id}/read`, {}),

  markAllAsRead: (): Promise<{ success: boolean }> =>
    api.post('/api/notifications/read-all', {}),

  delete: (id: number): Promise<{ success: boolean }> =>
    api.post(`/api/notifications/${id}/delete`, {}),
}
