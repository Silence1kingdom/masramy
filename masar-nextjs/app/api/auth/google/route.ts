import { prisma } from '@/lib/prisma'
import { generateTokenPair, normalizeEmail } from '@/lib/auth'
import { apiError, apiSuccess, rateLimit } from '@/lib/middleware'
import { verifySupabaseToken } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`google:${ip}`, 10, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const { accessToken } = await request.json()
    if (!accessToken) return apiError('رمز الوصول مطلوب')

    const supaUser = await verifySupabaseToken(accessToken)
    if (!supaUser) return apiError('رمز الوصول غير صالح', 401)

    const email = normalizeEmail(supaUser.email || '')
    const name = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || email.split('@')[0]
    const avatar = supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null

    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const updates: any = {}
      if (!user.avatar && avatar) updates.avatar = avatar
      if (user.provider !== 'google') updates.provider = 'google'
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates })
      }
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: '',
          avatar,
          provider: 'google',
        },
      })
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    })
  } catch (error: any) {
    console.error('Google auth error:', error)
    return apiError('حدث خطأ أثناء تسجيل الدخول بحساب Google', 500)
  }
}
