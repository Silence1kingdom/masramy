import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/auth'
import { apiError, apiSuccess, rateLimit } from '@/lib/middleware'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`forgot-pw:${ip}`, 3, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const email = normalizeEmail(body.email || '')
    if (!email) return apiError('البريد الإلكتروني مطلوب')

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return apiSuccess({ message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين' })
    }

    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    console.log(`[Password Reset] Email: ${email}, URL: ${resetUrl}`)

    return apiSuccess({
      message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return apiError('حدث خطأ', 500)
  }
}
