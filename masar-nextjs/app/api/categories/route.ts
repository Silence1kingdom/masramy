import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/middleware'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { courses: { where: { status: 'approved' } } } } },
    })
    const all = { id: 'all', name: 'الكل', slug: 'all', count: categories.reduce((a, c) => a + c._count.courses, 0) }
    return apiSuccess({ categories: [all, ...categories] })
  } catch {
    return apiSuccess({ categories: [{ id: 'all', name: 'الكل', slug: 'all', count: 0 }] })
  }
}
