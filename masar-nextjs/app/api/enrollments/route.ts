import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, getPaginationParams, buildPaginationMeta, apiSuccessWithPagination } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { courseId } = await request.json()
    if (!courseId) return apiError('معرف الكورس مطلوب')

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } }
    })

    if (existing) return apiSuccess({ message: 'أنت مسجل بالفعل في هذه الدورة' })

    const enrollment = await prisma.enrollment.create({
      data: { userId: auth.userId, courseId },
      include: { course: { select: { title: true } } }
    })

    return apiSuccess(
      { message: `تم التسجيل في دورة "${enrollment.course.title}" بنجاح!`, enrollment },
      201
    )
  } catch (error: any) {
    console.error('Enrollment error:', error)
    return apiError('حدث خطأ أثناء التسجيل في الدورة', 500)
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const pagination = getPaginationParams(searchParams)

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: auth.userId },
        include: { course: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.enrollment.count({ where: { userId: auth.userId } })
    ])

    const meta = buildPaginationMeta(total, pagination)
    return apiSuccessWithPagination({ enrollments }, meta)
  } catch (error: any) {
    console.error('Enrollments error:', error)
    return apiError('حدث خطأ', 500)
  }
}
