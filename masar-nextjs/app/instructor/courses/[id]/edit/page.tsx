'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [courseId, setCourseId] = useState<string>('')

  useEffect(() => { params.then(p => setCourseId(p.id)) }, [params])

  useEffect(() => {
    if (!token || !courseId) return
    Promise.all([
      fetch(`/api/instructor/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([cData, catData]) => {
      if (cData.success) setCourse(cData.data.course)
      if (catData.success) setCategories(catData.data.categories || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token, courseId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    const form = new FormData(e.target as HTMLFormElement)
    const body: any = {}
    form.forEach((v, k) => { if (v) body[k] = v })
    body.learningPoints = (body.learningPoints || '').split('\n').filter(Boolean)
    body.requirements = (body.requirements || '').split('\n').filter(Boolean)
    delete body['']
    const res = await fetch(`/api/instructor/courses/${courseId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) { setMsg('تم الحفظ'); setCourse(data.data.course) }
    else setMsg(data.error || 'خطأ')
    setSaving(false)
  }

  const handlePublish = async (status: string) => {
    const res = await fetch(`/api/instructor/courses/${courseId}/publish`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) { setMsg(data.data.message); setCourse((p: any) => ({ ...p, status })) }
    else setMsg(data.error || 'خطأ')
  }

  if (!user) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">يرجى تسجيل الدخول</div>
  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">جاري التحميل...</div>
  if (!course) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">الكورس غير موجود</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/instructor" className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-arrow-right"></i></Link>
        <h1 className="text-2xl font-extrabold text-gray-900">تعديل: {course.title}</h1>
      </div>

      {msg && <div className={`p-3 rounded-lg mb-4 text-sm text-center ${msg.includes('تم') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div><label className="block text-sm font-semibold mb-1">العنوان</label><input name="title" defaultValue={course.title} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">الوصف</label><textarea name="description" defaultValue={course.description || ''} rows={4} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">السعر</label><input name="price" defaultValue={course.price} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">السعر القديم</label><input name="oldPrice" defaultValue={course.oldPrice} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold mb-1">المستوى</label><select name="level" defaultValue={course.level} className="w-full px-4 py-2.5 border rounded-lg text-sm"><option>جميع المستويات</option><option>مبتدئ</option><option>متوسط</option><option>متقدم</option></select></div>
          <div><label className="block text-sm font-semibold mb-1">التصنيف</label><select name="categoryId" defaultValue={course.categoryId || ''} className="w-full px-4 py-2.5 border rounded-lg text-sm"><option value="">اختر</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-semibold mb-1">رابط الصورة</label><input name="image" defaultValue={course.image} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">الوسم</label><input name="tag" defaultValue={course.tag} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">المدة</label><input name="duration" defaultValue={course.duration} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">نقاط التعلم (سطر لكل نقطة)</label><textarea name="learningPoints" defaultValue={(course.learningPoints || []).join('\n')} rows={3} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>
        <div><label className="block text-sm font-semibold mb-1">المتطلبات (سطر لكل مطلب)</label><textarea name="requirements" defaultValue={(course.requirements || []).join('\n')} rows={3} className="w-full px-4 py-2.5 border rounded-lg text-sm" /></div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'جاري...' : 'حفظ التغييرات'}
          </button>
          {course.status === 'draft' && (
            <button type="button" onClick={() => handlePublish('pending')} className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-600">
              طلب نشر الكورس
            </button>
          )}
          {course.status === 'approved' && (
            <button type="button" onClick={() => handlePublish('archived')} className="bg-slate-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800">
              أرشفة الكورس
            </button>
          )}
          {course.status === 'rejected' && (
            <button type="button" onClick={() => handlePublish('draft')} className="bg-gray-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-700">
              إعادة للتعديل
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
