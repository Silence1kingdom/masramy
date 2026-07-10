import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from './utils/supabase/middleware'

const protectedRoutes = ['/admin', '/instructor', '/dashboard', '/profile', '/student']
const adminRoutes = ['/admin']
const instructorRoutes = ['/instructor']

export async function proxy(request: NextRequest) {
  try {
    const { supabase, supabaseResponse } = createClient(request)
    const { data } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
    if (!isProtected) return supabaseResponse

    const token = request.cookies.get('accessToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      const url = new URL('/', request.url)
      url.searchParams.set('auth', 'required')
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    let role: string | null = null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        role = null
      } else {
        role = payload.role
      }
    } catch {
      role = null
    }

    if (!role && data?.user) {
      role = (data.user.user_metadata?.role as string) || 'student'
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
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
