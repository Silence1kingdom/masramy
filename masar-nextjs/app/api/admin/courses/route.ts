import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const courses = await prisma.course.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { instructorUser: { select: { id: true, name: true, email: true } }, _count: { select: { enrollments: true } } },
    })
    return apiSuccess({ courses })
  } catch { return apiError('حدث خطأ', 500) }
}
