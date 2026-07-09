import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, validators, sanitize, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`contact:${ip}`, 3, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const body = await request.json()
    const name = sanitize(body.name || '')
    const email = (body.email || '').toLowerCase().trim()
    const subject = sanitize(body.subject || '')
    const message = sanitize(body.message || '')

    const errors = [
      validators.name(name),
      validators.email(email),
      validators.required(subject, 'الموضوع'),
      validators.minLength(message, 10, 'الرسالة'),
      validators.maxLength(message, 2000, 'الرسالة'),
      validators.maxLength(subject, 200, 'الموضوع'),
    ].filter(Boolean) as string[]

    if (errors.length) return apiError(errors.join(' | '))

    await prisma.contactMessage.create({
      data: { name, email, subject, message }
    })

    return apiSuccess(
      { message: 'تم استلام رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.' },
      201
    )
  } catch (error: any) {
    console.error('Contact error:', error)
    return apiError('حدث خطأ أثناء إرسال الرسالة', 500)
  }
}
