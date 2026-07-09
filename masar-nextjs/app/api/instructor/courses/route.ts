import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize, rateLimit } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'instructor') {
      return apiError('ليس لديك صلاحية الوصول', 403)
    }
    const courses = await prisma.course.findMany({
      where: { instructorId: auth.userId },
      include: { sections: { include: { lectures: true }, orderBy: { orderIndex: 'asc' } }, _count: { select: { enrollments: true } } },
      orderBy: { updatedAt: 'desc' },
    })
    return apiSuccess({ courses })
  } catch (error: any) {
    console.error('Instructor courses error:', error)
    return apiError('حدث خطأ', 500)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin' && auth.user.role !== 'instructor') {
      return apiError('ليس لديك صلاحية إنشاء كورسات', 403)
    }
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`create-course:${ip}`, 10, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً', 429)

    const body = await request.json()
    const title = sanitize(body.title || '')
    if (title.length < 3) return apiError('عنوان الكورس يجب أن يكون 3 أحرف على الأقل')

    const slug = title.replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-').toLowerCase().slice(0, 80) + '-' + Date.now()

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description: sanitize(body.description || ''),
        price: parseFloat(body.price) || 0,
        oldPrice: parseFloat(body.oldPrice) || 0,
        level: body.level || 'جميع المستويات',
        image: body.image || '',
        tag: body.tag || '',
        duration: body.duration || '0',
        instructor: auth.user.name,
        instructorId: auth.userId,
        categoryId: body.categoryId || null,
        learningPoints: body.learningPoints || [],
        requirements: body.requirements || [],
        status: 'draft',
      },
    })
    return apiSuccess({ course }, 201)
  } catch (error: any) {
    console.error('Create course error:', error)
    return apiError('حدث خطأ أثناء إنشاء الكورس', 500)
  }
}
