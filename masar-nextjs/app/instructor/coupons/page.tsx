'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'

interface Coupon {
  id: number
  code: string
  description: string
  discountType: string
  discountValue: number
  minPurchase: number
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
  createdAt: string
  course: { id: number; title: string } | null
}

interface Course {
  id: number
  title: string
}

export default function InstructorCouponsPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minPurchase: '', maxUses: '', courseId: '', expiresAt: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchCoupons()
    fetchCourses()
  }, [user])

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setCoupons(data.data.coupons)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setCourses(data.data.courses || [])
    } catch (e) { console.error(e) }
  }

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          discountValue: parseFloat(form.discountValue),
          minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          courseId: form.courseId ? parseInt(form.courseId) : null,
          expiresAt: form.expiresAt || null,
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxUses: '', courseId: '', expiresAt: '' })
        fetchCoupons()
      } else {
        alert(data.error)
      }
    } catch (e) { console.error(e) }
    setSubmitting(false)
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>جاري التحميل...</p></div>

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">كوبونات الخصم</h1>
            <p className="text-gray-500 mt-1">إنشاء وإدارة كوبونات الخصم لكورساتك</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            إنشاء كوبون
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الكود</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الخصم</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الكورس</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الاستخدام</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الانتهاء</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-mono font-bold">{c.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{c.course?.title || 'جميع الكورسات'}</td>
                  <td className="px-6 py-4 text-gray-600">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('ar-EG') : 'بدون انتهاء'}
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">لا توجد كوبونات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">إنشاء كوبون خصم</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود الخصم</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="مثال: SALE20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="وصف الكوبون..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="percentage">نسبة مئوية</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder={form.discountType === 'percentage' ? '10' : '5'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكورس (اختياري - لتطبيق على كورس محدد)</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">جميع الكورسات</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للشراء ($)</label>
                    <input
                      type="number"
                      value={form.minPurchase}
                      onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للاستخدام</label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="بدون حد"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={submitting || !form.code || !form.discountValue}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
