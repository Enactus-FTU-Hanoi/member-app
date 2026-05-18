import { useState } from 'react'
import { useAuth } from '../App'
import { api, Member, statusLabel, roleLabel, fmtDate } from '../lib/api'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
}

export function ProfilePage() {
  const { member: authMember } = useAuth()
  const [member] = useState<Member | null>(authMember as Member | null)
  const [form, setForm] = useState({
    name:     authMember?.name     || '',
    phone:    (authMember as any)?.phone    || '',
    bio:      (authMember as any)?.bio      || '',
    facebook_url: (authMember as any)?.facebook_url || '',
    linkedin_url: (authMember as any)?.linkedin_url || '',
  })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api(`/members/${authMember?.id}`, { method: 'PATCH', body: form })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const INFO_ROWS = [
    { label: 'Email',       value: authMember?.email },
    { label: 'Department',  value: (authMember as any)?.department },
    { label: 'Năm khoá',   value: (authMember as any)?.generation },
    { label: 'MSSV',        value: (authMember as any)?.student_id },
    { label: 'Ngày sinh',   value: (authMember as any)?.dob ? fmtDate((authMember as any).dob) : undefined },
    { label: 'Tham gia',    value: authMember?.joined_at ? fmtDate(authMember.joined_at) : undefined },
  ].filter(r => r.value)

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Banner + avatar */}
      <div style={{
        height: 160, borderRadius: 'var(--r-lg)', marginBottom: 64, position: 'relative',
        background: 'linear-gradient(135deg, #E8192C 0%, #FFC107 100%)',
        overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', bottom: -48, left: 28,
          width: 88, height: 88, borderRadius: '50%',
          background: 'var(--amber-soft)',
          border: '4px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: '#92570A',
          boxShadow: 'var(--shadow-md)',
        }}>
          {authMember ? initials(authMember.name) : '?'}
        </div>

        {/* Role + status badges */}
        <div style={{ position: 'absolute', bottom: -36, right: 24, display: 'flex', gap: 8 }}>
          <span className={`badge ${roleLabel[authMember?.role as keyof typeof roleLabel] ? 'b-purple' : 'b-gray'}`}>
            {roleLabel[authMember?.role as keyof typeof roleLabel] || authMember?.role}
          </span>
          <span className={`badge status-${(authMember as any)?.status || 'ACTIVE'}`}>
            {statusLabel[(authMember as any)?.status as keyof typeof statusLabel] || 'Đang hoạt động'}
          </span>
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{authMember?.name}</h2>
      <p style={{ color: 'var(--text-3)', fontSize: 13.5, marginBottom: 28 }}>{authMember?.email}</p>

      <div className="g2" style={{ alignItems: 'flex-start' }}>
        {/* Info readonly */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Thông tin cơ bản</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INFO_ROWS.map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editable form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Chỉnh sửa hồ sơ</div>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="label">Họ và tên</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Số điện thoại</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0912 345 678" />
            </div>
            <div className="form-group">
              <label className="label">Facebook URL</label>
              <input className="input" value={form.facebook_url} onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." />
            </div>
            <div className="form-group">
              <label className="label">LinkedIn URL</label>
              <input className="input" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="form-group">
              <label className="label">Giới thiệu bản thân</label>
              <textarea className="textarea" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Viết vài dòng về bản thân..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Đang lưu...</>
                : success ? '✓ Đã lưu!'
                : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
