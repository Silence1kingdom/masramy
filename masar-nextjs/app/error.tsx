'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <i className="fa-solid fa-circle-exclamation text-6xl text-red-300 mb-6"></i>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">حدث خطأ غير متوقع</h1>
      <p className="text-gray-500 mb-8">نأسف للإزعاج، يرجى المحاولة مرة أخرى</p>
      <button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2">
        <i className="fa-solid fa-rotate"></i> إعادة المحاولة
      </button>
    </div>
  )
}
