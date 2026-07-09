import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// GET - List questions for a quiz
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')
    if (!quizId) return apiError('معرف الكويز مطلوب', 400)

    const quiz = await prisma.quiz.findUnique({ where: { id: parseInt(quizId) }, include: { course: true } })
    if (!quiz) return apiError('الكويز غير موجود', 404)

    // Students can only see questions without correct answers
    const isStudent = auth.user.role === 'student'
    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: parseInt(quizId) },
      select: isStudent ? {
        id: true,
        question: true,
        type: true,
        options: true,
        points: true,
        orderIndex: true,
      } : undefined,
      orderBy: { orderIndex: 'asc' },
    })

    return apiSuccess({ questions })
  } catch { return apiError('حدث خطأ', 500) }
}

// POST - Add a question to a quiz
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { quizId, question, type, options, correctAnswer, explanation, points } = await request.json()
    if (!quizId || !question || !correctAnswer) return apiError('البيانات ناقصة', 400)

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } })
    if (!quiz) return apiError('الكويز غير موجود', 404)
    if (auth.user.role === 'instructor' && quiz.course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية', 403)
    }

    const existingQuestions = await prisma.quizQuestion.count({ where: { quizId } })

    const newQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question,
        type: type || 'multiple_choice',
        options: options || [],
        correctAnswer,
        explanation,
        points: points || 1,
        orderIndex: existingQuestions,
      },
    })

    return apiSuccess({ question: newQuestion }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}

// PUT - Update a question
export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { id, question, type, options, correctAnswer, explanation, points } = await request.json()
    if (!id) return apiError('معرف السؤال مطلوب', 400)

    const existing = await prisma.quizQuestion.findUnique({ where: { id }, include: { quiz: { include: { course: true } } } })
    if (!existing) return apiError('السؤال غير موجود', 404)
    if (auth.user.role === 'instructor' && existing.quiz.course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية', 403)
    }

    const updated = await prisma.quizQuestion.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(type && { type }),
        ...(options && { options }),
        ...(correctAnswer && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(points !== undefined && { points }),
      },
    })

    return apiSuccess({ question: updated })
  } catch { return apiError('حدث خطأ', 500) }
}

// DELETE - Delete a question
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return apiError('معرف السؤال مطلوب', 400)

    const existing = await prisma.quizQuestion.findUnique({ where: { id: parseInt(id) }, include: { quiz: { include: { course: true } } } })
    if (!existing) return apiError('السؤال غير موجود', 404)
    if (auth.user.role === 'instructor' && existing.quiz.course.instructorId !== auth.userId) {
      return apiError('ليس لديك صلاحية', 403)
    }

    await prisma.quizQuestion.delete({ where: { id: parseInt(id) } })
    return apiSuccess({ message: 'تم حذف السؤال' })
  } catch { return apiError('حدث خطأ', 500) }
}
