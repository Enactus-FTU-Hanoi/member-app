import { useState, useEffect } from 'react'
import { api } from '../lib/api'

type Score = { id: string; category: string; score: number; period: string; note?: string; created_at: string }

export function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Score[]>('/scores').then(setScores).finally(() => setLoading(false))
  }, [])

  const total = scores.reduce((s, r) => s + r.score, 0)
  const byPeriod = scores.reduce((acc, s) => {
    acc[s.period] = (acc[s.period] || 0) + s.score
    return acc
  }, {} as Record<string, number>)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <h2 className="page-title">Điểm KPI của tôi</h2>

      <div className="g2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderLeft: '3px solid var(--amber)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>Tổng điểm tích lũy</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--amber)' }}>{total.toFixed(1)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>Số kỳ đánh giá</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{Object.keys(byPeriod).length}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 16 }}>Lịch sử chấm điểm</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Kỳ</th><th>Hạng mục</th><th>Điểm</th><th>Ghi chú</th><th>Ngày</th></tr>
            </thead>
            <tbody>
              {scores.map(s => (
                <tr key={s.id}>
                  <td><span className="badge b-blue">{s.period}</span></td>
                  <td style={{ fontWeight: 500 }}>{s.category}</td>
                  <td><span style={{ fontWeight: 600, color: s.score >= 0 ? 'var(--green)' : 'var(--red)' }}>{s.score > 0 ? '+' : ''}{s.score}</span></td>
                  <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{s.note || '—'}</td>
                  <td style={{ color: 'var(--text-4)', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {scores.length === 0 && <p className="empty" style={{ padding: '24px 0' }}>Chưa có điểm nào</p>}
      </div>
    </div>
  )
}