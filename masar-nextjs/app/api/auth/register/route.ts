import { prisma } from '@/lib/prisma'
import { hashPassword, generateTokenPair, normalizeEmail, checkPasswordStrength } from '@/lib/auth'
import { apiError, apiSuccess, validators, sanitize, rateLimit } from '@/lib/middleware'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`register:${ip}`, 5, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const name = sanitize(body.name || '')
    const email = normalizeEmail(body.email || '')
    const password = body.password || ''

    const errors = [
      validators.name(name),
      validators.email(email),
      validators.password(password),
    ].filter(Boolean) as string[]
    if (errors.length) return apiError(errors.join(' | '))

    const strength = checkPasswordStrength(password)
    if (strength.score < 2) return apiError(`كلمة المرور ${strength.label}: ${strength.hints.join('، ')}`)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('البريد الإلكتروني مستخدم بالفعل')

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    const welcome = welcomeEmail(name)
    sendEmail({ to: email, subject: welcome.subject, html: welcome.html }).catch(() => {})

    return apiSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens }, 201)
  } catch (error: any) {
    console.error('Register error:', error)
    return apiError(error.code === 'P2002' ? 'البريد الإلكتروني مستخدم بالفعل' : 'حدث خطأ أثناء التسجيل', 500)
  }
}
