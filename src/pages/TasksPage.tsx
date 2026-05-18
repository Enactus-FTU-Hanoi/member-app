import { useState, useEffect } from 'react'
import { api, Task, taskStatusLabel, priorityColor, fmtDate } from '../lib/api'

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  todo:        { color: '#92570A', bg: '#FFFBEB' },
  in_progress: { color: '#1D4ED8', bg: '#EFF6FF' },
  done:        { color: '#15803D', bg: '#F0FDF4' },
  cancelled:   { color: '#6B7280', bg: '#F9FAFB' },
}

export function TasksPage() {
  const [tasks, setTasks]   = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    api<Task[]>('/tasks').then(setTasks).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/tasks/${id}`, { method: 'PATCH', body: { status } })
      setTasks(ts => ts.map(t => t.id === id ? { ...t, status: status as Task['status'] } : t))
    } catch (e) { console.error(e) }
  }

  const counts: Record<string, number> = { all: tasks.length }
  tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Tasks của tôi</h1>
        <p>{tasks.length} task tổng cộng</p>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', 'todo', 'in_progress', 'done', 'cancelled'].map(s => (
          <button key={s} className={`tab-item${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'Tất cả' : taskStatusLabel[s]}
            {counts[s] ? <span style={{
              marginLeft: 4, background: filter === s ? 'var(--amber)' : 'var(--border)',
              color: filter === s ? '#1a1200' : 'var(--text-3)',
              borderRadius: 99, padding: '0 6px', fontSize: 10.5, fontWeight: 700,
            }}>{counts[s]}</span> : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span style={{ fontSize: 36 }}>✓</span>
          <span>Không có task nào</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(task => {
            const ss = STATUS_STYLE[task.status] || STATUS_STYLE.todo
            return (
              <div key={task.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Priority stripe */}
                <div style={{
                  width: 3, height: 40, borderRadius: 99, flexShrink: 0,
                  background: task.priority === 'urgent' ? 'var(--red)'
                    : task.priority === 'high' ? 'var(--orange)'
                    : task.priority === 'medium' ? 'var(--amber)'
                    : 'var(--border)',
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{task.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {task.project && <span className="badge b-blue" style={{ fontSize: 11 }}>{task.project}</span>}
                    {task.due_date && (
                      <span style={{ fontSize: 11.5, color: 'var(--text-4)' }}>
                        ⏱ {fmtDate(task.due_date)}
                      </span>
                    )}
                    <span style={{ fontSize: 11.5, color: 'var(--text-4)' }}>+{task.points} pts</span>
                  </div>
                </div>

                <select
                  value={task.status}
                  onChange={e => updateStatus(task.id, e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 'var(--r-sm)',
                    border: `1px solid ${ss.color}30`,
                    fontSize: 12.5, fontWeight: 600,
                    background: ss.bg, color: ss.color,
                    cursor: 'pointer', outline: 'none', flexShrink: 0,
                  }}
                >
                  {Object.entries(taskStatusLabel).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
