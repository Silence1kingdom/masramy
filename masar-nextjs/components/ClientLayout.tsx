'use client'

import { AuthProvider } from './AuthContext'
import { AuthModalProvider } from './AuthModal'
import Header from './Header'
import Footer from './Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </AuthModalProvider>
    </AuthProvider>
  )
}
