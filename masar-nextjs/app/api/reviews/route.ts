import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, getPaginationParams, buildPaginationMeta, apiSuccessWithPagination, validators, rateLimit } from '@/lib/middleware'
import { sendEmail, newReviewEmail } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = parseInt(searchParams.get('courseId') || '')
    if (!courseId) return apiError('معرف الكورس مطلوب')

    const pagination = getPaginationParams(searchParams)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: { courseId } })
    ])

    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

    const meta = buildPaginationMeta(total, pagination)
    return apiSuccessWithPagination({ reviews, avgRating }, meta)
  } catch (error: any) {
    console.error('Reviews error:', error)
    return apiError('حدث خطأ', 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`review:${ip}`, 10, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً', 429)

    const { courseId, rating, comment } = await request.json()

    const errors = [
      validators.required(courseId, 'معرف الكورس'),
      validators.required(rating, 'التقييم'),
      validators.range(rating, 1, 5, 'التقييم'),
    ].filter(Boolean) as string[]
    if (errors.length) return apiError(errors.join(' | '))

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const existing = await prisma.review.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } }
    })

    if (existing) {
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment?.trim() || null }
      })
    } else {
      await prisma.review.create({
        data: { userId: auth.userId, courseId, rating, comment: comment?.trim() }
      })
    }

    const agg = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    await prisma.course.update({
      where: { id: courseId },
      data: {
        rating: Math.round((agg._avg.rating || rating) * 10) / 10,
        reviewsCount: agg._count.rating
      }
    })

    if (!existing && course.instructorId) {
      const instructor = await prisma.user.findUnique({ where: { id: course.instructorId }, select: { email: true, name: true } })
      if (instructor) {
        const reviewEmail = newReviewEmail(instructor.name, course.title, auth.user.name, rating, comment || '')
        sendEmail({ to: instructor.email, subject: reviewEmail.subject, html: reviewEmail.html }).catch(() => {})
      }
    }

    return apiSuccess(
      { message: existing ? 'تم تحديث تقييمك بنجاح' : 'تم إضافة تقييمك بنجاح' },
      existing ? 200 : 201
    )
  } catch (error: any) {
    console.error('Review create error:', error)
    return apiError('حدث خطأ أثناء إضافة التقييم', 500)
  }
}
