import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    const { id } = await params
    const course = await prisma.course.findFirst({ where: { id: parseInt(id), instructorId: auth.userId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const { title } = await request.json()
    if (!sanitize(title || '')) return apiError('عنوان القسم مطلوب')

    const last = await prisma.courseSection.findFirst({ where: { courseId: course.id }, orderBy: { orderIndex: 'desc' } })
    const section = await prisma.courseSection.create({
      data: { courseId: course.id, title: sanitize(title), orderIndex: (last?.orderIndex ?? -1) + 1 },
    })
    return apiSuccess({ section }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}
