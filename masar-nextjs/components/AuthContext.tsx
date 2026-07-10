'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'

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
  const fetchedMeRef = useRef<string | null>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const setAuthCookie = useCallback((tokenValue: string) => {
    document.cookie = `accessToken=${tokenValue}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  }, [])

  const clearAuthCookie = useCallback(() => {
    document.cookie = 'accessToken=; path=/; max-age=0'
  }, [])

  const fetchUser = useCallback(async (tokenValue: string) => {
    if (fetchedMeRef.current === tokenValue) return
    fetchedMeRef.current = tokenValue
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenValue}` }
      })
      const data = await res.json()
      if (data.success && data.data?.user) {
        const u = data.data.user as User
        setUser(prev => {
          const updated = { ...prev, ...u } as User
          localStorage.setItem('user', JSON.stringify(updated))
          return updated
        })
      } else {
        logout()
      }
    } catch {
      fetchedMeRef.current = null
    }
  }, [])

  const scheduleRefresh = useCallback((refreshToken: string, currentToken: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]))
      const expiresIn = (payload.exp * 1000) - Date.now()
      const refreshIn = Math.max(expiresIn - 60 * 60 * 1000, 60 * 1000)

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })
          const data = await res.json()
          if (data.success && data.data) {
            localStorage.setItem('accessToken', data.data.accessToken)
            localStorage.setItem('refreshToken', data.data.refreshToken)
            setToken(data.data.accessToken)
            setAuthCookie(data.data.accessToken)
            fetchedMeRef.current = null
            scheduleRefresh(data.data.refreshToken, data.data.accessToken)
          } else {
            logout()
          }
        } catch {
          logout()
        }
      }, refreshIn)
    } catch {
      logout()
    }
  }, [setAuthCookie])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isGoogleAuth = params.get('google_auth') === 'true'

    if (isGoogleAuth) {
      window.history.replaceState({}, '', window.location.pathname)
      fetch('/api/auth/me').then(r => r.json()).then(data => {
        if (data.success && data.data?.user) {
          setUser(data.data.user)
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
      }).catch(() => {})
      return
    }

    const savedToken = localStorage.getItem('accessToken')
    const savedRefresh = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setToken(savedToken)
        setAuthCookie(savedToken)

        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]))
          if (payload.exp && payload.exp * 1000 < Date.now()) {
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
                  scheduleRefresh(data.data.refreshToken, data.data.accessToken)
                } else {
                  logout()
                }
              }).catch(() => {})
            } else {
              logout()
            }
          } else {
            if (savedRefresh) scheduleRefresh(savedRefresh, savedToken)
          }
        } catch {
          logout()
        }
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return
    fetchUser(token)
  }, [token, fetchUser])

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  const saveAuth = useCallback((userData: User, accessToken: string, refreshToken?: string) => {
    setUser(userData)
    setToken(accessToken)
    fetchedMeRef.current = null
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    setAuthCookie(accessToken)
    if (refreshToken) scheduleRefresh(refreshToken, accessToken)
  }, [setAuthCookie, scheduleRefresh])

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

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    fetchedMeRef.current = null
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    clearAuthCookie()
  }, [clearAuthCookie])

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
