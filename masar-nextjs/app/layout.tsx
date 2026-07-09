import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'أكاديمية مسار - المنصة التعليمية المتكاملة',
  description: 'منصة تعليمية تهدف لرفع الكفاءة التقنية لدى الشباب العربي',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <head />
      <body className="bg-gray-50 text-slate-800 flex flex-col min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
