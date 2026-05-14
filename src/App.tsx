import { useState, useEffect, createContext, useContext } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { ScoresPage } from './pages/ScoresPage'
import { SchedulePage } from './pages/SchedulePage'
import { ProfilePage } from './pages/ProfilePage'
import { CnbPage } from './pages/CnbPage'
import { Layout } from './components/Layout'
import { api, Member } from './lib/api'

type AuthCtx = { 
  member: Member | null; 
  token: string | null; 
  login: (token: string, refresh: string, member: Member) => void; 
  logout: () => void; 
  updateMember: (member: Member) => void 
}

export const AuthContext = createContext<AuthCtx>({ 
  member: null, token: null, login: () => {}, logout: () => {}, updateMember: () => {} 
})
export const useAuth = () => useContext(AuthContext)

type Page = 'dashboard' | 'tasks' | 'scores' | 'schedule' | 'cnb' | 'profile'

function AppContent() {
  const [member, setMember] = useState<Member | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    const storedMember = localStorage.getItem('member')
    if (storedToken && storedMember) {
      setToken(storedToken)
      setMember(JSON.parse(storedMember))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!token) return
    api<Member>('/auth/me', { token }).then((freshMember) => {
      setMember(freshMember)
      localStorage.setItem('member', JSON.stringify(freshMember))
    }).catch(() => {
      localStorage.clear(); setToken(null); setMember(null)
    })
  }, [token])

  const login = (accessToken: string, refreshToken: string, m: Member) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('member', JSON.stringify(m))
    setToken(accessToken)
    setMember(m)
  }

  const updateMember = (updated: Member) => {
    localStorage.setItem('member', JSON.stringify(updated))
    setMember(updated)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try { await api('/auth/logout', { method: 'POST', body: { refreshToken }, token: token || '' }) } catch {}
    localStorage.clear()
    setToken(null)
    setMember(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC107]" />
    </div>
  )

  if (!member || !token) {
    return (
      <AuthContext.Provider value={{ member, token, login, logout, updateMember }}>
        <LoginPage />
      </AuthContext.Provider>
    )
  }

  const pages: Record<Page, JSX.Element> = {
    dashboard: <DashboardPage />,
    tasks:     <TasksPage />,
    scores:    <ScoresPage />,
    schedule:  <SchedulePage />,
    cnb:       <CnbPage />,
    profile:   <ProfilePage />,
  }

  return (
    <AuthContext.Provider value={{ member, token, login, logout, updateMember }}>
      <Layout page={page} onNavigate={setPage}>
        {pages[page]}
      </Layout>
    </AuthContext.Provider>
  )
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContent />
    </GoogleOAuthProvider>
  )
}