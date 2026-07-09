import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ في المصادقة</h1>
        <p className="text-gray-500 mb-6">حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.</p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
