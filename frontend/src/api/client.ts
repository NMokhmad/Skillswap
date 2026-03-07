type ApiError = {
  status: number
  code: string
  message: string
}

export class ApiRequestError extends Error {
  status: number
  code: string

  constructor({ status, code, message }: ApiError) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let errorData: ApiError = { status: res.status, code: 'ERROR', message: 'Erreur serveur' }
    try {
      errorData = await res.json()
    } catch { /* ignore */ }
    throw new ApiRequestError(errorData)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
