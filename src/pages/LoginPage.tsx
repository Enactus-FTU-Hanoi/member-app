import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api<{ accessToken: string; refreshToken: string; member: any }>('/auth/login', {
        method: 'POST', body: { email, password },
      })
      login(res.accessToken, res.refreshToken, res.member)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg)',
    }}>
      {/* Left panel */}
      <div style={{
        width: '45%', minWidth: 380,
        background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(232,25,44,0.12)', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(232,25,44,0.07)', filter: 'blur(60px)',
        }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'var(--enactus-red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(232,25,44,0.35)',
          }}>E</div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#F2F0EC', marginBottom: 8 }}>
            Enactus FTU Hanoi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
            Hệ thống quản lý nội bộ dành cho thành viên CLB
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '◈', text: 'Theo dõi điểm KPI & task' },
              { icon: '◷', text: 'Vote lịch họp, lịch rảnh' },
              { icon: '◎', text: 'Xem C&B & thông báo nội bộ' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,25,44,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCA5AD', fontSize: 14, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Đăng nhập
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Dùng email CLB của bạn để truy cập
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ten@enactusftuhanoi.id.vn"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Mật khẩu</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ background: 'var(--enactus-red-light)', border: '1px solid var(--enactus-red-muted)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 14, color: 'var(--enactus-red-dark)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, padding: '12px 18px', fontSize: 15, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Đang đăng nhập...</> : 'Đăng nhập →'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            Chưa có tài khoản? Liên hệ Ban Tổ chức để được cấp.
          </p>
        </div>
      </div>
    </div>
  )
}
