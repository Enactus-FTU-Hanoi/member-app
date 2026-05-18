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
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const FEATURES = [
    { icon: '◈', text: 'Theo dõi điểm KPI & task' },
    { icon: '◷', text: 'Vote lịch họp, lịch rảnh' },
    { icon: '◎', text: 'Xem C&B & thông báo nội bộ' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* Left panel – dark brand */}
      <div style={{
        width: '44%', minWidth: 360,
        background: 'var(--sidebar-bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 52, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60,  right: -60,  width: 260, height: 260, borderRadius: '50%', background: 'rgba(232,25,44,.12)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40,  width: 200, height: 200, borderRadius: '50%', background: 'rgba(232,25,44,.07)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', textAlign: 'center', width: '100%', maxWidth: 320 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 800, color: '#fff',
            margin: '0 auto 24px',
            boxShadow: '0 8px 28px var(--red-glow)',
          }}>E</div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-on-dark)', marginBottom: 8 }}>
            Enactus FTU Hanoi
          </h1>
          <p style={{ color: 'var(--text-on-dark-sub)', fontSize: 14, lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>
            Hệ thống quản lý nội bộ dành cho thành viên CLB
          </p>

          <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'rgba(232,25,44,.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FCA5AD', fontSize: 15,
                }}>{f.icon}</div>
                <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Đăng nhập</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 32 }}>
            Dùng email CLB của bạn để truy cập
          </p>

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
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 'var(--r-sm)', padding: '10px 14px',
                fontSize: 13.5, color: '#B91C1C', marginBottom: 14,
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 6, padding: '11px 18px', fontSize: 14.5 }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 17, height: 17, borderWidth: 2 }} /> Đang đăng nhập...</>
                : 'Đăng nhập →'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-4)', textAlign: 'center' }}>
            Chưa có tài khoản? Liên hệ Ban Tổ chức để được cấp.
          </p>
        </div>
      </div>
    </div>
  )
}
