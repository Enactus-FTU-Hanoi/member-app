const BASE = (import.meta as any).env?.VITE_API_URL || 'https://api.enactusftuhanoi.id.vn'

export type ApiOpts = { method?: string; body?: unknown; token?: string }

export async function api<T = unknown>(path: string, opts: ApiOpts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = opts.token || localStorage.getItem('access_token') || ''
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401) {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      const r = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      })
      if (r.ok) {
        const { accessToken, refreshToken: newRefresh } = await r.json()
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', newRefresh)
        const retry = await fetch(`${BASE}${path}`, {
          method: opts.method || 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: opts.body ? JSON.stringify(opts.body) : undefined,
        })
        if (!retry.ok) throw new Error((await retry.json() as any).error || 'Request failed')
        return retry.json() as Promise<T>
      }
    }
    localStorage.clear()
    window.location.reload()
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' })) as any
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// Types
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'FORMER_MEMBER' | 'SUSPENDED'
export type MemberRole = 'member' | 'admin' | 'super_admin'

export type Member = {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  photo_url?: string
  department?: string
  position?: string
  generation?: string
  dob?: string
  phone?: string
  student_id?: string
  facebook_url?: string
  linkedin_url?: string
  bio?: string
  joined_at: string
  updated_at?: string
}

export type Task = {
  id: string
  title: string
  description?: string
  assigned_to: string
  assignee_name?: string
  created_by: string
  due_date?: string
  project?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  points: number
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  note?: string
  created_at: string
}

export type Notification = {
  id: string
  title: string
  body: string
  type: string
  read: number
  created_at: string
}