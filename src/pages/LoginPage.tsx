import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../App'
import { api } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useGoogle, setUseGoogle] = useState(false)

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    try {
      const res = await api<{ accessToken: string; refreshToken: string; member: any }>('/auth/google', {
        method: 'POST', body: { token: credentialResponse.credential },
      })
      login(res.accessToken, res.refreshToken, res.member)
    } catch (err: any) {
      setError('Đăng nhập Google thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FFC107] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-gray-900">E</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enactus FTU Hanoi</h1>
            <p className="text-gray-500 mt-1">Hệ thống quản lý thành viên</p>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setUseGoogle(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !useGoogle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setUseGoogle(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                useGoogle ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Google
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {useGoogle ? (
            <div className="flex justify-center py-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng nhập thất bại')}
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:border-transparent"
                  placeholder="ten@enactusftuhanoi.id.vn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFC107] text-gray-900 font-medium py-2 rounded-xl hover:bg-[#FFD54F] transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            Chỉ thành viên Enactus FTU Hanoi mới được đăng nhập
          </p>
        </div>
      </div>
    </div>
  )
}