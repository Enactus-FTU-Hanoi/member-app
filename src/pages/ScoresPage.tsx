import { useState, useEffect } from 'react'
import { authApi } from '../lib/api'
import { useAuth } from '../App'

// ─── SCORES PAGE ─────────────────────────────────────────────────────────────
type Score = { id: string; category: string; score: number; period: string; note?: string; created_at: string }

export function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi<Score[]>('/scores').then(setScores).finally(() => setLoading(false))
  }, [])

  const total = scores.reduce((s, r) => s + r.score, 0)
  const byPeriod = scores.reduce((acc, s) => {
    acc[s.period] = (acc[s.period] || 0) + s.score
    return acc
  }, {} as Record<string, number>)

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Điểm KPI của tôi</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ borderLeft: '3px solid var(--enactus-red)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Tổng điểm tích lũy</div>
          <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--enactus-red)' }}>{total.toFixed(1)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Số kỳ đánh giá</div>
          <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{Object.keys(byPeriod).length}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Lịch sử chấm điểm</h3>
        <table>
          <thead><tr><th>Kỳ</th><th>Hạng mục</th><th>Điểm</th><th>Ghi chú</th><th>Ngày</th></tr></thead>
          <tbody>
            {scores.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-blue">{s.period}</span></td>
                <td style={{ fontWeight: 500 }}>{s.category}</td>
                <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: s.score >= 0 ? '#1A7A41' : 'var(--enactus-red)' }}>{s.score > 0 ? '+' : ''}{s.score}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.note || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {scores.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>Chưa có điểm nào</p>}
      </div>
    </div>
  )
}

// ─── SCHEDULE PAGE ────────────────────────────────────────────────────────────
type Poll = { id: string; title: string; description: string; time_slots: string; deadline?: string; status: string }

export function SchedulePage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi<Poll[]>('/schedule/polls').then(setPolls).finally(() => setLoading(false))
  }, [])

  const toggleSlot = (pollId: string, slot: string) => {
    setMyVotes(v => {
      const cur = v[pollId] || []
      return { ...v, [pollId]: cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot] }
    })
  }

  const submitVote = async (pollId: string) => {
    await authApi(`/schedule/polls/${pollId}/vote`, { method: 'POST', body: { available_slots: myVotes[pollId] || [] } })
    alert('Đã lưu vote!')
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Vote lịch họp</h1>
      {polls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Chưa có đợt vote lịch nào đang mở</div>
      ) : polls.map(poll => {
        const slots: string[] = JSON.parse(poll.time_slots || '[]')
        const selected = myVotes[poll.id] || []
        return (
          <div key={poll.id} className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>{poll.title}</h3>
            {poll.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>{poll.description}</p>}
            {poll.deadline && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Hạn chót: {new Date(poll.deadline).toLocaleDateString('vi-VN')}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {slots.map(slot => (
                <button key={slot} onClick={() => toggleSlot(poll.id, slot)} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid',
                  borderColor: selected.includes(slot) ? 'var(--enactus-red)' : 'var(--border)',
                  background: selected.includes(slot) ? 'var(--enactus-red-light)' : 'transparent',
                  color: selected.includes(slot) ? 'var(--enactus-red-dark)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 500,
                  transition: 'all 0.15s',
                }}>{slot}</button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => submitVote(poll.id)}>Lưu vote ({selected.length} slot)</button>
          </div>
        )
      })}
    </div>
  )
}

// ─── CNB PAGE ─────────────────────────────────────────────────────────────────
type CnbRecord = { id: string; period: string; type: string; amount: number; note?: string; created_at: string }

export function CnbPage() {
  const [records, setRecords] = useState<CnbRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi<CnbRecord[]>('/cnb').then(setRecords).finally(() => setLoading(false))
  }, [])

  const totalBenefits  = records.filter(r => r.type === 'benefit').reduce((s, r) => s + r.amount, 0)
  const totalDeductions = records.filter(r => r.type === 'deduction').reduce((s, r) => s + r.amount, 0)

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>C&B — Phúc lợi & Khấu trừ</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Tổng phúc lợi</div><div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#1A7A41' }}>{totalBenefits.toLocaleString('vi-VN')} đ</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Tổng khấu trừ</div><div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--enactus-red)' }}>{totalDeductions.toLocaleString('vi-VN')} đ</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Thực nhận</div><div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{(totalBenefits - totalDeductions).toLocaleString('vi-VN')} đ</div></div>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Kỳ</th><th>Loại</th><th>Số tiền</th><th>Ghi chú</th></tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td><span className="badge badge-gray">{r.period}</span></td>
                <td><span className={`badge ${r.type === 'benefit' ? 'badge-green' : 'badge-red'}`}>{r.type === 'benefit' ? 'Phúc lợi' : 'Khấu trừ'}</span></td>
                <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: r.type === 'benefit' ? '#1A7A41' : 'var(--enactus-red)' }}>
                  {r.type === 'benefit' ? '+' : '-'}{r.amount.toLocaleString('vi-VN')} đ
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>Chưa có dữ liệu C&B</p>}
      </div>
    </div>
  )
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { member } = useAuth()
  const [form, setForm] = useState({ name: member?.name || '', phone: '', avatar_url: '' })
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await authApi(`/members/${member?.id}`, { method: 'PATCH', body: form })
      alert('Đã cập nhật!')
    } finally { setSaving(false) }
  }

  const initials = member?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Hồ sơ cá nhân</h1>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>{member?.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{member?.email}</div>
            <span className="badge badge-red" style={{ marginTop: 6 }}>{member?.role}</span>
          </div>
        </div>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Họ và tên</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>Số điện thoại</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0912 345 678" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}
