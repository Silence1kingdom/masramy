'use client'

import { useAuth } from '@/components/AuthContext'
import { useAuthModal } from '@/components/AuthModal'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (!token) return
    fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.success && d.data && setEnrollments(d.data.enrollments)).catch(() => {})
    fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.success && d.data && setWishlist(d.data.wishlist)).catch(() => {})
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.success && d.data && setOrders(d.data.orders)).catch(() => {})
  }, [token])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <i className="fa-solid fa-lock text-5xl text-gray-300 mb-4"></i>
        <h1 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h1>
        <button onClick={() => openAuthModal(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">تسجيل الدخول</button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          <i className="fa-solid fa-gauge-high ml-2 text-indigo-600"></i>لوحة التحكم
        </h1>
        <span className="text-gray-500 text-sm">{user.name} <i className="fa-solid fa-user ml-1"></i></span>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-indigo-600">{enrollments.length}</p>
          <p className="text-gray-500 text-sm">الكورسات المسجلة</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-emerald-600">{wishlist.length}</p>
          <p className="text-gray-500 text-sm">المفضلة</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-amber-600">{orders.length}</p>
          <p className="text-gray-500 text-sm">الطلبات</p>
        </div>
        <Link href="/student/certificates" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <p className="text-3xl font-extrabold text-purple-600"><i className="fa-solid fa-certificate"></i></p>
          <p className="text-gray-500 text-sm">شهاداتي</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">كورساتي</h2>
          {enrollments.length === 0 ? (
            <p className="text-gray-400 text-sm">لم تسجل في أي كورس بعد</p>
          ) : (
            enrollments.map((e: any) => (
              <div key={e.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-gray-700">{e.course?.title || `كورس #${e.courseId}`}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${e.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {e.completed ? 'مكتمل' : `${e.progress}%`}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">المفضلة</h2>
          {wishlist.length === 0 ? (
            <p className="text-gray-400 text-sm">لا توجد كورسات في المفضلة</p>
          ) : (
            wishlist.map((w: any) => (
              <div key={w.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <Link href={`/courses/${w.courseId}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  {w.course?.title || `كورس #${w.courseId}`}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
