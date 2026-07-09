'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import CourseCard from '@/components/CourseCard'
import { useAuthModal } from '@/components/AuthModal'

export default function Home() {
  const [courses, setCourses] = useState<any[]>([])
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.courses) setCourses(data.data.courses)
        else if (data.courses) setCourses(data.courses)
      })
      .catch(() => {})
  }, [])

  const featuredCourses = courses.slice(0, 3)

  return (
    <section className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="bg-indigo-800 text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">
              استثمر في مستقبلك اليوم
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              تعلم المهارات التي تمكنك من قيادة المستقبل
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              منصة &quot;مسار&quot; تتيح لك الوصول لأحدث الدورات التدريبية بمجالات البرمجة، التصميم، والذكاء الاصطناعي مع أفضل الخبراء العرب في السوق.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/courses" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-lg shadow-lg shadow-emerald-500/20 transition duration-300">
                استكشف الكورسات
              </Link>
              <button onClick={() => openAuthModal(false)} className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-lg transition">
                تسجيل كطالب جديد
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <Image 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
              alt="Learning"
              width={600}
              height={400}
              loading="eager"
              className="rounded-2xl shadow-2xl border-4 border-slate-700/50 w-full max-w-lg object-cover h-[350px]"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-indigo-600">+15,000</p>
            <p className="text-gray-500 text-sm mt-1">طالب مسجل</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600">+120</p>
            <p className="text-gray-500 text-sm mt-1">دورة احترافية</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600">+45</p>
            <p className="text-gray-500 text-sm mt-1">مدرب متخصص</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600">%96</p>
            <p className="text-gray-500 text-sm mt-1">نسبة رضا الطلاب</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900">لماذا تختار منصة مسار؟</h2>
          <p className="text-gray-500 mt-3">نقدم لك بيئة تعليمية متكاملة تهدف إلى مساعدتك على تحقيق أهدافك المهنية خطوة بخطوة.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
              <i className="fa-solid fa-laptop-code text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">تطبيق عملي ومباشر</h3>
            <p className="text-gray-500 leading-relaxed">كل المسارات التعليمية تحتوي على مشاريع حقيقية لتطبيق ما تتعلمه وضمان فهمك للمادة.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-6">
              <i className="fa-solid fa-certificate text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">شهادات معتمدة</h3>
            <p className="text-gray-500 leading-relaxed">عند إتمامك لأي دورة بنجاح، ستحصل على شهادة تدريبية مميزة يمكنك مشاركتها على لينكد إن.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-6">
              <i className="fa-solid fa-users text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">مجتمع تفاعلي</h3>
            <p className="text-gray-500 leading-relaxed">انضم إلى مجتمعاتنا عبر القنوات الخاصة لتناقش وتسأل المدربين والطلاب وتتبادل الخبرات.</p>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">الكورسات الأكثر طلباً</h2>
              <p className="text-gray-500 mt-2">ابدأ دراسة أهم المجالات التقنية مع المجموعات الحالية</p>
            </div>
            <Link href="/courses" className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2">
              عرض كل الكورسات <i className="fa-solid fa-arrow-left"></i>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
