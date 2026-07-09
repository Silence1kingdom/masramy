import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId: parseInt(id) } },
    })
    if (!enrollment) return apiError('غير مسجل في هذا الكورس', 403)

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lectures: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    })
    if (!course) return apiError('الكورس غير موجود', 404)

    const progressRecords = await prisma.lectureProgress.findMany({
      where: { userId: auth.userId, lectureId: { in: course.sections.flatMap(s => s.lectures.map(l => l.id)) } },
    })
    const progressMap = Object.fromEntries(progressRecords.map(p => [p.lectureId, p]))

    const totalLectures = course.sections.reduce((a, s) => a + s.lectures.length, 0)
    const completedLectures = progressRecords.filter(p => p.completed).length

    return apiSuccess({ course, progressMap, totalLectures, completedLectures })
  } catch { return apiError('حدث خطأ', 500) }
}
