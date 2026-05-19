import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ phone: '', bio: '' })

  useEffect(() => {
    Promise.all([
      api<any>('/members/profile'),
      api<any[]>('/badges/my')
    ]).then(([profileData, badgesData]) => {
      setProfile(profileData)
      setForm({ phone: profileData?.phone || '', bio: profileData?.bio || '' })
      setBadges(Array.isArray(badgesData) ? badgesData : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = await api('/members/profile', { method: 'PATCH', body: form })
      setProfile(updated)
      setEditing(false)
      alert('Cập nhật thành công!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!profile) return <div className="empty">Không tìm thấy thông tin</div>

  return (
    <div>
      <h2 className="page-title">Hồ sơ cá nhân</h2>
      
      <div className="g2">
        {/* Main Profile Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(135deg, #FFC107, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>
            {profile.name?.charAt(0) || '👤'}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{profile.name}</h3>
          <p style={{ color: 'var(--text-3)', marginBottom: 8 }}>@{profile.username}</p>
          <p className="badge b-blue" style={{ display: 'inline-block' }}>{profile.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
        </div>

        {/* Contact & Bio */}
        <div className="card">
          {!editing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Thông tin liên hệ</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Sửa</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-4)' }}>📱 Điện thoại</div>
                <div>{profile.phone || 'Chưa cập nhật'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-4)' }}>📝 Giới thiệu</div>
                <div>{profile.bio || 'Chưa có giới thiệu'}</div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-4)' }}>📧 Email</div>
                <div>{profile.email}</div>
              </div>
            </>
          ) : (
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label className="label">📱 Điện thoại</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">📝 Giới thiệu</label>
                <textarea className="textarea" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          )}
        </div>

        {/* Stats */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📊 Thống kê</h3>
          <div className="g2">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{profile.total_points || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Tổng điểm</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{profile.completed_tasks || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Task hoàn thành</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{badges.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Huy hiệu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏆 Huy hiệu đã đạt được</h3>
          <div className="g3">
            {badges.map(badge => (
              <div key={badge.id} style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px', background: badge.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${badge.color}40` }}>
                  {badge.icon}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}