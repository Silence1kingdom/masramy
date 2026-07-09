import { prisma } from '@/lib/prisma'
import { apiError, apiSuccessWithPagination, getPaginationParams, buildPaginationMeta } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pagination = getPaginationParams(searchParams)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const instructor = searchParams.get('instructor')
    const level = searchParams.get('level')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const free = searchParams.get('free')
    const tag = searchParams.get('tag')

    const where: any = { status: 'approved' }

    if (category && category !== 'all') {
      where.categoryId = parseInt(category)
    }

    if (search) {
      const q = search
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { instructor: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (instructor) where.instructor = { contains: instructor, mode: 'insensitive' }
    if (level) where.level = level
    if (minRating > 0) where.rating = { gte: minRating }
    if (tag) where.tag = { contains: tag, mode: 'insensitive' }

    if (free === 'true') {
      where.price = 0
    } else {
      where.price = { gte: minPrice, lte: maxPrice }
    }

    let orderBy: any = {}
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'rating': orderBy = { rating: 'desc' }; break
      case 'popular': orderBy = { totalEnrollments: 'desc' }; break
      case 'newest':
      default: orderBy = { createdAt: 'desc' }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true, reviews: true } },
          sections: { select: { _count: { select: { lectures: true } } } },
        },
      }),
      prisma.course.count({ where }),
    ])

    const meta = buildPaginationMeta(total, pagination)
    return apiSuccessWithPagination({ courses }, meta)
  } catch (error: any) {
    console.error('Courses error:', error)
    return apiError('حدث خطأ أثناء جلب الكورسات', 500)
  }
}
