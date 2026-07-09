import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const section = await prisma.courseSection.findFirst({ where: { id: parseInt(id) } })
    if (!section) return apiError('القسم غير موجود', 404)
    const course = await prisma.course.findFirst({ where: { id: section.courseId, instructorId: auth.userId } })
    if (!course) return apiError('ليس لديك صلاحية', 403)

    const body = await request.json()
    const title = sanitize(body.title || '')
    if (!title) return apiError('عنوان المحاضرة مطلوب')

    const last = await prisma.courseLecture.findFirst({ where: { sectionId: section.id }, orderBy: { orderIndex: 'desc' } })
    const lecture = await prisma.courseLecture.create({
      data: {
        sectionId: section.id,
        title,
        type: body.type || 'video',
        content: body.content || null,
        videoUrl: body.videoUrl || null,
        duration: parseInt(body.duration) || 0,
        orderIndex: (last?.orderIndex ?? -1) + 1,
      },
    })
    return apiSuccess({ lecture }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}
