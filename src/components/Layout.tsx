import { useAuth } from '../App'

type Page = 'dashboard' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'profile'

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⬡' },
  { id: 'tasks',     label: 'Tasks',        icon: '✓' },
  { id: 'scores',    label: 'Điểm KPI',     icon: '◈' },
  { id: 'schedule',  label: 'Lịch họp',     icon: '◷' },
  { id: 'cnb',       label: 'C&B',          icon: '◎' },
  { id: 'profile',   label: 'Hồ sơ',        icon: '◉' },
]

type Props = { page: Page; onNavigate: (p: Page) => void; children: React.ReactNode }

export function Layout({ page, onNavigate, children }: Props) {
  const { member, logout } = useAuth()

  const initials = member?.name
    .split(' ')
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--enactus-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff',
            }}>E</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#F2F0EC' }}>Enactus FTU</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Member Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', border: 'none', borderRadius: 'var(--radius-md)',
                background: page === item.id ? 'rgba(232,25,44,0.18)' : 'transparent',
                color: page === item.id ? '#FCA5AD' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: page === item.id ? 600 : 400,
                marginBottom: 2, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (page !== item.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (page !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 16, opacity: page === item.id ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => onNavigate('profile')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', border: 'none', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
              textAlign: 'left', marginBottom: 8,
            }}
          >
            {member?.photo_url ? (
              <img src={member.photo_url} alt={member.name} style={{ width: 30, height: 30, borderRadius: 999, objectFit: 'cover' }} />
            ) : (
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: 'var(--text-on-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {member?.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{member?.department || member?.role}</div>
            </div>
          </button>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '8px 12px', border: 'none', borderRadius: 'var(--radius-md)',
              background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              fontSize: 13, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
          >
            <span>⟵</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="page-enter" style={{ flex: 1, padding: '28px 32px', maxWidth: 1100 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
