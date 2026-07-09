'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuth()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courseId, setCourseId] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [editingSection, setEditingSection] = useState<any>(null)
  const [editingLecture, setEditingLecture] = useState<any>(null)
  const [newLecture, setNewLecture] = useState({ sectionId: 0, title: '', type: 'video', videoUrl: '', duration: '' })

  useEffect(() => { params.then(p => setCourseId(p.id)) }, [params])

  const load = () => {
    if (!token || !courseId) return
    fetch(`/api/instructor/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setCourse(d.data.course); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [token, courseId])

  const addSection = async () => {
    if (!newSectionTitle.trim()) return
    await fetch(`/api/instructor/courses/${courseId}/sections`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newSectionTitle }),
    })
    setNewSectionTitle('')
    load()
  }

  const deleteSection = async (id: number) => {
    if (!confirm('حذف القسم وجميع محاضراته؟')) return
    await fetch(`/api/instructor/sections/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  const addLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.sectionId) return
    await fetch(`/api/instructor/sections/${newLecture.sectionId}/lectures`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newLecture),
    })
    setNewLecture({ sectionId: 0, title: '', type: 'video', videoUrl: '', duration: '' })
    load()
  }

  const deleteLecture = async (id: number) => {
    if (!confirm('حذف المحاضرة؟')) return
    await fetch(`/api/instructor/lectures/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  if (!user) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">يرجى تسجيل الدخول</div>
  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">جاري التحميل...</div>
  if (!course) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">الكورس غير موجود</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/instructor" className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-arrow-right"></i></Link>
        <h1 className="text-2xl font-extrabold text-gray-900">محتوى: {course.title}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} placeholder="عنوان القسم الجديد..." className="flex-1 px-4 py-2.5 border rounded-lg text-sm" />
          <button onClick={addSection} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 flex items-center gap-1"><i className="fa-solid fa-plus"></i> إضافة قسم</button>
        </div>
      </div>

      <div className="space-y-4">
        {course.sections?.length === 0 && <div className="text-center py-10 text-gray-400">لا توجد أقسام بعد. أضف قسماً جديداً.</div>}
        {course.sections?.map((section: any, si: number) => (
          <div key={section.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{si + 1}</span>
                <h3 className="font-bold text-gray-900">{section.title}</h3>
              </div>
              <button onClick={() => deleteSection(section.id)} className="text-red-400 hover:text-red-600 text-sm"><i className="fa-solid fa-trash"></i></button>
            </div>
            <div className="p-4 space-y-2">
              {section.lectures?.map((lecture: any, li: number) => (
                <div key={lecture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <i className={`${lecture.type === 'video' ? 'fa-solid fa-video text-indigo-500' : 'fa-solid fa-file-lines text-emerald-500'} text-sm`}></i>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{li + 1}. {lecture.title}</p>
                      <p className="text-xs text-gray-400">{lecture.type === 'video' ? 'فيديو' : 'مقال'} {lecture.duration > 0 ? `| ${lecture.duration} د` : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteLecture(lecture.id)} className="text-red-400 hover:text-red-600 text-xs"><i className="fa-solid fa-xmark"></i></button>
                </div>
              ))}
              <div className="pt-2">
                {newLecture.sectionId === section.id ? (
                  <div className="border border-dashed border-gray-200 rounded-lg p-3 space-y-2">
                    <input value={newLecture.title} onChange={e => setNewLecture(p => ({ ...p, title: e.target.value }))} placeholder="عنوان المحاضرة" className="w-full px-3 py-2 border rounded text-sm" />
                    <div className="flex gap-2">
                      <select value={newLecture.type} onChange={e => setNewLecture(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded text-sm">
                        <option value="video">فيديو</option><option value="article">مقال</option>
                      </select>
                      {newLecture.type === 'video' && (
                        <input value={newLecture.videoUrl} onChange={e => setNewLecture(p => ({ ...p, videoUrl: e.target.value }))} placeholder="رابط الفيديو" className="flex-1 px-3 py-2 border rounded text-sm" />
                      )}
                      <input value={newLecture.duration} onChange={e => setNewLecture(p => ({ ...p, duration: e.target.value }))} placeholder="المدة (دقائق)" className="w-24 px-3 py-2 border rounded text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addLecture} className="bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-emerald-600">إضافة</button>
                      <button onClick={() => setNewLecture({ sectionId: 0, title: '', type: 'video', videoUrl: '', duration: '' })} className="text-gray-400 text-xs">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewLecture(p => ({ ...p, sectionId: section.id }))} className="text-indigo-600 text-xs font-semibold hover:text-indigo-800 flex items-center gap-1">
                    <i className="fa-solid fa-plus"></i> إضافة محاضرة
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
