import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { api, Task, Notification, Score, timeAgo, fmtDate } from '../lib/api'

export function DashboardPage() {
  const { member } = useAuth()
  const [tasks, setTasks]   = useState<Task[]>([])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<Task[]>('/tasks'),
      api<Notification[]>('/notifications'),
      api<Score[]>('/scores'),
    ]).then(([t, n, s]) => {
      setTasks(t.slice(0, 5))
      setNotifs(n.slice(0, 5))
      setScores(s)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalScore   = scores.reduce((sum, s) => sum + s.score, 0)
  const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length
  const unread       = notifs.filter(n => !n.read).length

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Chào buổi sáng'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  )

  const STATS = [
    { label: 'Tổng điểm KPI', value: totalScore.toFixed(1), unit: 'điểm', color: '#E8192C', bg: '#FEF2F2' },
    { label: 'Task đang chờ', value: pendingTasks,           unit: 'task', color: '#D97706', bg: '#FFFBEB' },
    { label: 'Thông báo mới', value: unread,                 unit: 'mới',  color: '#2563EB', bg: '#EFF6FF' },
  ]

  const statusDot: Record<string, string> = {
    todo: '#F59E0B', in_progress: '#3B82F6', done: '#22C55E', cancelled: '#9CA3AF',
  }

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 3 }}>
          {greet()}, {member?.name?.split(' ').pop()} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="g3" style={{ marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-blob" style={{ background: s.color, opacity: .08 }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="g2">
        {/* Tasks */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Tasks gần đây</div>
            {pendingTasks > 0 && <span className="badge b-amber">{pendingTasks} pending</span>}
          </div>
          {tasks.length === 0 ? (
            <div className="empty" style={{ padding: '28px 0' }}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <span style={{ fontSize: 13 }}>Không có task nào!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {tasks.map((task, i) => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0',
                  borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: statusDot[task.status] || '#9CA3AF',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    {task.project && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>{task.project}</div>
                    )}
                  </div>
                  <span className={`badge ${task.priority === 'urgent' ? 'b-red' : task.priority === 'high' ? 'b-orange' : 'b-gray'}`}
                    style={{ fontSize: 10.5 }}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Thông báo</div>
            {unread > 0 && <span className="badge b-red">{unread} mới</span>}
          </div>
          {notifs.length === 0 ? (
            <div className="empty" style={{ padding: '28px 0' }}>
              <span style={{ fontSize: 28 }}>🔔</span>
              <span style={{ fontSize: 13 }}>Chưa có thông báo</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {notifs.map((n, i) => (
                <div key={n.id} style={{
                  padding: '11px 0',
                  borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    {!n.read && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13.5, fontWeight: n.read ? 400 : 600, lineHeight: 1.3 }}>{n.title}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{n.body}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3, display: 'block' }}>{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score summary */}
      {scores.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-head">
            <div className="card-title">Điểm KPI gần đây</div>
            <span className="badge b-yellow">Tổng: {totalScore.toFixed(1)} pts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.slice(0, 4).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge b-gray" style={{ minWidth: 80, justifyContent: 'center' }}>{s.period}</span>
                <div style={{ flex: 1, fontSize: 13.5 }}>{s.category}</div>
                <span style={{
                  fontWeight: 700, fontSize: 14,
                  color: s.score >= 0 ? 'var(--green)' : 'var(--red)',
                }}>
                  {s.score > 0 ? '+' : ''}{s.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
