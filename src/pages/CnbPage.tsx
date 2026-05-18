import { useState, useEffect } from 'react'
import { api, CnbRecord, fmtMoney, fmtDate } from '../lib/api'

export function CnbPage() {
  const [records, setRecords] = useState<CnbRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('all')

  useEffect(() => {
    api<CnbRecord[]>('/cnb').then(setRecords).catch(console.error).finally(() => setLoading(false))
  }, [])

  const periods = ['all', ...Array.from(new Set(records.map(r => r.period)))]
  const filtered = period === 'all' ? records : records.filter(r => r.period === period)

  const totalBenefits   = filtered.filter(r => r.type === 'benefit').reduce((s, r) => s + r.amount, 0)
  const totalDeductions = filtered.filter(r => r.type === 'deduction').reduce((s, r) => s + r.amount, 0)
  const net = totalBenefits - totalDeductions

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>C&B — Phúc lợi & Khấu trừ</h1>
        <p>Theo dõi các khoản phúc lợi và khấu trừ của bạn</p>
      </div>

      {/* Summary */}
      <div className="g3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng phúc lợi',  value: fmtMoney(totalBenefits),   color: 'var(--green)',  bg: 'var(--green-lt)' },
          { label: 'Tổng khấu trừ', value: fmtMoney(totalDeductions),  color: 'var(--red)',    bg: '#FEF2F2' },
          { label: 'Thực nhận',      value: fmtMoney(net),              color: net >= 0 ? 'var(--blue)' : 'var(--red)', bg: net >= 0 ? 'var(--blue-lt)' : '#FEF2F2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-blob" style={{ background: s.color, opacity: .08 }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Lịch sử giao dịch</div>
          {periods.length > 1 && (
            <div className="tabs">
              {periods.map(p => (
                <button key={p} className={`tab-item${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'all' ? 'Tất cả' : p}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <span>Chưa có dữ liệu C&B</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kỳ</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Ghi chú</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge b-gray">{r.period}</span></td>
                    <td>
                      <span className={`badge ${r.type === 'benefit' ? 'b-green' : 'b-red'}`}>
                        {r.type === 'benefit' ? '↑ Phúc lợi' : '↓ Khấu trừ'}
                      </span>
                    </td>
                    <td style={{
                      fontWeight: 700, fontSize: 14,
                      color: r.type === 'benefit' ? 'var(--green)' : 'var(--red)',
                    }}>
                      {r.type === 'benefit' ? '+' : '-'}{fmtMoney(r.amount)}
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{r.note || '—'}</td>
                    <td style={{ color: 'var(--text-4)', fontSize: 13 }}>{fmtDate(r.created_at)}</td>
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
