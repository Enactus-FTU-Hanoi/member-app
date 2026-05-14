import { useAuth } from '../App'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  Calendar, 
  DollarSign, 
  User,
  LogOut,
  Bell
} from 'lucide-react'

type Page = 'dashboard' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'profile'

const NAV_ITEMS: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
  { id: 'scores',    label: 'Điểm KPI',  icon: Award },
  { id: 'schedule',  label: 'Lịch họp',  icon: Calendar },
  { id: 'cnb',       label: 'C&B',       icon: DollarSign },
  { id: 'profile',   label: 'Hồ sơ',     icon: User },
]

type Props = { page: Page; onNavigate: (p: Page) => void; children: React.ReactNode }

export function Layout({ page, onNavigate, children }: Props) {
  const { member, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-200">
            <div className="w-10 h-10 bg-[#FFC107] rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">E</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Enactus FTU</h1>
              <p className="text-xs text-gray-500">Hanoi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = page === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#FFC107] bg-opacity-10 text-[#FFC107]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              {member?.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {member?.name?.split(' ').pop()?.[0] || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member?.name}</p>
                <p className="text-xs text-gray-500">{member?.department || member?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {NAV_ITEMS.find(n => n.id === page)?.label || 'Dashboard'}
            </h2>
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}