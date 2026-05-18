import { useAuth } from '../App'

type Page = 'dashboard' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'profile'

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: '⊞' },
  { id: 'tasks',     label: 'Tasks',       icon: '✓' },
  { id: 'scores',    label: 'Điểm KPI',    icon: '◈' },
  { id: 'schedule',  label: 'Lịch họp',    icon: '◷' },
  { id: 'cnb',       label: 'C&B',         icon: '◎' },
  { id: 'profile',   label: 'Hồ sơ',       icon: '◉' },
]

const PAGE_META: Record<Page, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard',          sub: 'Tổng quan hoạt động của bạn' },
  tasks:     { title: 'Tasks của tôi',       sub: 'Quản lý và cập nhật tiến độ' },
  scores:    { title: 'Điểm KPI',            sub: 'Lịch sử chấm điểm' },
  schedule:  { title: 'Vote lịch họp',       sub: 'Chọn khung giờ phù hợp' },
  cnb:       { title: 'C&B',                 sub: 'Phúc lợi & khấu trừ' },
  profile:   { title: 'Hồ sơ cá nhân',       sub: 'Thông tin & cài đặt' },
}

type Props = { page: Page; onNavigate: (p: Page) => void; children: React.ReactNode }

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
}

export function Layout({ page, onNavigate, children }: Props) {
  const { member, logout } = useAuth()
  const meta = PAGE_META[page]

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">E</div>
          <div>
            <div className="logo-name">Enactus FTU</div>
            <div className="logo-sub">Member Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="user-chip" onClick={() => onNavigate('profile')}>
            <div className="av av-sm">{member ? initials(member.name) : '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-chip-name">{member?.name}</div>
              <div className="user-chip-role">{member?.department || member?.role}</div>
            </div>
          </button>
          <button className="logout-btn" onClick={logout}>
            <span>⟵</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn">
              🔔
              <span className="notif-dot" />
            </button>
            <div className="av av-md" style={{ cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
              {member ? initials(member.name) : '?'}
            </div>
          </div>
        </header>

        <div className="page">
          <div className="page-enter">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
