import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, getPaginationParams, buildPaginationMeta, apiSuccessWithPagination } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const pagination = getPaginationParams(searchParams)

    const [wishlist, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: auth.userId },
        include: { course: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wishlist.count({ where: { userId: auth.userId } })
    ])

    const meta = buildPaginationMeta(total, pagination)
    return apiSuccessWithPagination({ wishlist }, meta)
  } catch (error: any) {
    console.error('Wishlist error:', error)
    return apiError('حدث خطأ', 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { courseId } = await request.json()
    if (!courseId) return apiError('معرف الكورس مطلوب')

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const existing = await prisma.wishlist.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } }
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return apiSuccess({ message: 'تم إزالة الكورس من المفضلة', wishlisted: false })
    }

    await prisma.wishlist.create({ data: { userId: auth.userId, courseId } })

    return apiSuccess({ message: 'تم إضافة الكورس إلى المفضلة', wishlisted: true }, 201)
  } catch (error: any) {
    console.error('Wishlist toggle error:', error)
    return apiError('حدث خطأ', 500)
  }
}
