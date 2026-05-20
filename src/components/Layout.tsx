import { useAuth } from '../App'
import { Icon, IconName } from './Icon'

type Page = 'dashboard' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'profile'

const NAV: { id: Page; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'LayoutDashboard' },
  { id: 'tasks',     label: 'Tasks',       icon: 'CheckSquare' },
  { id: 'scores',    label: 'Điểm KPI',    icon: 'Award' },
  { id: 'schedule',  label: 'Lịch họp',    icon: 'Calendar' },
  { id: 'cnb',       label: 'C&B',         icon: 'Wallet' },
  { id: 'profile',   label: 'Hồ sơ',       icon: 'User' },
]

const PAGE_META: Record<Page, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard',        sub: 'Tổng quan hoạt động của bạn' },
  tasks:     { title: 'Tasks của tôi',    sub: 'Quản lý và cập nhật tiến độ' },
  scores:    { title: 'Điểm KPI',         sub: 'Lịch sử chấm điểm' },
  schedule:  { title: 'Vote lịch họp',    sub: 'Chọn khung giờ phù hợp' },
  cnb:       { title: 'C&B',              sub: 'Phúc lợi & khấu trừ' },
  profile:   { title: 'Hồ sơ cá nhân',   sub: 'Thông tin & cài đặt' },
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
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Icon name="Sparkles" size={18} color="#FFFFFF" />
          </div>
          <div>
            <div className="logo-text">Enactus FTU</div>
            <div className="logo-sub">Member Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu chính</div>
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon} size={18} className="nav-icon" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="user-chip" onClick={() => onNavigate('profile')}>
            <div className="avatar avatar-sm">{member ? initials(member.name) : '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-chip-name">{member?.name}</div>
              <div className="user-chip-role">{(member as any)?.department || member?.role}</div>
            </div>
            <Icon name="ChevronRight" size={14} color="var(--text-tertiary)" />
          </button>
          <button className="logout-btn" onClick={logout}>
            <Icon name="LogOut" size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Thông báo">
              <Icon name="Bell" size={18} />
              <span className="notif-dot" />
            </button>
            <div
              className="avatar avatar-md"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('profile')}
            >
              {member ? initials(member.name) : '?'}
            </div>
          </div>
        </header>

        <div className="page">
          <div className="page-enter">{children}</div>
        </div>
      </div>
    </div>
  )
}