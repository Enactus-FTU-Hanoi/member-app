import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function SchedulePage() {
  const [polls, setPolls] = useState<any[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})

  useEffect(() => {
    Promise.all([
      api<any>('/schedule/polls/all'),
      api<Record<string, string>>('/schedule/my-votes')
    ]).then(([pollsData, votesData]) => {
      // Xử lý dữ liệu polls an toàn
      let pollsList: any[] = []
      if (Array.isArray(pollsData)) {
        pollsList = pollsData
      } else if (pollsData && typeof pollsData === 'object' && Array.isArray(pollsData.polls)) {
        pollsList = pollsData.polls
      } else if (pollsData && typeof pollsData === 'object' && pollsData.results) {
        pollsList = pollsData.results
      }
      setPolls(pollsList)
      setMyVotes(votesData || {})
    }).catch((err) => {
      console.error(err)
      setPolls([])
    }).finally(() => setLoading(false))
  }, [])

  const vote = async (pollId: string, slot: string) => {
    setVoting(pollId)
    try {
      await api('/schedule/vote', { method: 'POST', body: { poll_id: pollId, slot } })
      setMyVotes(v => ({ ...v, [pollId]: slot }))
      // Refresh results
      const res = await api<any[]>(`/schedule/polls/${pollId}/results`)
      setResults(r => ({ ...r, [pollId]: Array.isArray(res) ? res : [] }))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setVoting(null)
    }
  }

  const viewResults = async (pollId: string) => {
    if (results[pollId]) return
    try {
      const res = await api<any[]>(`/schedule/polls/${pollId}/results`)
      setResults(r => ({ ...r, [pollId]: Array.isArray(res) ? res : [] }))
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <h2 className="page-title">Lịch họp & Sự kiện</h2>
      {polls.length === 0 ? (
        <div className="empty"><span style={{ fontSize: 48 }}>📅</span><span>Chưa có poll nào</span></div>
      ) : (
        polls.map(poll => {
          let slots: string[] = []
          try {
            if (typeof poll.time_slots === 'string') {
              slots = JSON.parse(poll.time_slots || '[]')
            } else if (Array.isArray(poll.time_slots)) {
              slots = poll.time_slots
            }
          } catch { slots = [] }
          
          const myVote = myVotes[poll.id]
          const showResults = results[poll.id]
          const isExpired = poll.deadline && new Date(poll.deadline) < new Date()

          return (
            <div key={poll.id} className="card" style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{poll.title}</h3>
                  <span className={`badge ${poll.status === 'open' && !isExpired ? 'b-green' : 'b-gray'}`}>
                    {poll.status === 'open' && !isExpired ? '● Đang mở' : 'Đã đóng'}
                  </span>
                </div>
                {poll.description && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{poll.description}</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slots.map(slot => {
                  const isVoted = myVote === slot
                  const disabled = poll.status !== 'open' || isExpired || !!myVote
                  return (
                    <button
                      key={slot}
                      className={`btn ${isVoted ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => vote(poll.id, slot)}
                      disabled={disabled || voting === poll.id}
                      style={{ justifyContent: 'space-between', width: '100%' }}
                    >
                      <span>{slot}</span>
                      {isVoted && <span style={{ fontSize: 12 }}>✓ Đã chọn</span>}
                    </button>
                  )
                })}
              </div>

              {myVote && !showResults && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => viewResults(poll.id)}
                  style={{ marginTop: 12, width: '100%' }}
                >
                  Xem kết quả
                </button>
              )}

              {showResults && showResults.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>📊 Kết quả bình chọn</div>
                  {showResults.map((r: any, idx: number) => (
                    <div key={r.slot || idx} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span>{r.slot}</span>
                        <span className="badge b-green">{r.count} phiếu</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ 
                          width: `${showResults[0]?.count > 0 ? (r.count / showResults[0].count) * 100 : 0}%`,
                          background: 'var(--amber)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}