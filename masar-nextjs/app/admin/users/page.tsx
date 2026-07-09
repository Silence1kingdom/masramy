'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function AdminUsersPage() {
  const { user, token } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [tab, setTab] = useState<'users' | 'courses'>('users')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = () => {
    if (!token) return
    setLoading(true)
    const u = fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    const c = fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    Promise.all([u, c]).then(([ud, cd]) => {
      if (ud.success) setUsers(ud.data.users)
      if (cd.success) setCourses(cd.data.courses)
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [token])

  const changeRole = async (userId: number, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role }),
    })
    const d = await res.json()
    setMsg(d.data?.message || d.error || '')
    if (d.success) load()
  }

  const changeCourseStatus = async (courseId: number, status: string) => {
    const res = await fetch(`/api/admin/courses/${courseId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    const d = await res.json()
    setMsg(d.data?.message || d.error || '')
    if (d.success) load()
  }

  if (!user || user.role !== 'admin') return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">ليس لديك صلاحية</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm mb-4 inline-block"><i className="fa-solid fa-arrow-right ml-1"></i> العودة</Link>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">إدارة المنصة</h1>

      {msg && <div className="p-3 rounded-lg mb-4 text-sm text-center bg-indigo-50 text-indigo-600">{msg}</div>}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('users')} className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <i className="fa-solid fa-users ml-1"></i> المستخدمين ({users.length})
        </button>
        <button onClick={() => setTab('courses')} className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${tab === 'courses' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <i className="fa-solid fa-book ml-1"></i> الكورسات ({courses.length})
        </button>
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">جاري التحميل...</div> : tab === 'users' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-right p-4 font-semibold">الاسم</th><th className="text-right p-4 font-semibold">البريد</th><th className="text-right p-4 font-semibold">الدور</th><th className="text-right p-4 font-semibold">التسجيلات</th><th className="text-right p-4 font-semibold">تاريخ الانضمام</th><th className="text-right p-4 font-semibold">إجراءات</th></tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-semibold">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'instructor' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? 'مدير' : u.role === 'instructor' ? 'مدرب' : 'طالب'}
                    </span>
                  </td>
                  <td className="p-4">{u._count?.enrollments || 0}</td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    {u.id !== user.id && (
                      <select onChange={e => changeRole(u.id, e.target.value)} defaultValue={u.role} className="text-xs border rounded px-2 py-1">
                        <option value="student">طالب</option><option value="instructor">مدرب</option><option value="admin">مدير</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="text-right p-4 font-semibold">الكورس</th><th className="text-right p-4 font-semibold">المدرب</th><th className="text-right p-4 font-semibold">الحالة</th><th className="text-right p-4 font-semibold">المسجلين</th><th className="text-right p-4 font-semibold">إجراءات</th></tr>
            </thead>
            <tbody>
              {courses.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-semibold">{c.title}</td>
                  <td className="p-4 text-gray-500">{c.instructorUser?.name || c.instructor}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : c.status === 'pending' ? 'bg-amber-100 text-amber-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status === 'draft' ? 'مسودة' : c.status === 'pending' ? 'قيد المراجعة' : c.status === 'approved' ? 'منشور' : c.status === 'rejected' ? 'مرفوض' : c.status}
                    </span>
                  </td>
                  <td className="p-4">{c._count?.enrollments || 0}</td>
                  <td className="p-4">
                    {c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => changeCourseStatus(c.id, 'approved')} className="bg-emerald-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-emerald-600">موافقة</button>
                        <button onClick={() => changeCourseStatus(c.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600">رفض</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
