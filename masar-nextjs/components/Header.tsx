'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useAuthModal } from './AuthModal'

interface Notification {
  id: number
  type: string
  title: string
  message: string | null
  read: boolean
  link: string | null
  createdAt: string
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (e) { console.error(e) }
  }

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationId: id })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) { console.error(e) }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAll: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (e) { console.error(e) }
  }

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-3xl"></i>
                أكاديمية مَسار
              </span>
            </Link>

            <nav className="hidden md:flex space-x-reverse space-x-8">
              <Link href="/" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">الرئيسية</Link>
              <Link href="/courses" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">الكورسات</Link>
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">عن المنصة</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 font-semibold transition-colors">اتصل بنا</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link href="/instructor" className="text-amber-600 hover:text-amber-700 text-sm font-semibold transition">
                      <i className="fa-solid fa-chalkboard-user ml-1"></i>
                      تدريس
                    </Link>
                  )}
                  {user.role === 'instructor' && (
                    <Link href="/instructor/earnings" className="text-green-600 hover:text-green-700 text-sm font-semibold transition">
                      <i className="fa-solid fa-money-bill-wave ml-1"></i>
                      الأرباح
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition">
                      <i className="fa-solid fa-shield-halved ml-1"></i>
                      إدارة
                    </Link>
                  )}
                  <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 text-sm font-semibold transition">
                    <i className="fa-solid fa-gauge-high ml-1"></i>
                    لوحة التحكم
                  </Link>

                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative text-gray-600 hover:text-indigo-600 transition p-2"
                    >
                      <i className="fa-solid fa-bell text-lg"></i>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                          <h3 className="font-bold text-gray-900">الإشعارات</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-700">
                              قراءة الكل
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">لا توجد إشعارات</div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => !n.read && markAsRead(n.id)}
                                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-indigo-50' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                    {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('ar-EG')}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link href="/profile" className="text-gray-600 hover:text-indigo-600 text-sm font-semibold transition flex items-center gap-1.5">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {user.name?.charAt(0)}
                      </div>
                    )}
                    {user.name}
                  </Link>
                  <button onClick={logout} className="text-gray-500 hover:text-red-600 text-sm font-semibold transition">
                    <i className="fa-solid fa-sign-out-alt"></i>
                  </button>
                </div>
              ) : (
                <>
                  <button className="text-gray-600 hover:text-indigo-600 font-semibold" onClick={() => openAuthModal(true)}>
                    تسجيل الدخول
                  </button>
                  <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition" onClick={() => openAuthModal(false)}>
                    ابدأ مجاناً
                  </button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button className="text-gray-600 focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <i className="fa-solid fa-bars text-2xl"></i>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
            <Link href="/" className="block text-indigo-600 font-bold" onClick={() => setMobileMenuOpen(false)}>الرئيسية</Link>
            <Link href="/courses" className="block text-gray-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>الكورسات</Link>
            <Link href="/about" className="block text-gray-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>عن المنصة</Link>
            <Link href="/contact" className="block text-gray-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>اتصل بنا</Link>
            <hr className="border-gray-100" />
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  {user.name}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false) }}
                    className="relative text-gray-600 hover:text-indigo-600 p-2"
                  >
                    <i className="fa-solid fa-bell"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                <Link href="/profile" className="block w-full text-center bg-gray-50 text-gray-600 py-2 rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-user-pen ml-1"></i> الملف الشخصي
                </Link>
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link href="/instructor" className="block w-full text-center bg-amber-50 text-amber-600 py-2 rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-chalkboard-user ml-1"></i> منصة التدريس
                  </Link>
                )}
                {user.role === 'instructor' && (
                  <Link href="/instructor/earnings" className="block w-full text-center bg-green-50 text-green-600 py-2 rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-money-bill-wave ml-1"></i> الأرباح
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className="block w-full text-center bg-purple-50 text-purple-600 py-2 rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fa-solid fa-shield-halved ml-1"></i> لوحة الإدارة
                  </Link>
                )}
                <Link href="/dashboard" className="block w-full text-center bg-indigo-50 text-indigo-600 py-2 rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa-solid fa-gauge-high ml-1"></i> لوحة التحكم
                </Link>
                <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-semibold" onClick={() => { logout(); setMobileMenuOpen(false) }}>
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <>
                <button className="w-full text-center text-gray-600 font-semibold py-2" onClick={() => { setMobileMenuOpen(false); openAuthModal(true) }}>
                  تسجيل الدخول
                </button>
                <button className="w-full bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold" onClick={() => { setMobileMenuOpen(false); openAuthModal(false) }}>
                  ابدأ مجاناً
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {showNotifications && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowNotifications(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-700">
                  قراءة الكل
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">لا توجد إشعارات</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markAsRead(n.id) }}
                    className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                        {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
