import { useState, useEffect } from 'react'
import { api, Poll, fmtDate } from '../lib/api'

export function SchedulePage() {
  const [polls, setPolls]     = useState<Poll[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)

  useEffect(() => {
    api<Poll[]>('/schedule/polls').then(setPolls).catch(console.error).finally(() => setLoading(false))
  }, [])

  const toggleSlot = (pollId: string, slot: string) => {
    setMyVotes(v => {
      const cur = v[pollId] || []
      return { ...v, [pollId]: cur.includes(slot) ? cur.filter(s => s !== slot) : [...cur, slot] }
    })
  }

  const submitVote = async (pollId: string) => {
    setSaving(pollId)
    try {
      await api(`/schedule/polls/${pollId}/vote`, {
        method: 'POST',
        body: { available_slots: myVotes[pollId] || [] },
      })
      setSaved(pollId)
      setTimeout(() => setSaved(null), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Vote lịch họp</h1>
        <p>Chọn các khung giờ bạn rảnh để Ban tổ chức sắp xếp</p>
      </div>

      {polls.length === 0 ? (
        <div className="empty">
          <span style={{ fontSize: 40 }}>📅</span>
          <span style={{ fontWeight: 600 }}>Chưa có đợt vote nào đang mở</span>
          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>Ban tổ chức sẽ tạo vote khi cần sắp xếp lịch họp</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {polls.map(poll => {
            const slots: string[] = (() => { try { return JSON.parse(poll.time_slots || '[]') } catch { return [] } })()
            const selected = myVotes[poll.id] || []
            const isSaving = saving === poll.id
            const isSaved  = saved === poll.id

            return (
              <div key={poll.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{poll.title}</h3>
                    {poll.description && (
                      <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>{poll.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span className={`badge ${poll.status === 'open' ? 'b-green' : 'b-gray'}`}>
                      {poll.status === 'open' ? '● Đang mở' : 'Đã đóng'}
                    </span>
                  </div>
                </div>

                {poll.deadline && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-4)', marginBottom: 14 }}>
                    ⏰ Hạn chót: <strong style={{ color: 'var(--text-2)' }}>{fmtDate(poll.deadline)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                  {slots.map(slot => {
                    const on = selected.includes(slot)
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(poll.id, slot)}
                        disabled={poll.status !== 'open'}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--r-sm)', border: '1.5px solid',
                          borderColor: on ? 'var(--green)' : 'var(--border)',
                          background: on ? 'var(--green-lt)' : 'var(--bg)',
                          color: on ? 'var(--green)' : 'var(--text-2)',
                          cursor: poll.status === 'open' ? 'pointer' : 'not-allowed',
                          fontSize: 13, fontWeight: on ? 600 : 400,
                          transition: 'all .15s',
                          opacity: poll.status !== 'open' ? 0.6 : 1,
                        }}
                      >
                        {on ? '✓ ' : ''}{slot}
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => submitVote(poll.id)}
                    disabled={isSaving || poll.status !== 'open'}
                  >
                    {isSaving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Đang lưu...</>
                      : isSaved ? '✓ Đã lưu!'
                      : `Lưu vote (${selected.length} slot)`}
                  </button>
                  {selected.length > 0 && (
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                      Đã chọn {selected.length}/{slots.length} slot
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
