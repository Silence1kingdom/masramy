import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) return apiError('معرف الكورس غير صالح')

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: { lectures: { orderBy: { orderIndex: 'asc' } } },
        },
        reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, avatar: true } } } },
        category: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    })
    if (!course) return apiError('الكورس غير موجود', 404)

    const avgRating = course.reviews.length ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length : course.rating
    const lecturesCount = course.sections.reduce((a, s) => a + s.lectures.length, 0)
    const totalDuration = course.sections.reduce((a, s) => a + s.lectures.reduce((b, l) => b + l.duration, 0), 0)

    return apiSuccess({ course: { ...course, avgRating, lecturesCount, totalDuration } })
  } catch (error: any) {
    console.error('Course detail error:', error)
    return apiError('حدث خطأ', 500)
  }
}
