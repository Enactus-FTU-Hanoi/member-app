import { useState, useEffect } from 'react'
import { api, Score, fmtDate } from '../lib/api'

export function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    api<Score[]>('/scores').then(setScores).catch(console.error).finally(() => setLoading(false))
  }, [])

  const periods = ['all', ...Array.from(new Set(scores.map(s => s.period)))]
  const filtered = period === 'all' ? scores : scores.filter(s => s.period === period)
  const total = filtered.reduce((sum, s) => sum + s.score, 0)

  const byCategory = filtered.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.score
    return acc
  }, {} as Record<string, number>)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Điểm KPI</h1>
        <p>Theo dõi điểm tích lũy của bạn</p>
      </div>

      {/* Summary cards */}
      <div className="g3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-blob" style={{ background: 'var(--red)', opacity: .08 }} />
          <div className="stat-label">Tổng điểm</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{total.toFixed(1)}</div>
          <div className="stat-sub">điểm tích lũy</div>
        </div>
        <div className="stat-card">
          <div className="stat-blob" style={{ background: 'var(--blue)', opacity: .08 }} />
          <div className="stat-label">Số kỳ</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{periods.length - 1}</div>
          <div className="stat-sub">kỳ đánh giá</div>
        </div>
        <div className="stat-card">
          <div className="stat-blob" style={{ background: 'var(--green)', opacity: .08 }} />
          <div className="stat-label">Số bản ghi</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{filtered.length}</div>
          <div className="stat-sub">lần chấm điểm</div>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head">
            <div className="card-title">Phân tích theo hạng mục</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(byCategory).sort(([,a],[,b]) => b - a).map(([cat, pts]) => {
              const max = Math.max(...Object.values(byCategory))
              const pct = max > 0 ? (Math.abs(pts) / max) * 100 : 0
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pts >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {pts > 0 ? '+' : ''}{pts.toFixed(1)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: pts >= 0 ? 'var(--green)' : 'var(--red)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter + table */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Lịch sử chấm điểm</div>
          <div className="tabs">
            {periods.map(p => (
              <button key={p} className={`tab-item${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                {p === 'all' ? 'Tất cả' : p}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <span style={{ fontSize: 32 }}>📊</span>
            <span>Chưa có dữ liệu</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kỳ</th>
                  <th>Hạng mục</th>
                  <th>Điểm</th>
                  <th>Ghi chú</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge b-blue">{s.period}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.category}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: 14,
                        color: s.score >= 0 ? 'var(--green)' : 'var(--red)',
                      }}>
                        {s.score > 0 ? '+' : ''}{s.score}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{s.note || '—'}</td>
                    <td style={{ color: 'var(--text-4)', fontSize: 13 }}>{fmtDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
