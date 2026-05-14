import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

type Task = { id: string; title: string; status: string; due_date: string; project: string; priority: string; points: number }
type Notification = { id: string; title: string; body: string; type: string; read: number; created_at: string }
type Score = { category: string; score: number; period: string }

export function DashboardPage() {
  const { member } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<Task[]>('/tasks'),
      api<Notification[]>('/notifications'),
      api<Score[]>('/scores'),
    ]).then(([t, n, s]) => {
      const openTasks = t.filter(task => task.status !== 'done')
      setTasks(openTasks.slice(0, 5))
      setNotifs(n.slice(0, 5))
      setScores(s)
    }).finally(() => setLoading(false))
  }, [])

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
  const pendingTasks = tasks.length
  const unread = notifs.filter(n => !n.read).length

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Chào buổi sáng'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>{greet()}, {member?.name?.split(' ').pop()} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tổng điểm KPI', value: totalScore.toFixed(1), unit: 'pts', color: 'var(--enactus-red)', bg: 'var(--enactus-red-light)' },
          { label: 'Task đang chờ', value: pendingTasks,           unit: 'task', color: '#B25C0A', bg: '#FEF3CD' },
          { label: 'Thông báo mới', value: unread,                 unit: 'mới',  color: '#1A4FA0', bg: '#E6F0FD' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>{stat.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Tasks gần đây</h3>
            <span className="badge badge-gray">{pendingTasks} pending</span>
          </div>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Không có task nào 🎉</p>
          ) : tasks.map(task => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: task.status === 'in_progress' ? '#22C55E' : task.status === 'done' ? 'var(--border-strong)' : '#F59E0B',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                {task.project && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.project}</div>}
              </div>
              <span className={`badge ${task.priority === 'urgent' ? 'badge-red' : task.priority === 'high' ? 'badge-amber' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Thông báo</h3>
            {unread > 0 && <span className="badge badge-red">{unread} mới</span>}
          </div>
          {notifs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Chưa có thông báo</p>
          ) : notifs.map(n => (
            <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                {!n.read && <div className="dot dot-red" style={{ width: 6, height: 6 }} />}
                <span style={{ fontSize: 14, fontWeight: n.read ? 400 : 500 }}>{n.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
