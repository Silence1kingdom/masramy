'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(data.data?.message || 'تم الإرسال بنجاح')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch {
      setError('حدث خطأ في الاتصال')
    }
    setLoading(false)
  }

  return (
    <section className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">اتصل بنا</h1>
          <p className="text-gray-500 text-lg">نحن هنا لمساعدتك. لا تتردد في التواصل معنا</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-xl text-indigo-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">العنوان</h3>
                  <p className="text-gray-500">شارع الملك فهد، حي العليا، الرياض، المملكة العربية السعودية</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone text-xl text-emerald-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">الهاتف</h3>
                  <p className="text-gray-500" dir="ltr">+966 11 123 4567</p>
                  <p className="text-gray-500" dir="ltr">+966 50 987 6543</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope text-xl text-amber-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
                  <p className="text-gray-500">info@masar-academy.com</p>
                  <p className="text-gray-500">support@masar-academy.com</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-clock text-xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">ساعات العمل</h3>
                  <p className="text-gray-500">الأحد - الخميس: 9 صباحاً - 6 مساءً</p>
                  <p className="text-gray-500">الجمعة - السبت: مغلق</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition">
                <i className="fa-brands fa-twitter text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-white hover:bg-blue-900 transition">
                <i className="fa-brands fa-linkedin-in text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-700 transition">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition">
                <i className="fa-brands fa-youtube text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white hover:bg-green-700 transition">
                <i className="fa-brands fa-whatsapp text-xl"></i>
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>

            {success && (
              <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg mb-4 text-center">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل</label>
                  <input 
                    type="text" required placeholder="محمد أحمد" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input 
                    type="email" required placeholder="name@example.com" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الموضوع</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-600"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option value="">اختر الموضوع</option>
                  <option value="general">استفسار عام</option>
                  <option value="courses">الكورسات والدورات</option>
                  <option value="technical">مشكلة تقنية</option>
                  <option value="partnership">شراكة وتعاون</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الرسالة</label>
                <textarea 
                  rows={5} required placeholder="اكتب رسالتك هنا..." 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : <><i className="fa-solid fa-paper-plane ml-2"></i> إرسال الرسالة</>}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 bg-gray-200 rounded-2xl overflow-hidden h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <i className="fa-solid fa-map-location-dot text-5xl mb-4"></i>
            <p className="font-semibold">خريطة الموقع</p>
            <p className="text-sm">شارع الملك فهد، حي العليا، الرياض</p>
          </div>
        </div>
      </div>
    </section>
  )
}
