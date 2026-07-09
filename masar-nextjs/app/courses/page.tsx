'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [level, setLevel] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [freeOnly, setFreeOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data.categories || [])
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory !== 'all') params.set('category', selectedCategory.toString())
    if (searchQuery) params.set('search', searchQuery)
    if (sort) params.set('sort', sort)
    if (level) params.set('level', level)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (freeOnly) params.set('free', 'true')
    if (minRating > 0) params.set('minRating', String(minRating))
    params.set('page', String(page))
    params.set('limit', '12')

    fetch(`/api/courses?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.courses) {
          setCourses(data.data.courses)
          setTotalPages(data.data.pagination?.totalPages || 1)
        } else if (data.courses) {
          setCourses(data.courses)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedCategory, searchQuery, sort, level, minPrice, maxPrice, freeOnly, minRating, page])

  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
    setSort('newest')
    setLevel('')
    setMinPrice('')
    setMaxPrice('')
    setFreeOnly(false)
    setMinRating(0)
    setPage(1)
  }

  const formatPrice = (p: number) => p > 0 ? `$${p}` : 'مجاني'

  return (
    <section className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">دليل الكورسات والدورات التدريبية</h1>
          <p className="text-gray-500">ابحث عن المهارة التي تريد تعلمها اليوم من بين عشرات المسارات المتاحة.</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="newest">الأحدث</option>
                <option value="popular">الأكثر طلباً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
              </select>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="">جميع المستويات</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="جميع المستويات">جميع المستويات</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setSelectedCategory('all'); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>الكل</button>
              {categories.map((c: any) => (
                <button key={c.id} onClick={() => { setSelectedCategory(c.id); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedCategory === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c.name}</button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <input type="number" placeholder="السعر من" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-20 border rounded-lg px-2 py-1.5 text-xs" />
              <span className="text-gray-400">-</span>
              <input type="number" placeholder="السعر إلى" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-20 border rounded-lg px-2 py-1.5 text-xs" />
            </div>

            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={freeOnly} onChange={(e) => { setFreeOnly(e.target.checked); setPage(1) }} className="rounded" />
              مجاني فقط
            </label>

            <div className="flex items-center gap-1">
              {[4, 3, 2].map(r => (
                <button key={r} onClick={() => { setMinRating(minRating === r ? 0 : r); setPage(1) }} className={`text-xs px-2 py-1 rounded ${minRating === r ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-amber-500'}`}>
                  {r}+ ⭐
                </button>
              ))}
            </div>

            {(selectedCategory !== 'all' || searchQuery || level || minPrice || maxPrice || freeOnly || minRating > 0) && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold">مسح الفلاتر</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <i className="fa-solid fa-search text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-semibold">لا توجد نتائج</p>
            <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className="relative overflow-hidden">
                    {course.image && <img src={course.image} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />}
                    {course.tag && <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold">{course.tag}</span>}
                    {course.price === 0 && <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold">مجاني</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-amber-500 text-sm mb-2">
                      <i className="fa-solid fa-star"></i>
                      <span className="font-bold text-gray-800">{course.rating || 0}</span>
                      <span className="text-gray-400 text-xs">({course._count?.reviews || 0})</span>
                      <span className="text-gray-300 mx-1">|</span>
                      <span className="text-gray-400 text-xs">{course._count?.enrollments || 0} طالب</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-extrabold">{formatPrice(course.price)}</span>
                        {course.oldPrice > 0 && <span className="text-gray-400 line-through text-xs">{formatPrice(course.oldPrice)}</span>}
                      </div>
                      <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">اشترك</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border hover:bg-gray-50 disabled:opacity-50">السابق</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2
                  if (p < 1 || p > totalPages) return null
                  return <button key={p} onClick={() => setPage(p)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${p === page ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>{p}</button>
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border hover:bg-gray-50 disabled:opacity-50">التالي</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
