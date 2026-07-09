import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const lecture = await prisma.courseLecture.findFirst({ where: { id: parseInt(id) } })
    if (!lecture) return apiError('المحاضرة غير موجودة', 404)
    const section = await prisma.courseSection.findFirst({ where: { id: lecture.sectionId } })
    if (!section) return apiError('القسم غير موجود', 404)
    const course = await prisma.course.findFirst({ where: { id: section.courseId, instructorId: auth.userId } })
    if (!course) return apiError('ليس لديك صلاحية', 403)

    const body = await request.json()
    const data: any = {}
    if (body.title) data.title = sanitize(body.title)
    if (body.type) data.type = body.type
    if (body.content !== undefined) data.content = body.content || null
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl || null
    if (body.duration) data.duration = parseInt(body.duration)

    const updated = await prisma.courseLecture.update({ where: { id: lecture.id }, data })
    return apiSuccess({ lecture: updated })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const lecture = await prisma.courseLecture.findFirst({ where: { id: parseInt(id) } })
    if (!lecture) return apiError('المحاضرة غير موجودة', 404)
    const section = await prisma.courseSection.findFirst({ where: { id: lecture.sectionId } })
    if (!section) return apiError('القسم غير موجود', 404)
    const course = await prisma.course.findFirst({ where: { id: section.courseId, instructorId: auth.userId } })
    if (!course) return apiError('ليس لديك صلاحية', 403)
    await prisma.courseLecture.delete({ where: { id: lecture.id } })
    return apiSuccess({ message: 'تم حذف المحاضرة' })
  } catch { return apiError('حدث خطأ', 500) }
}
