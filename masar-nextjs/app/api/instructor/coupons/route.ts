import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (auth.user.role === 'instructor') {
      where.instructorId = auth.userId
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          course: { select: { id: true, title: true } },
          instructor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ])

    return apiSuccess({
      coupons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { code, description, discountType, discountValue, minPurchase, maxUses, courseId, expiresAt } = await request.json()

    if (!code || !discountValue) return apiError('البيانات ناقصة', 400)
    if (!['percentage', 'fixed'].includes(discountType || 'percentage')) return apiError('نوع الخصم غير صالح', 400)
    if (discountType === 'percentage' && discountValue > 100) return apiError('نسبة الخصم لا يمكن أن تتجاوز 100%', 400)

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) return apiError('كود الخصم موجود بالفعل', 400)

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (!course) return apiError('الكورس غير موجود', 404)
      if (auth.user.role === 'instructor' && course.instructorId !== auth.userId) {
        return apiError('ليس لديك صلاحية لهذا الكورس', 403)
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType || 'percentage',
        discountValue,
        minPurchase: minPurchase || 0,
        maxUses: maxUses || null,
        courseId: courseId || null,
        instructorId: auth.user.role === 'instructor' ? auth.userId : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return apiSuccess({ coupon }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}
