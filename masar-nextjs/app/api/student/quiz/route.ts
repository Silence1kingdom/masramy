import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// POST - Start or submit a quiz attempt
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'student') return apiError('فقط الطلاب يمكنهم حل الكويزات', 403)

    const { quizId, answers } = await request.json()
    if (!quizId) return apiError('معرف الكويز مطلوب', 400)

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { orderIndex: 'asc' } }, course: true },
    })
    if (!quiz) return apiError('الكويز غير موجود', 404)

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId: quiz.courseId } },
    })
    if (!enrollment) return apiError('أنت غير مسجل في هذا الكورس', 403)

    // Check max attempts
    if (quiz.maxAttempts) {
      const attemptCount = await prisma.quizAttempt.count({
        where: { quizId, userId: auth.userId },
      })
      if (attemptCount >= quiz.maxAttempts) {
        return apiError(`لقد استنفدت الحد الأقصى من المحاولات (${quiz.maxAttempts})`, 400)
      }
    }

    if (!answers || typeof answers !== 'object') {
      return apiError('الإجابات مطلوبة', 400)
    }

    // Grade the quiz
    let totalPoints = 0
    let earnedPoints = 0
    const answerResults: any[] = []

    for (const question of quiz.questions) {
      totalPoints += question.points
      const selectedAnswer = answers[question.id] || ''
      const isCorrect = selectedAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      if (isCorrect) earnedPoints += question.points

      answerResults.push({
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      })
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= quiz.passingScore

    // Save the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: auth.userId,
        score,
        passed,
        answers: JSON.stringify(answers),
        completedAt: new Date(),
      },
    })

    // Save detailed answers
    await prisma.quizAnswer.createMany({
      data: answerResults.map((a) => ({
        attemptId: attempt.id,
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
        points: a.points,
      })),
    })

    // If passed, mark course as completed if all quizzes passed
    if (passed) {
      const courseQuizzes = await prisma.quiz.findMany({
        where: { courseId: quiz.courseId },
        include: {
          attempts: {
            where: { userId: auth.userId, passed: true },
            take: 1,
          },
        },
      })
      const allPassed = courseQuizzes.every((q) => q.attempts.length > 0)
      if (allPassed) {
        await prisma.enrollment.update({
          where: { userId_courseId: { userId: auth.userId, courseId: quiz.courseId } },
          data: { completed: true },
        })
      }
    }

    return apiSuccess({
      attempt: {
        id: attempt.id,
        score: Math.round(score * 10) / 10,
        passed,
        totalPoints,
        earnedPoints,
      },
      answers: answerResults.map((a) => ({
        ...a,
        correctAnswer: quiz.questions.find((q) => q.id === a.questionId)?.correctAnswer,
        explanation: quiz.questions.find((q) => q.id === a.questionId)?.explanation,
      })),
    })
  } catch { return apiError('حدث خطأ', 500) }
}

// GET - Get quiz data and attempts for current user
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')
    if (!quizId) return apiError('معرف الكويز مطلوب', 400)

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: {
        course: { select: { id: true, title: true } },
        questions: {
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            points: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    })
    if (!quiz) return apiError('الكويز غير موجود', 404)

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: parseInt(quizId), userId: auth.userId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        score: true,
        passed: true,
        startedAt: true,
        completedAt: true,
      },
    })

    return apiSuccess({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        maxAttempts: quiz.maxAttempts,
        course: quiz.course,
        questions: quiz.questions,
      },
      attempts,
      maxAttempts: quiz.maxAttempts,
      passingScore: quiz.passingScore,
      attemptCount: attempts.length,
    })
  } catch { return apiError('حدث خطأ', 500) }
}
