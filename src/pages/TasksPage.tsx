import { useState, useEffect } from 'react'
import { authApi } from '../lib/api'

type Task = { id: string; title: string; status: string; due_date: string; project: string; priority: string; points: number; note?: string }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  todo:        { label: 'Chưa làm',   color: '#92570A', bg: '#FEF3CD' },
  in_progress: { label: 'Đang làm',   color: '#1A4FA0', bg: '#E6F0FD' },
  done:        { label: 'Hoàn thành', color: '#1A7A41', bg: '#E6F5ED' },
  cancelled:   { label: 'Huỷ',        color: 'var(--text-muted)', bg: 'var(--surface)' },
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    authApi<Task[]>('/tasks').then(setTasks).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const updateStatus = async (id: string, status: string) => {
    await authApi(`/tasks/${id}`, { method: 'PATCH', body: { status } })
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t))
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Tasks của tôi</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{tasks.length} task tổng cộng</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'todo', 'in_progress', 'done'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-ghost" style={{
            padding: '6px 14px', fontSize: 13,
            background: filter === s ? 'var(--text-primary)' : undefined,
            color: filter === s ? '#fff' : undefined,
            borderColor: filter === s ? 'var(--text-primary)' : undefined,
          }}>
            {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Không có task nào ✓</div>
        ) : filtered.map(task => (
          <div key={task.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{task.title}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {task.project && <span className="badge badge-blue" style={{ fontSize: 11 }}>{task.project}</span>}
                {task.due_date && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {new Date(task.due_date).toLocaleDateString('vi-VN')}</span>}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{task.points} pts</span>
              </div>
            </div>
            <select
              value={task.status}
              onChange={e => updateStatus(task.id, e.target.value)}
              style={{
                padding: '5px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                fontSize: 13, background: STATUS_CONFIG[task.status]?.bg, color: STATUS_CONFIG[task.status]?.color,
                fontFamily: 'var(--font-display)', cursor: 'pointer', outline: 'none',
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
