import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params

    const { completed, timeSpentSeconds } = await request.json()
    const lectureId = parseInt(id)

    const lecture = await prisma.courseLecture.findUnique({ where: { id: lectureId } })
    if (!lecture) return apiError('المحاضرة غير موجودة', 404)

    await prisma.lectureProgress.upsert({
      where: { userId_lectureId: { userId: auth.userId, lectureId } },
      update: { completed: completed ?? true, completedAt: completed ? new Date() : null, timeSpentSeconds: { increment: timeSpentSeconds || 0 } },
      create: { userId: auth.userId, lectureId, completed: completed ?? true, completedAt: completed ? new Date() : null, timeSpentSeconds: timeSpentSeconds || 0 },
    })

    const section = await prisma.courseSection.findUnique({ where: { id: lecture.sectionId }, include: { lectures: true } })
    const progressRecords = await prisma.lectureProgress.findMany({
      where: { userId: auth.userId, lectureId: { in: section!.lectures.map(l => l.id) }, completed: true },
    })
    const progress = Math.round((progressRecords.length / section!.lectures.length) * 100)

    return apiSuccess({ progress })
  } catch { return apiError('حدث خطأ', 500) }
}
