'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterLoading(true)
    setNewsletterMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      })
      const data = await res.json()
      setNewsletterMsg(data.data?.message || data.error)
      if (res.ok) setNewsletterEmail('')
    } catch {
      setNewsletterMsg('حدث خطأ')
    }
    setNewsletterLoading(false)
  }

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <span className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
            أكاديمية مَسار
          </span>
          <p className="text-gray-400 text-sm leading-relaxed">منصة تعليمية تهدف لرفع الكفاءة التقنية لدى الشباب العربي من خلال تجربة تعليم تفاعلية تخدم مسيرتك المهنية.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-white">الرئيسية</Link></li>
            <li><Link href="/courses" className="hover:text-white">تصفح الكورسات</Link></li>
            <li><Link href="/about" className="hover:text-white">من نحن</Link></li>
            <li><Link href="/contact" className="hover:text-white">اتصل بنا</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white">الكورسات الرائجة</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/courses/1" className="hover:text-white">دبلومة الويب الكاملة</Link></li>
            <li><Link href="/courses/2" className="hover:text-white">تصميم واجهات المستخدم UI/UX</Link></li>
            <li><Link href="/courses/3" className="hover:text-white">التسويق الرقمي الشامل</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-white">النشرة البريدية</h4>
          <p className="text-gray-400 text-sm mb-4">اشترك ليصلك جديد الكورسات والخصومات الأسبوعية.</p>
          <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
            <div className="flex">
              <input 
                type="email" 
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="بريدك الإلكتروني" 
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-r-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              />
              <button 
                type="submit"
                disabled={newsletterLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-l-lg text-sm disabled:opacity-50"
              >
                {newsletterLoading ? '...' : 'اشترك'}
              </button>
            </div>
            {newsletterMsg && (
              <p className="text-xs text-gray-400">{newsletterMsg}</p>
            )}
          </form>
        </div>
      </div>
      <div className="border-t border-slate-800 py-6 text-center text-sm text-gray-500">
        <p>جميع الحقوق محفوظة © أكاديمية مسار 2026</p>
      </div>
    </footer>
  )
}
