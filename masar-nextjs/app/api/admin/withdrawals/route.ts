import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
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
