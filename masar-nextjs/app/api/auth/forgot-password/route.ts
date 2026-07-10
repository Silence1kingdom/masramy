import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/auth'
import { apiError, apiSuccess, rateLimit } from '@/lib/middleware'
import { sendEmail } from '@/lib/email'
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

    const resetEmailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">مسار أكاديمي</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 5px;">Masar Academy</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">طلب إعادة تعيين كلمة المرور</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك المرتبط بـ <strong>${email}</strong>.
          </p>
          <p style="color: #4b5563; line-height: 1.8;">
            اضغط على الزر أدناه لإعادة تعيين كلمة المرور. هذا الرابط صالح لمدة ساعة واحدة.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني. لن يتم تغيير كلمة المرور إلا إذا قمت بالنقر على الرابط أعلاه.
          </p>
        </div>
        <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} مسار أكاديمي - جميع الحقوق محفوظة
        </p>
      </div>
    `

    sendEmail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور - مسار أكاديمي',
      html: resetEmailHtml,
    }).catch(() => {})

    return apiSuccess({
      message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return apiError('حدث خطأ', 500)
  }
}
