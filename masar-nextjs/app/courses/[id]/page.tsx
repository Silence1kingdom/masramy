'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getCategoryNameInArabic } from '@/data/courses'
import { useAuth } from '@/components/AuthContext'
import { useAuthModal } from '@/components/AuthModal'

function formatReviews(reviews: any, reviewsCount?: number): string {
  if (reviews !== undefined) return reviews
  if (reviewsCount !== undefined) {
    if (reviewsCount >= 1000) return (reviewsCount / 1000).toFixed(1) + 'k'
    return String(reviewsCount)
  }
  return '0'
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<any>(null)
  const { token } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [loading, setLoading] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.course) setCourse(data.data.course)
        else if (data.course) setCourse(data.course)
        else setCourse(null)
      })
      .catch(() => setCourse(null))
  }, [id])

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <i className="fa-solid fa-exclamation-triangle text-5xl text-amber-500 mb-4"></i>
        <h1 className="text-2xl font-bold mb-4">الكورس غير موجود</h1>
        <Link href="/courses" className="text-indigo-600 hover:text-indigo-800 font-semibold">
          العودة لصفحة الكورسات
        </Link>
      </div>
    )
  }

  const discount = course.oldPrice > 0 ? Math.round((1 - course.price / course.oldPrice) * 100) : 0

  const handleEnroll = async () => {
    if (!token) {
      openAuthModal(true)
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id })
      })
      const data = await res.json()
      setMessage(data.success ? data.data.message : data.error)
    } catch {
      setMessage('حدث خطأ')
    }
    setLoading(false)
  }

  const handleWishlist = async () => {
    if (!token) { openAuthModal(true); return }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseId: course.id })
      })
      const data = await res.json()
      if (data.success) setWishlisted(data.data.wishlisted)
    } catch {}
  }

  return (
    <section className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/courses" className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 inline-flex">
          <i className="fa-solid fa-arrow-right"></i> العودة للكورسات
        </Link>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm text-center font-semibold ${
            message.includes('بنجاح') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Image 
              src={course.image} 
              alt={course.title}
              width={1200}
              height={400}
              className="w-full h-64 md:h-80 object-cover rounded-xl"
            />
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {getCategoryNameInArabic(course.category)}
                </span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {course.tag}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{course.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><i className="fa-solid fa-user"></i> {course.instructor}</span>
                <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {course.duration}</span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-star text-amber-500"></i> {course.rating} ({formatReviews(course.reviews, course.reviewsCount)} تقييم)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">وصف الكورس</h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">ماذا ستتعلم</h2>
              <ul className="space-y-3">
                {course.learningPoints?.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h2 className="text-xl font-bold mb-4">متطلبات الكورس</h2>
              <ul className="space-y-3">
                {course.requirements?.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="fa-solid fa-laptop text-indigo-500 mt-1"></i>
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-100 sticky top-24 shadow-sm">
              <div className="text-center mb-6">
                <span className="text-4xl font-extrabold text-indigo-600">${course.price}</span>
                {course.oldPrice > 0 && <span className="text-gray-400 line-through text-lg mr-2">${course.oldPrice}</span>}
                <p className="text-emerald-600 text-sm font-semibold mt-1">خصم {discount}%</p>
              </div>
              
              <button 
                onClick={handleEnroll}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition mb-4 disabled:opacity-50"
              >
                <i className="fa-solid fa-cart-shopping ml-2"></i> 
                {loading ? 'جاري...' : 'اشترك الآن'}
              </button>
              <button onClick={handleWishlist} className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition mb-6">
                <i className={`${wishlisted ? 'fa-solid' : 'fa-regular'} fa-heart ml-2`}></i> {wishlisted ? 'في المفضلة' : 'أضف للمفضلة'}
              </button>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500"><i className="fa-regular fa-clock ml-2"></i>المدة</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500"><i className="fa-solid fa-signal ml-2"></i>المستوى</span>
                  <span className="font-semibold">من المبتدئ للمتقدم</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500"><i className="fa-solid fa-certificate ml-2"></i>الشهادة</span>
                  <span className="font-semibold text-emerald-600">نعم</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500"><i className="fa-solid fa-infinity ml-2"></i>الوصول</span>
                  <span className="font-semibold">مدى الحياة</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500"><i className="fa-solid fa-mobile-screen ml-2"></i>الوصول من الجوال</span>
                  <span className="font-semibold text-emerald-600">نعم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
