'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <i className="fa-solid fa-lock text-5xl text-gray-300 mb-4"></i>
        <h1 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h1>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">العودة للرئيسية</Link>
      </div>
    )
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveMsg('')

    try {
      let avatarUrl = user.avatar || ''

      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const avatarRes = await fetch('/api/auth/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const avatarData = await avatarRes.json()
        if (!avatarData.success) {
          setSaveMsg(avatarData.error || 'حدث خطأ أثناء رفع الصورة')
          setSaveLoading(false)
          return
        }
        avatarUrl = avatarData.data.avatar
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, avatar: avatarUrl }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser(data.data.user)
        setSaveMsg('تم حفظ التغييرات بنجاح')
      } else {
        setSaveMsg(data.error || 'حدث خطأ')
      }
    } catch {
      setSaveMsg('حدث خطأ في الاتصال')
    }
    setSaveLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg('')

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setPwMsg('تم تغيير كلمة المرور بنجاح')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        setPwMsg(data.error || 'حدث خطأ')
      }
    } catch {
      setPwMsg('حدث خطأ في الاتصال')
    }
    setPwLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        <i className="fa-solid fa-user-pen ml-2 text-indigo-600"></i>
        الملف الشخصي
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user.name} className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold mx-auto">
                  {user.name?.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 left-0 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                <i className="fa-solid fa-camera text-sm"></i>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <Link href="/dashboard" className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
              <i className="fa-solid fa-gauge-high ml-1"></i> لوحة التحكم
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">
              <i className="fa-solid fa-pen-to-square ml-1 text-indigo-600"></i>
              تعديل البيانات
            </h3>
            {saveMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm text-center ${
                saveMsg.includes('بنجاح') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {saveMsg}
              </div>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">الاسم الكامل</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">نبذة عني</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="اكتب نبذة مختصرة عنك..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>
              <button type="submit" disabled={saveLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50">
                {saveLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">
              <i className="fa-solid fa-lock ml-1 text-indigo-600"></i>
              تغيير كلمة المرور
            </h3>
            {pwMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm text-center ${
                pwMsg.includes('بنجاح') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {pwMsg}
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور الحالية</label>
                <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <button type="submit" disabled={pwLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50">
                {pwLoading ? 'جاري...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
