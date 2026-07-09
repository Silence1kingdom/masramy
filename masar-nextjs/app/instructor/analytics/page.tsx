'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function InstructorAnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    if (!user) return
    fetchAnalytics()
  }, [user, period])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/instructor/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await res.json()
      if (d.success) setData(d.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>يرجى تسجيل الدخول</p></div>
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">جاري التحميل...</div>
  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">حدث خطأ</div>

  const { summary, courseStats, monthlyData } = data
  const maxEarning = Math.max(...monthlyData.map((m: any) => m.earnings), 1)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التحليلات والإحصائيات</h1>
            <p className="text-gray-500 mt-1">نظرة شاملة على أداء كورساتك</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border rounded-lg px-4 py-2 text-sm">
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">آخر سنة</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-xs text-gray-500">إجمالي الطلاب</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{summary.totalStudents}</p>
            <p className="text-xs text-green-600 mt-1">+{summary.recentEnrollments} هذا الفترة</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-xs text-gray-500">صافي الأرباح</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${summary.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-1">+${summary.recentRevenue.toFixed(2)} هذا الفترة</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-xs text-gray-500">متوسط التقييم</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.avgRating} ⭐</p>
            <p className="text-xs text-gray-400 mt-1">{summary.totalReviews} تقييم</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-xs text-gray-500">الكورسات</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{summary.totalCourses}</p>
            <p className="text-xs text-gray-400 mt-1">عمولة المنصة: ${summary.totalCommission.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4">الإيرادات الشهرية</h2>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-indigo-100 rounded-t-lg relative" style={{ height: `${(m.earnings / maxEarning) * 100}%`, minHeight: '4px' }}>
                  <div className="absolute inset-0 bg-indigo-500 rounded-t-lg" style={{ height: `${(m.earnings / maxEarning) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{m.month}</p>
                <p className="text-xs font-semibold text-gray-700">${m.earnings.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-900">إحصائيات الكورسات</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الكورس</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الطلاب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">معدل الإكمال</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التقييم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الأرباح</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الجديد</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courseStats.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.image && <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <span className="font-medium text-gray-900 text-sm">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{c.totalStudents}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${c.completionRate}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-600">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{c.avgRating > 0 ? `${c.avgRating} ⭐` : '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">${c.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600">+{c.recentEnrollments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
