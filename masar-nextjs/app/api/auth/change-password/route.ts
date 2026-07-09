import { prisma } from '@/lib/prisma'
import { comparePassword, hashPassword } from '@/lib/auth'
import { getAuthUser, apiError, apiSuccess, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`change-pw:${ip}`, 5, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return apiError('كلمة المرور الحالية والجديدة مطلوبتان')
    }

    if (newPassword.length < 6) {
      return apiError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) return apiError('المستخدم غير موجود', 404)

    if (!user.password) {
      return apiError('هذا الحساب مرتبط بـ Google، يمكنك تغيير كلمة المرور من حسابك')
    }

    const isValid = await comparePassword(currentPassword, user.password)
    if (!isValid) return apiError('كلمة المرور الحالية غير صحيحة', 401)

    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword },
    })

    return apiSuccess({ message: 'تم تغيير كلمة المرور بنجاح' })
  } catch (error: any) {
    console.error('Change password error:', error)
    return apiError('حدث خطأ أثناء تغيير كلمة المرور', 500)
  }
}
