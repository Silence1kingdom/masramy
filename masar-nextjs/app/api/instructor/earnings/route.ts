import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = { instructorId: auth.userId }
    if (courseId) where.courseId = parseInt(courseId)
    if (status !== 'all') where.status = status

    const [earnings, total] = await Promise.all([
      prisma.instructorEarning.findMany({
        where,
        include: {
          course: { select: { title: true, image: true } },
          order: { select: { createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.instructorEarning.count({ where }),
    ])

    const summary = await prisma.instructorEarning.aggregate({
      where: { instructorId: auth.userId },
      _sum: { saleAmount: true, commission: true, netEarning: true },
      _count: true,
    })

    const settledSummary = await prisma.instructorEarning.aggregate({
      where: { instructorId: auth.userId, status: 'settled' },
      _sum: { netEarning: true },
    })

    const pendingSummary = await prisma.instructorEarning.aggregate({
      where: { instructorId: auth.userId, status: 'pending' },
      _sum: { netEarning: true },
    })

    return apiSuccess({
      earnings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: {
        totalSales: summary._sum.saleAmount || 0,
        totalCommission: summary._sum.commission || 0,
        totalEarnings: summary._sum.netEarning || 0,
        settledEarnings: settledSummary._sum.netEarning || 0,
        pendingEarnings: pendingSummary._sum.netEarning || 0,
        totalTransactions: summary._count,
      },
    })
  } catch { return apiError('حدث خطأ', 500) }
}
