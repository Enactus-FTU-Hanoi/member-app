import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Icon } from '../components/Icon'

type Poll = {
  id: string
  title: string
  description?: string
  time_slots: string[] | string
  type?: 'list' | 'range'
  status: string
  deadline?: string
}

type TimeSlot = { label: string; date: string; time: string }

export function SchedulePage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api<any>('/schedule/polls/all'),
      api<Record<string, string[]>>('/schedule/my-votes')
    ]).then(([pollsData, votesData]) => {
      let pollsList: Poll[] = []
      if (Array.isArray(pollsData)) {
        pollsList = pollsData
      } else if (pollsData?.polls) {
        pollsList = pollsData.polls
      }
      
      // Parse time_slots nếu cần
      pollsList = pollsList.map(poll => ({
        ...poll,
        time_slots: typeof poll.time_slots === 'string' 
          ? JSON.parse(poll.time_slots) 
          : poll.time_slots
      }))
      
      setPolls(pollsList)
      setMyVotes(votesData || {})
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const toggleSlot = (pollId: string, slot: string) => {
    setMyVotes(prev => {
      const current = prev[pollId] || []
      const updated = current.includes(slot)
        ? current.filter(s => s !== slot)
        : [...current, slot]
      return { ...prev, [pollId]: updated }
    })
  }

  const submitVote = async (poll: Poll) => {
    setVoting(poll.id)
    try {
      await api('/schedule/vote', {
        method: 'POST',
        body: { poll_id: poll.id, available_slots: myVotes[poll.id] || [] }
      })
      alert('Đã lưu vote thành công!')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setVoting(null)
    }
  }

  const parseTimeSlots = (timeSlots: string[]): TimeSlot[] => {
    try {
      return timeSlots.map((slot: string) => {
        const [date, time] = slot.split(' ')
        return { label: slot, date, time }
      })
    } catch {
      return []
    }
  }

  const groupByDate = (slots: TimeSlot[]) => {
    const grouped: Record<string, TimeSlot[]> = {}
    slots.forEach(slot => {
      if (!grouped[slot.date]) grouped[slot.date] = []
      grouped[slot.date].push(slot)
    })
    return grouped
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <h2 className="page-title">Lịch họp & Sự kiện</h2>
      
      {polls.length === 0 ? (
        <div className="empty"><Icon name="Calendar" size={48} /><span>Chưa có poll nào</span></div>
      ) : (
        polls.map(poll => {
          const slotsArray = Array.isArray(poll.time_slots) ? poll.time_slots : []
          const slots = parseTimeSlots(slotsArray)
          const grouped = groupByDate(slots)
          const selectedSlots = myVotes[poll.id] || []
          const isExpired = poll.deadline && new Date(poll.deadline) < new Date()
          const isOpen = poll.status === 'open' && !isExpired

          return (
            <div key={poll.id} className="card" style={{ marginBottom: 24 }}>
              <div className="card-head">
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{poll.title}</h3>
                  {poll.description && <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>{poll.description}</p>}
                </div>
                <span className={`badge ${isOpen ? 'badge-gold' : 'badge-gray'}`}>
                  {isOpen ? '● Đang mở' : 'Đã đóng'}
                </span>
              </div>

              {/* Grid Calendar */}
              <div className="schedule-grid">
                <table className="grid-table">
                  <thead>
                    <tr>
                      <th className="time-header">Giờ</th>
                      {Object.keys(grouped).map(date => (
                        <th key={date} className="date-header">{date}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(slots.map(s => s.time))).sort().map(time => (
                      <tr key={time}>
                        <td className="time-cell">{time}</td>
                        {Object.entries(grouped).map(([date, daySlots]) => {
                          const slot = daySlots.find(s => s.time === time)
                          const isSelected = slot && selectedSlots.includes(slot.label)
                          const isAvailable = slot && isOpen
                          
                          return (
                            <td
                              key={date}
                              className={`slot-cell ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                              onClick={() => isAvailable && slot && toggleSlot(poll.id, slot.label)}
                            >
                              {isSelected && <Icon name="Check" size={16} />}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isOpen && (
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => submitVote(poll)}
                    disabled={voting === poll.id}
                  >
                    {voting === poll.id ? <Icon name="Loader2" size={16} className="spin" /> : <Icon name="Save" size={16} />}
                    Lưu vote ({selectedSlots.length} slot)
                  </button>
                </div>
              )}

              {!isOpen && selectedSlots.length > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: '#F0FDF4', borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: '#166534' }}>
                    ✅ Bạn đã chọn {selectedSlots.length} khung giờ
                  </p>
                </div>
              )}
            </div>
          )
        })
      )}

      <style>{`
        .schedule-grid {
          overflow-x: auto;
          margin-top: 16px;
        }
        .grid-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .grid-table th,
        .grid-table td {
          border: 1px solid #E5E7EB;
          padding: 8px 12px;
          text-align: center;
        }
        .time-header {
          background: #F9FAFB;
          font-weight: 600;
          color: #6B7280;
          min-width: 70px;
        }
        .date-header {
          background: #FFF8E1;
          font-weight: 600;
          color: #B45309;
        }
        .time-cell {
          background: #F9FAFB;
          font-weight: 500;
          color: #4B5563;
        }
        .slot-cell {
          cursor: pointer;
          transition: all 0.2s;
          background: #FFFFFF;
        }
        .slot-cell:hover {
          background: #FEF3C7;
        }
        .slot-cell.selected {
          background: #FFC107;
          color: white;
        }
        .slot-cell.disabled {
          background: #F3F4F6;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}