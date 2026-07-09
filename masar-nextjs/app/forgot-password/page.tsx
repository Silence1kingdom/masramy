'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setMsg(data.data?.message || 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني')
      } else {
        setMsg(data.error || 'حدث خطأ')
      }
    } catch {
      setMsg('حدث خطأ في الاتصال')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-key text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
          <p className="text-gray-500 text-sm mt-2">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition text-sm disabled:opacity-50">
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition inline-block">
              العودة للرئيسية
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-indigo-600 text-sm font-semibold">
            <i className="fa-solid fa-arrow-right ml-1"></i> العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
