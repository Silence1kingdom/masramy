import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const section = await prisma.courseSection.findFirst({ where: { id: parseInt(id) } })
    if (!section) return apiError('القسم غير موجود', 404)
    const course = await prisma.course.findFirst({ where: { id: section.courseId, instructorId: auth.userId } })
    if (!course) return apiError('ليس لديك صلاحية', 403)

    const { title } = await request.json()
    const updated = await prisma.courseSection.update({ where: { id: section.id }, data: { title: sanitize(title || section.title) } })
    return apiSuccess({ section: updated })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const section = await prisma.courseSection.findFirst({ where: { id: parseInt(id) } })
    if (!section) return apiError('القسم غير موجود', 404)
    const course = await prisma.course.findFirst({ where: { id: section.courseId, instructorId: auth.userId } })
    if (!course) return apiError('ليس لديك صلاحية', 403)
    await prisma.courseSection.delete({ where: { id: section.id } })
    return apiSuccess({ message: 'تم حذف القسم' })
  } catch { return apiError('حدث خطأ', 500) }
}
