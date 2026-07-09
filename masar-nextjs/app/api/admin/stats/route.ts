import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const [users, courses, enrollments, ordersCount, reviews] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.order.count(),
      prisma.review.count(),
    ])
    const allOrders = await prisma.order.findMany({ select: { total: true } })
    const revenue = allOrders.reduce((a, o) => a + (o.total || 0), 0).toString()
    const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      include: { user: { select: { name: true, email: true } }, items: { include: { course: { select: { title: true } } } } },
    })
    const courseStatuses = await prisma.course.groupBy({ by: ['status'], _count: true })

    return apiSuccess({
      stats: { users, courses, enrollments, orders: ordersCount, reviews, revenue },
      courseStatuses, recentUsers, recentOrders,
    })
  } catch { return apiError('حدث خطأ', 500) }
}
