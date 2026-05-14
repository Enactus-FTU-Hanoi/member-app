import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { api, Task, Notification } from '../lib/api'
import { 
  Award, 
  CheckCircle, 
  TrendingUp,
  Target,
  Bell
} from 'lucide-react'

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

  const stats = [
    { label: 'Tổng điểm', value: totalScore.toFixed(0), icon: Award, color: '#FFC107', bg: '#FFC10710' },
    { label: 'Task đang chờ', value: pendingTasks, icon: CheckCircle, color: '#22C55E', bg: '#22C55E10' },
    { label: 'Thông báo mới', value: unread, icon: Bell, color: '#3B82F6', bg: '#3B82F610' },
    { label: 'Thứ hạng', value: '#24', icon: TrendingUp, color: '#8B5CF6', bg: '#8B5CF610' },
  ]

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC107]" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#FFC107] to-[#FFD54F] rounded-2xl p-6 text-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Xin chào, {member?.name?.split(' ').pop()}!</h1>
            <p className="mt-1 opacity-80">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {member?.photo_url ? (
            <img src={member.photo_url} alt={member.name} className="w-16 h-16 rounded-full border-4 border-white shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white/30 flex items-center justify-center">
              <span className="text-2xl font-bold">{member?.name?.[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Task gần đây</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Không có task nào 🎉</p>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hạn: {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'Không có'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#FFC107]">{task.points}đ</span>
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            {unread > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{unread} mới</span>}
          </div>
          {notifs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có thông báo</p>
          ) : (
            <div className="space-y-3">
              {notifs.map(notif => (
                <div key={notif.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                    <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{notif.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}