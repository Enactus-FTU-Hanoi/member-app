import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function CnbPage() {
  const [records, setRecords] = useState<any[]>([])
  const [summary, setSummary] = useState({ total_benefit: 0, total_deduction: 0, net: 0 })
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState('all')

  useEffect(() => {
    Promise.all([
      api<any[]>('/cnb/my'),
      api<any>('/cnb/my/summary')
    ]).then(([recordsData, summaryData]) => {
      setRecords(Array.isArray(recordsData) ? recordsData : [])
      setSummary(summaryData || { total_benefit: 0, total_deduction: 0, net: 0 })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const periods = ['all', ...Array.from(new Set(records.map(r => r.period))).sort().reverse()]
  const filtered = filterPeriod === 'all' ? records : records.filter(r => r.period === filterPeriod)
  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ'

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <h2 className="page-title">C&B của tôi</h2>
      
      {/* Summary Cards */}
      <div className="g3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #10B98120, #05966920)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Tổng phúc lợi</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>+{fmt(summary.total_benefit)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #EF444420, #DC262620)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Tổng khấu trừ</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>-{fmt(summary.total_deduction)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #F59E0B20, #D9770620)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Thực nhận</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>{fmt(summary.net)}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 18 }}>
        {periods.map(p => (
          <button key={p} className={`tab-item${filterPeriod === p ? ' active' : ''}`} onClick={() => setFilterPeriod(p)}>
            {p === 'all' ? 'Tất cả' : p}
          </button>
        ))}
      </div>

      {/* Records Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kỳ</th>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-4)' }}>Chưa có dữ liệu</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="badge b-gray">{r.period}</span></td>
                  <td>
                    <span className={`badge ${r.type === 'benefit' ? 'b-green' : 'b-red'}`}>
                      {r.type === 'benefit' ? '↑ Phúc lợi' : '↓ Khấu trừ'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: r.type === 'benefit' ? '#10B981' : '#EF4444' }}>
                    {r.type === 'benefit' ? '+' : '-'}{fmt(r.amount)}
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{r.note || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}