import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (auth.user.role === 'instructor') {
      where.instructorId = auth.userId
    }
    if (status !== 'all') where.status = status

    const [requests, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.withdrawalRequest.count({ where }),
    ])

    return apiSuccess({
      requests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor') return apiError('فقط المدراء يمكنهم طلب سحب الأرباح', 403)

    const { amount, paymentMethod, paymentDetails } = await request.json()

    if (!amount || amount <= 0) return apiError('المبلغ غير صالح', 400)

    const minWithdrawal = await prisma.platformConfig.findUnique({ where: { key: 'min_withdrawal' } })
    const min = parseFloat(minWithdrawal?.value || '50')
    if (amount < min) return apiError(`الحد الأدنى للسحب هو $${min}`, 400)

    const settledEarnings = await prisma.instructorEarning.aggregate({
      where: { instructorId: auth.userId, status: 'settled' },
      _sum: { netEarning: true },
    })

    const pendingWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: { instructorId: auth.userId, status: { in: ['pending', 'approved'] } },
      _sum: { amount: true },
    })

    const available = (settledEarnings._sum.netEarning || 0) - (pendingWithdrawals._sum.amount || 0)
    if (amount > available) return apiError(`المبلغ المتاح للسحب هو $${available.toFixed(2)}`, 400)

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        instructorId: auth.userId,
        amount,
        paymentMethod: paymentMethod || 'bank_transfer',
        paymentDetails: paymentDetails || null,
      },
    })

    return apiSuccess({ withdrawal }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}
