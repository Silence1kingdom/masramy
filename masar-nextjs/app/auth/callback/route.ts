import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase-auth'
import { prisma } from '@/lib/prisma'
import { generateTokenPair, normalizeEmail } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = getSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const email = normalizeEmail(session.user.email || '')
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0]
        const avatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null

        let user = await prisma.user.findUnique({ where: { email } })

        if (user) {
          const updates: Record<string, string | null> = {}
          if (!user.avatar && avatar) updates.avatar = avatar
          if (user.provider !== 'google') updates.provider = 'google'
          if (Object.keys(updates).length > 0) {
            user = await prisma.user.update({ where: { id: user.id }, data: updates })
          }
        } else {
          user = await prisma.user.create({
            data: { name, email, password: '', avatar, provider: 'google' },
          })
        }

        const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

        const redirectUrl = new URL(`${origin}${next}`)
        redirectUrl.searchParams.set('token', tokens.accessToken)
        redirectUrl.searchParams.set('refresh', tokens.refreshToken)
        redirectUrl.searchParams.set('google_auth', 'true')

        const response = NextResponse.redirect(redirectUrl.toString())
        response.cookies.set('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
