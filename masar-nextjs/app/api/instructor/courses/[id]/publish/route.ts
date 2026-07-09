import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const course = await prisma.course.findFirst({ where: { id: parseInt(id), instructorId: auth.userId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const { status } = await request.json()
    const valid = ['draft', 'pending', 'archived']
    if (!valid.includes(status)) return apiError('حالة غير صالحة')

    const sectionCount = await prisma.courseSection.count({ where: { courseId: course.id } })
    if (status === 'pending' && sectionCount === 0) return apiError('يجب إضافة أقسام ومحاضرات قبل الطلب')

    await prisma.course.update({ where: { id: course.id }, data: { status } })
    return apiSuccess({ message: `تم تغيير حالة الكورس إلى ${status}` })
  } catch { return apiError('حدث خطأ', 500) }
}
