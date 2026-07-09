'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if (password !== confirmPassword) {
      setMsg('كلمتا المرور غير متطابقتين')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setMsg('تم إعادة تعيين كلمة المرور بنجاح')
      } else {
        setMsg(data.error || 'حدث خطأ')
      }
    } catch {
      setMsg('حدث خطأ في الاتصال')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">رابط غير صالح</h1>
          <p className="text-gray-500 text-sm mb-6">رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية</p>
          <Link href="/forgot-password" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition inline-block">
            طلب رابط جديد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-shield-halved text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-500 text-sm mt-2">أدخل كلمة المرور الجديدة</p>
        </div>

        {msg && (
          <div className={`p-3 rounded-lg mb-4 text-sm text-center ${
            success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {msg}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تأكيد كلمة المرور</label>
              <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition text-sm disabled:opacity-50">
              {loading ? 'جاري...' : 'إعادة تعيين كلمة المرور'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition inline-block">
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="text-gray-400">جاري التحميل...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
