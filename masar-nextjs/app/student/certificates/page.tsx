'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Header from '@/components/Header'
import Link from 'next/link'

interface Certificate {
  id: number
  certificateNumber: string
  issuedAt: string
  completedAt: string
  course: { id: number; title: string; image: string; instructor: string }
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchCertificates()
  }, [user])

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/student/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setCertificates(data.data.certificates)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleDownload = (cert: Certificate) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>شهادة - ${cert.certificateNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { margin: 0; padding: 40px; font-family: 'Cairo', sans-serif; background: #f5f5f5; }
          .certificate { width: 800px; margin: 0 auto; background: white; padding: 60px; border: 3px solid #4f46e5; border-radius: 12px; text-align: center; position: relative; }
          .certificate::before { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 1px solid #c7d2fe; border-radius: 8px; }
          .logo { font-size: 28px; font-weight: 700; color: #4f46e5; margin-bottom: 10px; }
          .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px; }
          .name { font-size: 32px; font-weight: 700; color: #4f46e5; margin: 20px 0; padding: 10px 0; border-bottom: 2px solid #e5e7eb; display: inline-block; }
          .course { font-size: 18px; color: #374151; margin: 20px 0; }
          .details { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .detail { text-align: center; }
          .detail-label { font-size: 12px; color: #9ca3af; }
          .detail-value { font-size: 14px; font-weight: 600; color: #374151; }
          @media print { body { background: white; } .certificate { border: 3px solid #4f46e5; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">مسار أكاديمي</div>
          <div class="subtitle">Masar Academy</div>
          <div class="title">شهادة إتمام دورة تدريبية</div>
          <p style="color: #6b7280;">تُشهد بأن</p>
          <div class="name">${user?.name || ''}</div>
          <p style="color: #6b7280;">لقد أتم بنجاح دورة</p>
          <div class="course">${cert.course.title}</div>
          <div class="details">
            <div class="detail">
              <div class="detail-label">رقم الشهادة</div>
              <div class="detail-value">${cert.certificateNumber}</div>
            </div>
            <div class="detail">
              <div class="detail-label">تاريخ الإصدار</div>
              <div class="detail-value">${new Date(cert.issuedAt).toLocaleDateString('ar-EG')}</div>
            </div>
            <div class="detail">
              <div class="detail-label">المدرب</div>
              <div class="detail-value">${cert.course.instructor}</div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>يرجى تسجيل الدخول</p></div>

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">شهاداتي</h1>
        <p className="text-gray-500 mb-8">الشهادات التي حصلت عليها من الكورسات المكتملة</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <i className="fa-solid fa-certificate text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-semibold">لا توجد شهادات بعد</p>
            <p className="text-gray-400 text-sm mt-1">أكمل كورساً للحصول على شهادة</p>
            <Link href="/courses" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">
              تصفح الكورسات
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="bg-gradient-to-l from-indigo-600 to-purple-600 p-6 text-white text-center">
                  <i className="fa-solid fa-certificate text-4xl mb-3 opacity-80"></i>
                  <p className="text-sm opacity-80">{cert.certificateNumber}</p>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{cert.course.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">المدرب: {cert.course.instructor}</p>
                  <p className="text-sm text-gray-500 mb-4">تاريخ الإصدار: {new Date(cert.issuedAt).toLocaleDateString('ar-EG')}</p>
                  <button
                    onClick={() => handleDownload(cert)}
                    className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition"
                  >
                    <i className="fa-solid fa-download ml-1"></i> طباعة الشهادة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
