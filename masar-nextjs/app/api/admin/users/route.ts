import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, provider: true, avatar: true, createdAt: true, _count: { select: { enrollments: true } } },
    })
    return apiSuccess({ users })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { userId, role } = await request.json()
    if (!['student', 'instructor', 'admin'].includes(role)) return apiError('دور غير صالح')
    if (userId === auth.userId) return apiError('لا يمكن تغيير دورك أنت', 400)

    await prisma.user.update({ where: { id: userId }, data: { role } })
    return apiSuccess({ message: 'تم تحديث الدور' })
  } catch { return apiError('حدث خطأ', 500) }
}
