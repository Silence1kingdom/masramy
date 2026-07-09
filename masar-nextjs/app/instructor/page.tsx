'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function InstructorPage() {
  const { user, token } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', oldPrice: '', level: 'جميع المستويات', image: '', categoryId: '' })
  const [categories, setCategories] = useState<any[]>([])
  const [earningsSummary, setEarningsSummary] = useState<any>(null)
  useEffect(() => {
    if (!token) return
    Promise.all([
      fetch('/api/instructor/courses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/instructor/earnings?limit=1', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([coursesData, catData, earningsData]) => {
      if (coursesData.success) setCourses(coursesData.data.courses)
      if (catData.success) setCategories(catData.data.categories || [])
      if (earningsData.success) setEarningsSummary(earningsData.data.summary)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/instructor/courses', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setCourses(prev => [data.data.course, ...prev])
      setShowCreate(false)
      setForm({ title: '', description: '', price: '', oldPrice: '', level: 'جميع المستويات', image: '', categoryId: '' })
    }
  }

  if (!user) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">يرجى تسجيل الدخول</div>

  const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', archived: 'bg-slate-100 text-slate-600' }
  const statusLabels: Record<string, string> = { draft: 'مسودة', pending: 'قيد المراجعة', approved: 'منشور', rejected: 'مرفوض', archived: 'مؤرشف' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900"><i className="fa-solid fa-chalkboard-user ml-2 text-indigo-600"></i>منصة التدريس</h1>
          <p className="text-gray-500 text-sm mt-1">مرحباً {user.name}، قم بإدارة كورساتك</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> كورس جديد
        </button>
      </div>

      {earningsSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-gray-500">إجمالي المبيعات</p>
            <p className="text-xl font-bold text-gray-900 mt-1">${earningsSummary.totalSales?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-gray-500">صافي الأرباح</p>
            <p className="text-xl font-bold text-green-600 mt-1">${earningsSummary.totalEarnings?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-gray-500">المتاح للسحب</p>
            <p className="text-xl font-bold text-blue-600 mt-1">${earningsSummary.settledEarnings?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-gray-500">المعاملات</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{earningsSummary.totalTransactions || 0}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/instructor/earnings" className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition">
          <i className="fa-solid fa-money-bill-wave ml-1"></i> الأرباح
        </Link>
        <Link href="/instructor/analytics" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
          <i className="fa-solid fa-chart-line ml-1"></i> التحليلات
        </Link>
        <Link href="/instructor/coupons" className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 transition">
          <i className="fa-solid fa-ticket ml-1"></i> الكوبونات
        </Link>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowCreate(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><i className="fa-solid fa-xmark text-xl"></i></button>
            <h2 className="text-xl font-bold mb-6">إنشاء كورس جديد</h2>
            <form onSubmit={createCourse} className="space-y-4">
              <div><label className="block text-sm font-semibold mb-1">عنوان الكورس</label><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-semibold mb-1">وصف الكورس</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">السعر</label><input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="$49" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-semibold mb-1">السعر القديم</label><input value={form.oldPrice} onChange={e => setForm(p => ({ ...p, oldPrice: e.target.value }))} placeholder="$99" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">المستوى</label><select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className="w-full px-4 py-2.5 border rounded-lg text-sm"><option>جميع المستويات</option><option>مبتدئ</option><option>متوسط</option><option>متقدم</option></select></div>
                <div><label className="block text-sm font-semibold mb-1">التصنيف</label><select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="w-full px-4 py-2.5 border rounded-lg text-sm"><option value="">اختر تصنيفاً</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-semibold mb-1">رابط الصورة</label><input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700">إنشاء الكورس</button>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">جاري التحميل...</div> : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <i className="fa-solid fa-chalkboard text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 font-semibold">لا توجد كورسات بعد</p>
          <p className="text-gray-400 text-sm mt-1">أنشئ أول كورس لك الآن</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
              {course.image && <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[course.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[course.status] || course.status}
                  </span>
                  <span className="text-xs text-gray-400">{course._count?.enrollments || 0} طالب</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{course.sections?.length || 0} أقسام | {course.sections?.reduce((a: number, s: any) => a + (s.lectures?.length || 0), 0) || 0} محاضرة</p>
                <div className="flex gap-2">
                  <Link href={`/instructor/courses/${course.id}/curriculum`} className="flex-1 text-center bg-indigo-50 text-indigo-600 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-100">
                    <i className="fa-solid fa-list ml-1"></i> المحتوى
                  </Link>
                  <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1 text-center bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100">
                    <i className="fa-solid fa-pen ml-1"></i> تعديل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
