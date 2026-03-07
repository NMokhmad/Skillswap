import { api } from './client'
import type { AuthUser } from '../stores/authStore'

type LoginBody = { email: string; password: string }
type RegisterBody = { firstname: string; lastname: string; email: string; password: string; confirmPassword: string }
type AuthResponse = { user: AuthUser }

export const authApi = {
  me: () => api.get<AuthResponse>('/api/me'),
  login: (body: LoginBody) => api.post<AuthResponse>('/api/auth/login', body),
  register: (body: RegisterBody) => api.post<AuthResponse>('/api/auth/register', body),
  logout: () => api.post<void>('/api/auth/logout'),
}
