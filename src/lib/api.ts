const BASE = import.meta.env.VITE_API_URL || 'https://api.enactusftuhanoi.id.vn'

type ApiOptions = {
  method?: string
  body?: unknown
  token?: string
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401) {
    // Try refresh
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const r = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      })
      if (r.ok) {
        const { accessToken, refreshToken: newRefresh } = await r.json()
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', newRefresh)
        // Retry original request
        const retry = await fetch(`${BASE}${path}`, {
          method: opts.method || 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          credentials: 'include',
          body: opts.body ? JSON.stringify(opts.body) : undefined,
        })
        if (!retry.ok) throw new Error((await retry.json() as any).error || 'Request failed')
        return retry.json() as Promise<T>
      }
    }
    localStorage.clear()
    window.location.reload()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' })) as any
    throw new Error(err.error || 'Request failed')
  }

  return res.json() as Promise<T>
}

export function authApi<T = unknown>(path: string, opts: Omit<ApiOptions, 'token'> = {}): Promise<T> {
  const token = localStorage.getItem('access_token') || ''
  return api<T>(path, { ...opts, token })
}
