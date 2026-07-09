import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <i className="fa-solid fa-map-signs text-6xl text-indigo-300 mb-6"></i>
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-500 mb-2">الصفحة التي تبحث عنها غير موجودة</p>
      <p className="text-gray-400 mb-8">ربما تم نقل الصفحة أو حذفها</p>
      <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2">
        <i className="fa-solid fa-house"></i> العودة للرئيسية
      </Link>
    </div>
  )
}
