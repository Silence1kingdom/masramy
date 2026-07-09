import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const course = await prisma.course.findFirst({
      where: { id: parseInt(id), instructorId: auth.userId },
      include: { sections: { include: { lectures: { orderBy: { orderIndex: 'asc' } } }, orderBy: { orderIndex: 'asc' } }, category: true },
    })
    if (!course) return apiError('الكورس غير موجود', 404)
    return apiSuccess({ course })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const course = await prisma.course.findFirst({ where: { id: parseInt(id), instructorId: auth.userId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const body = await request.json()
    const data: any = {}
    if (body.title) { const t = sanitize(body.title); if (t.length >= 3) data.title = t }
    if (body.description !== undefined) data.description = sanitize(body.description)
    if (body.price !== undefined) data.price = parseFloat(body.price) || 0
    if (body.oldPrice !== undefined) data.oldPrice = parseFloat(body.oldPrice) || 0
    if (body.level) data.level = body.level
    if (body.image !== undefined) data.image = body.image
    if (body.tag !== undefined) data.tag = body.tag
    if (body.duration) data.duration = body.duration
    if (body.categoryId !== undefined) data.categoryId = body.categoryId || null
    if (body.learningPoints) data.learningPoints = body.learningPoints
    if (body.requirements) data.requirements = body.requirements

    const updated = await prisma.course.update({ where: { id: parseInt(id) }, data })
    return apiSuccess({ course: updated })
  } catch { return apiError('حدث خطأ أثناء التحديث', 500) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const course = await prisma.course.findFirst({ where: { id: parseInt(id), instructorId: auth.userId } })
    if (!course) return apiError('الكورس غير موجود', 404)
    await prisma.course.delete({ where: { id: parseInt(id) } })
    return apiSuccess({ message: 'تم حذف الكورس' })
  } catch { return apiError('حدث خطأ أثناء الحذف', 500) }
}
