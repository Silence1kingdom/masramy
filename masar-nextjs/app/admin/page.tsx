'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function AdminPage() {
  const { user, token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setData(d.data); setLoading(false) }).catch(() => setLoading(false))
  }, [token])

  if (!user || user.role !== 'admin') return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">ليس لديك صلاحية الوصول</div>
  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">جاري التحميل...</div>

  const { stats, courseStatuses, recentUsers, recentOrders } = data || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900"><i className="fa-solid fa-shield-halved ml-2 text-indigo-600"></i>لوحة الإدارة</h1>
        <div className="flex gap-3">
          <Link href="/admin/payouts" className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-100">
            <i className="fa-solid fa-money-bill-wave ml-1"></i> السحوبات
          </Link>
          <Link href="/admin/users" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50">
            <i className="fa-solid fa-users ml-1"></i> المستخدمين
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'المستخدمين', value: stats?.users || 0, color: 'text-indigo-600', icon: 'fa-users' },
          { label: 'الكورسات', value: stats?.courses || 0, color: 'text-emerald-600', icon: 'fa-book' },
          { label: 'المسجلين', value: stats?.enrollments || 0, color: 'text-amber-600', icon: 'fa-user-graduate' },
          { label: 'الطلبات', value: stats?.orders || 0, color: 'text-purple-600', icon: 'fa-cart-shopping' },
          { label: 'الإيرادات', value: stats?.revenue || '0', color: 'text-green-600', icon: 'fa-dollar-sign' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1"><i className={`fa-solid ${s.icon} ml-1`}></i>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">حالة الكورسات</h2>
          <div className="space-y-3">
            {(courseStatuses || []).map((cs: any) => (
              <div key={cs.status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{cs.status === 'draft' ? 'مسودة' : cs.status === 'pending' ? 'قيد المراجعة' : cs.status === 'approved' ? 'منشور' : cs.status === 'rejected' ? 'مرفوض' : cs.status}</span>
                <span className="font-bold text-lg">{cs._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">آخر الطلبات</h2>
          <div className="space-y-3">
            {(recentOrders || []).map((o: any) => (
              <div key={o.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold">{o.user?.name || '#' + o.userId}</p>
                  <p className="text-xs text-gray-400">{o.items?.[0]?.course?.title || ''}</p>
                </div>
                <span className="text-sm font-bold text-indigo-600">{o.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
