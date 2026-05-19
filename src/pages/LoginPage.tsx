import { useState } from 'react'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api<{ accessToken: string; refreshToken: string; member: any }>('/auth/login', {
        method: 'POST', body: { email, password },
      })
      login(res.accessToken, res.refreshToken, res.member)
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      {/* Left — amber brand panel */}
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 300 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#B45309',
            margin: '0 auto 24px',
            boxShadow: '0 8px 28px rgba(0,0,0,.12)',
          }}>E</div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1000', marginBottom: 8 }}>
            Enactus FTU Hanoi
          </h1>
          <p style={{ color: 'rgba(0,0,0,.5)', fontSize: 14, lineHeight: 1.7 }}>
            Hệ thống quản lý nội bộ<br />dành cho thành viên CLB
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {[
              { icon: '📊', text: 'Theo dõi điểm KPI & task' },
              { icon: '📅', text: 'Vote lịch họp, xem C&B' },
              { icon: '🔔', text: 'Nhận thông báo nội bộ' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>{f.icon}</div>
                <span style={{ color: 'rgba(0,0,0,.55)', fontSize: 13.5, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Đăng nhập</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
              Dùng email CLB của bạn để truy cập
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ten@enactusftuhanoi.id.vn"
                required autoComplete="email"
                style={{ height: 44 }}
              />
            </div>

            <div className="form-group">
              <label className="label">Mật khẩu</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required autoComplete="current-password"
                style={{ height: 44 }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-lt)', border: '1px solid #FECACA',
                borderRadius: 'var(--r-sm)', padding: '10px 14px',
                fontSize: 13.5, color: 'var(--red)', marginBottom: 14,
              }}>⚠ {error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, height: 44, fontSize: 15, borderRadius: 'var(--r-sm)' }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 17, height: 17, borderWidth: 2 }} /> Đang đăng nhập...</>
                : 'Đăng nhập →'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-4)', textAlign: 'center' }}>
            Chưa có tài khoản? Liên hệ Ban Tổ chức.
          </p>
        </div>
      </div>
    </div>
  )
}
