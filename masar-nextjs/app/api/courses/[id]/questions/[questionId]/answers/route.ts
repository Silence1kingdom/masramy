import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// POST - Add an answer to a question
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { questionId, content } = await request.json()
    if (!questionId || !content) return apiError('البيانات ناقصة', 400)

    const question = await prisma.courseQuestion.findUnique({
      where: { id: questionId },
      include: { course: true },
    })
    if (!question) return apiError('السؤال غير موجود', 404)

    // Check enrollment or instructor
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId: question.courseId } },
    })
    const isInstructor = auth.user.role === 'instructor' && question.course.instructorId === auth.userId
    const isAdmin = auth.user.role === 'admin'

    if (!enrollment && !isInstructor && !isAdmin) {
      return apiError('يجب أن تكون مسجلاً في الكورس', 403)
    }

    const answer = await prisma.courseAnswer.create({
      data: { questionId, userId: auth.userId, content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify question owner
    if (question.userId !== auth.userId) {
      await prisma.notification.create({
        data: {
          userId: question.userId,
          type: 'new_answer',
          title: 'إجابة على سؤالك',
          message: `${auth.user.name} أجاب على سؤالك "${question.title}"`,
          link: `/courses/${question.courseId}#qa`,
        },
      })
    }

    return apiSuccess({ answer }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}

// PUT - Accept an answer
export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { id, isAccepted } = await request.json()
    if (!id) return apiError('معرف الإجابة مطلوب', 400)

    const answer = await prisma.courseAnswer.findUnique({
      where: { id },
      include: { question: { include: { course: true } } },
    })
    if (!answer) return apiError('الإجابة غير موجودة', 404)

    // Only question owner or instructor can accept
    const isQuestionOwner = answer.question.userId === auth.userId
    const isInstructor = auth.user.role === 'instructor' && answer.question.course.instructorId === auth.userId
    const isAdmin = auth.user.role === 'admin'

    if (!isQuestionOwner && !isInstructor && !isAdmin) {
      return apiError('ليس لديك صلاحية', 403)
    }

    // Unaccept other answers first
    if (isAccepted) {
      await prisma.courseAnswer.updateMany({
        where: { questionId: answer.questionId, isAccepted: true },
        data: { isAccepted: false },
      })
    }

    const updated = await prisma.courseAnswer.update({
      where: { id },
      data: { isAccepted },
    })

    return apiSuccess({ answer: updated })
  } catch { return apiError('حدث خطأ', 500) }
}
