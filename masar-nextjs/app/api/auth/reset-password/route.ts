import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { apiError, apiSuccess, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`reset-pw:${ip}`, 5, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return apiError('الرمز وكلمة المرور مطلوبان')
    }

    if (password.length < 6) {
      return apiError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }

    const resetRecord = await prisma.passwordReset.findUnique({ where: { token } })

    if (!resetRecord || resetRecord.used) {
      return apiError('الرمز غير صالح أو تم استخدامه', 400)
    }

    if (new Date() > resetRecord.expiresAt) {
      return apiError('انتهت صلاحية الرمز، يرجى طلب رمز جديد', 400)
    }

    const hashedPassword = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ])

    return apiSuccess({ message: 'تم إعادة تعيين كلمة المرور بنجاح' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return apiError('حدث خطأ أثناء إعادة تعيين كلمة المرور', 500)
  }
}
