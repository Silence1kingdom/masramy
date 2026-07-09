import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, validators, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`newsletter:${ip}`, 5, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const { email, action } = await request.json()
    const emailErr = validators.email(email)
    if (emailErr) return apiError(emailErr)

    const normalizedEmail = email.toLowerCase().trim()

    if (action === 'unsubscribe') {
      const sub = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizedEmail } })
      if (!sub) return apiSuccess({ message: 'البريد غير مسجل في النشرة' })
      await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { active: false } })
      return apiSuccess({ message: 'تم إلغاء الاشتراك بنجاح' })
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizedEmail } })

    if (existing) {
      if (!existing.active) {
        await prisma.newsletterSubscriber.update({ where: { id: existing.id }, data: { active: true } })
        return apiSuccess({ message: 'تم إعادة تفعيل اشتراكك! شكراً لك.' })
      }
      return apiSuccess({ message: 'أنت مشترك بالفعل في النشرة البريدية!' })
    }

    await prisma.newsletterSubscriber.create({ data: { email: normalizedEmail } })

    return apiSuccess(
      { message: 'تم الاشتراك بنجاح! شكراً لتسجيلك في النشرة البريدية.' },
      201
    )
  } catch (error: any) {
    console.error('Newsletter error:', error)
    return apiError('حدث خطأ أثناء الاشتراك في النشرة', 500)
  }
}
