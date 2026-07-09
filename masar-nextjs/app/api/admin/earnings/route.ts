import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const totalEarnings = await prisma.instructorEarning.aggregate({
      _sum: { saleAmount: true, commission: true, netEarning: true },
      _count: true,
    })

    const platformCommission = await prisma.instructorEarning.aggregate({
      _sum: { commission: true },
    })

    const pendingWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true },
      _count: true,
    })

    const topInstructors = await prisma.instructorEarning.groupBy({
      by: ['instructorId'],
      _sum: { netEarning: true, saleAmount: true },
      _count: true,
      orderBy: { _sum: { netEarning: 'desc' } },
      take: 10,
    })

    const topInstructorDetails = await Promise.all(
      topInstructors.map(async (t) => {
        const user = await prisma.user.findUnique({
          where: { id: t.instructorId },
          select: { id: true, name: true, email: true, avatar: true },
        })
        return { ...t, instructor: user }
      })
    )

    const recentEarnings = await prisma.instructorEarning.findMany({
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const recentWithdrawals = await prisma.withdrawalRequest.findMany({
      include: { instructor: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return apiSuccess({
      summary: {
        totalSales: totalEarnings._sum.saleAmount || 0,
        totalPlatformCommission: platformCommission._sum.commission || 0,
        totalInstructorEarnings: totalEarnings._sum.netEarning || 0,
        totalTransactions: totalEarnings._count,
        pendingWithdrawals: pendingWithdrawals._sum.amount || 0,
        pendingWithdrawalCount: pendingWithdrawals._count,
      },
      topInstructors: topInstructorDetails,
      recentEarnings,
      recentWithdrawals,
    })
  } catch { return apiError('حدث خطأ', 500) }
}
