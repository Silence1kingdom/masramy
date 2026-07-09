import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from './utils/supabase/middleware'

const protectedRoutes = ['/admin', '/instructor', '/dashboard', '/profile', '/student']
const adminRoutes = ['/admin']
const instructorRoutes = ['/instructor']

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) return supabaseResponse

  let role: string | null = null

  const token = request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      role = payload.role
    } catch {}
  }

  if (!role && supabaseUser) {
    role = (supabaseUser.user_metadata?.role as string) || 'student'
  }

  if (!role) {
    const url = new URL('/', request.url)
    url.searchParams.set('auth', 'required')
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (adminRoutes.some(route => pathname.startsWith(route)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (instructorRoutes.some(route => pathname.startsWith(route)) && role !== 'instructor' && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
