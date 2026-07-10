'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface AuthModalContextType {
  openAuthModal: (isLogin?: boolean) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, register, googleLogin } = useAuth()

  const openAuthModal = (loginMode: boolean = true) => {
    setIsLogin(loginMode)
    setName('')
    setEmail('')
    setPassword('')
    setError('')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let err: string | null
    if (isLogin) {
      err = await login(email, password)
    } else {
      err = await register(name, email, password)
    }

    if (err) {
      setError(err)
      setLoading(false)
    } else {
      setIsOpen(false)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) {
        setError('حدث خطأ أثناء التسجيل بحساب Google')
        setGoogleLoading(false)
      }
    } catch {
      setError('حدث خطأ في الاتصال')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl animate-scale-up">
            <button 
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">{isLogin ? 'مرحباً بعودتك' : 'مرحباً بك في مسار'}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'سجل دخولك للوصول إلى مسيرتك التعليمية' : 'أنشئ حساباً وابدأ التعلم الآن'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'جاري...' : 'تسجيل الدخول بحساب Google'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-400">أو</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الاسم الكامل</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="محمد أحمد"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              {isLogin && (
                <div className="text-left">
                  <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition text-sm disabled:opacity-50">
                {loading ? 'جاري...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
              </button>
              <div className="text-center text-xs text-gray-400">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setError('') }}
                  className="text-indigo-600 font-semibold mr-1">
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) throw new Error('useAuthModal must be used within AuthModalProvider')
  return context
}
