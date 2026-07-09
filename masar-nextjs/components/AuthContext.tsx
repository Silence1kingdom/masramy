'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface User {
  id: number
  name: string
  email: string
  avatar?: string | null
  bio?: string | null
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<string | null>
  register: (name: string, email: string, password: string) => Promise<string | null>
  googleLogin: (accessToken: string) => Promise<string | null>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if returning from Google OAuth
    const params = new URLSearchParams(window.location.search)
    const googleToken = params.get('token')
    const googleRefresh = params.get('refresh')
    const isGoogleAuth = params.get('google_auth') === 'true'

    if (isGoogleAuth && googleToken) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)

      // Fetch user info from /api/auth/me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${googleToken}` }
      }).then(r => r.json()).then(data => {
        if (data.success && data.data?.user) {
          saveAuth(data.data.user, googleToken, googleRefresh || undefined)
        }
      }).catch(() => {})
      return
    }

    const savedToken = localStorage.getItem('accessToken')
    const savedRefresh = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))

      if (savedRefresh) {
        fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: savedRefresh })
        }).then(r => r.json()).then(data => {
          if (data.success && data.data) {
            localStorage.setItem('accessToken', data.data.accessToken)
            localStorage.setItem('refreshToken', data.data.refreshToken)
            setToken(data.data.accessToken)
            setAuthCookie(data.data.accessToken)
          }
        }).catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      if (data.success && data.data?.user) {
        const u = data.data.user
        setUser(prev => {
          const updated = { ...prev, ...u } as User
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
      }
    }).catch(() => {})
  }, [token])

  const setAuthCookie = (token: string) => {
    document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  }

  const clearAuthCookie = () => {
    document.cookie = 'accessToken=; path=/; max-age=0'
  }

  const saveAuth = useCallback((userData: User, accessToken: string, refreshToken?: string) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    setAuthCookie(accessToken)
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!data.success) return data.error
      saveAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      return null
    } catch {
      return 'حدث خطأ في الاتصال'
    }
  }

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!data.success) return data.error
      saveAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      return null
    } catch {
      return 'حدث خطأ في الاتصال'
    }
  }

  const googleLogin = async (accessToken: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      })
      const data = await res.json()
      if (!data.success) return data.error
      saveAuth(data.data.user, data.data.accessToken, data.data.refreshToken)
      return null
    } catch {
      return 'حدث خطأ في الاتصال'
    }
  }

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    clearAuthCookie()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, googleLogin, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
