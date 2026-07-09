import { prisma } from '@/lib/prisma'
import { comparePassword, generateTokenPair, normalizeEmail } from '@/lib/auth'
import { apiError, apiSuccess, validators, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`login:${ip}`, 10, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const email = normalizeEmail(body.email || '')
    const password = body.password || ''

    const err = validators.email(email) || validators.password(password)
    if (err) return apiError(err)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return apiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401)

    const isValid = await comparePassword(password, user.password)
    if (!isValid) return apiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401)

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return apiError('حدث خطأ أثناء تسجيل الدخول', 500)
  }
}
