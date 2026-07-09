import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// GET - List questions for a course
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    if (!courseId) return apiError('معرف الكورس مطلوب', 400)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const resolved = searchParams.get('resolved')

    const where: any = { courseId: parseInt(courseId) }
    if (resolved !== null && resolved !== undefined) {
      where.resolved = resolved === 'true'
    }

    const [questions, total] = await Promise.all([
      prisma.courseQuestion.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          answers: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { answers: true } },
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.courseQuestion.count({ where }),
    ])

    return apiSuccess({
      questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch { return apiError('حدث خطأ', 500) }
}

// POST - Create a question
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { courseId, title, content } = await request.json()
    if (!courseId || !title || !content) return apiError('البيانات ناقصة', 400)

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } },
    })
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    const isInstructor = auth.user.role === 'instructor' && course?.instructorId === auth.userId
    const isAdmin = auth.user.role === 'admin'

    if (!enrollment && !isInstructor && !isAdmin) {
      return apiError('يجب أن تكون مسجلاً في الكورس', 403)
    }

    const question = await prisma.courseQuestion.create({
      data: { courseId, userId: auth.userId, title, content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify instructor
    if (course?.instructorId && course.instructorId !== auth.userId) {
      await prisma.notification.create({
        data: {
          userId: course.instructorId,
          type: 'new_question',
          title: 'سؤال جديد في الكورس',
          message: `${auth.user.name} سأل: "${title}"`,
          link: `/courses/${courseId}#qa`,
        },
      })
    }

    return apiSuccess({ question }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}

// PUT - Update question (pin/resolve)
export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { id, resolved, pinned } = await request.json()
    if (!id) return apiError('معرف السؤال مطلوب', 400)

    const question = await prisma.courseQuestion.findUnique({
      where: { id },
      include: { course: true },
    })
    if (!question) return apiError('السؤال غير موجود', 404)

    // Only instructor/admin can pin/resolve, or the question owner can resolve their own
    const isInstructor = auth.user.role === 'instructor' && question.course.instructorId === auth.userId
    const isAdmin = auth.user.role === 'admin'
    const isOwner = question.userId === auth.userId

    if (!isInstructor && !isAdmin && !isOwner) {
      return apiError('ليس لديك صلاحية', 403)
    }

    const updateData: any = {}
    if (resolved !== undefined && (isInstructor || isAdmin)) updateData.resolved = resolved
    if (pinned !== undefined && (isInstructor || isAdmin)) updateData.pinned = pinned

    const updated = await prisma.courseQuestion.update({
      where: { id },
      data: updateData,
    })

    return apiSuccess({ question: updated })
  } catch { return apiError('حدث خطأ', 500) }
}
