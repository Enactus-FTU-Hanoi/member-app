import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function DashboardPage() {
  const { member } = useAuth()
  const [tasks, setTasks]   = useState<any[]>([])
  const [notifs, setNotifs] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<any[]>('/tasks'),
      api<any[]>('/notifications'),
      api<any[]>('/scores'),
    ]).then(([t, n, s]) => {
      setTasks(t.slice(0, 5)); setNotifs(n.slice(0, 5)); setScores(s)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalScore   = scores.reduce((s, r) => s + r.score, 0)
  const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length
  const unread       = notifs.filter(n => !n.read).length

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Chào buổi sáng'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const STATS = [
    { label: 'Tổng điểm KPI', value: totalScore.toFixed(1), sub: 'điểm tích lũy', icon: '🏅', bg: '#FFF8E1', color: '#B45309' },
    { label: 'Task đang chờ', value: pendingTasks,           sub: 'cần xử lý',    icon: '✅', bg: '#EFF6FF', color: '#2563EB' },
    { label: 'Thông báo mới', value: unread,                 sub: 'chưa đọc',     icon: '🔔', bg: '#F0FDF4', color: '#16A34A' },
  ]

  const STATUS_COLOR: Record<string, string> = {
    todo: '#F59E0B', in_progress: '#3B82F6', done: '#22C55E', cancelled: '#D1D5DB',
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          {greet()}, {member?.name?.split(' ').pop()} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="g3" style={{ marginBottom: 22 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Tasks */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Tasks gần đây</div>
            {pendingTasks > 0 && <span className="badge b-amber">{pendingTasks} pending</span>}
          </div>
          {tasks.length === 0
            ? <div className="empty" style={{ padding: '24px 0' }}><span>🎉</span><span style={{fontSize:13}}>Không có task nào!</span></div>
            : tasks.map((task, i) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: STATUS_COLOR[task.status] || '#D1D5DB' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  {task.project && <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>{task.project}</div>}
                </div>
                <span className={`badge ${task.priority === 'urgent' ? 'b-red' : task.priority === 'high' ? 'b-orange' : 'b-gray'}`} style={{ fontSize: 10.5 }}>
                  {task.priority}
                </span>
              </div>
            ))
          }
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Thông báo</div>
            {unread > 0 && <span className="badge b-red">{unread} mới</span>}
          </div>
          {notifs.length === 0
            ? <div className="empty" style={{ padding: '24px 0' }}><span>🔔</span><span style={{fontSize:13}}>Chưa có thông báo</span></div>
            : notifs.map((n, i) => (
              <div key={n.id} style={{
                padding: '10px 0',
                borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />}
                  <span style={{ fontSize: 13.5, fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{n.body}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* KPI summary */}
      {scores.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-head">
            <div className="card-title">Điểm KPI gần đây</div>
            <span className="badge b-amber">Tổng: {totalScore.toFixed(1)} pts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.slice(0, 5).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge b-gray" style={{ minWidth: 80, justifyContent: 'center', fontSize: 11 }}>{s.period}</span>
                <div style={{ flex: 1, fontSize: 13.5 }}>{s.category}</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: s.score >= 0 ? 'var(--green)' : 'var(--red)' }}>
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
