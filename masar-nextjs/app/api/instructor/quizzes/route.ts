import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// GET - List quizzes for a course (instructor)
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    if (!courseId) return apiError('معرف الكورس مطلوب', 400)

    const course = await prisma.course.findUnique({ where: { id: parseInt(courseId) } })
    if (!course) return apiError('الكورس غير موجود', 404)
    if (auth.user.role === 'instructor' && course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية لهذا الكورس', 403)
    }

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        questions: { select: { id: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { orderIndex: 'asc' },
    })

    return apiSuccess({ quizzes })
  } catch { return apiError('حدث خطأ', 500) }
}

// POST - Create a quiz
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { courseId, title, description, passingScore, timeLimit, maxAttempts } = await request.json()
    if (!courseId || !title) return apiError('البيانات ناقصة', 400)

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return apiError('الكورس غير موجود', 404)
    if (auth.user.role === 'instructor' && course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية لهذا الكورس', 403)
    }

    const existingQuizzes = await prisma.quiz.count({ where: { courseId } })

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title,
        description,
        passingScore: passingScore || 60,
        timeLimit: timeLimit || null,
        maxAttempts: maxAttempts || null,
        orderIndex: existingQuizzes,
      },
    })

    return apiSuccess({ quiz }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}

// PUT - Update a quiz
export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { id, title, description, passingScore, timeLimit, maxAttempts } = await request.json()
    if (!id) return apiError('معرف الكويز مطلوب', 400)

    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { course: true } })
    if (!quiz) return apiError('الكويز غير موجود', 404)
    if (auth.user.role === 'instructor' && quiz.course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية', 403)
    }

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(passingScore !== undefined && { passingScore }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(maxAttempts !== undefined && { maxAttempts }),
      },
    })

    return apiSuccess({ quiz: updated })
  } catch { return apiError('حدث خطأ', 500) }
}

// DELETE - Delete a quiz
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return apiError('معرف الكويز مطلوب', 400)

    const quiz = await prisma.quiz.findUnique({ where: { id: parseInt(id) }, include: { course: true } })
    if (!quiz) return apiError('الكويز غير موجود', 404)
    if (auth.user.role === 'instructor' && quiz.course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية', 403)
    }

    await prisma.quiz.delete({ where: { id: parseInt(id) } })
    return apiSuccess({ message: 'تم حذف الكويز' })
  } catch { return apiError('حدث خطأ', 500) }
}
