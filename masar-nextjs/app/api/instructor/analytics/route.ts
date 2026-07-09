import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'instructor' && auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const period = searchParams.get('period') || '30' // days

    const where: any = { instructorId: auth.userId }
    if (courseId) where.id = parseInt(courseId)

    const courses = await prisma.course.findMany({
      where,
      include: {
        enrollments: {
          select: { id: true, userId: true, progress: true, completed: true, createdAt: true },
        },
        reviews: {
          select: { rating: true, createdAt: true },
        },
        sections: {
          select: { lectures: { select: { id: true } } },
        },
        earnings: {
          select: { saleAmount: true, commission: true, netEarning: true, createdAt: true },
        },
        _count: { select: { enrollments: true, reviews: true } },
      },
    })

    const totalStudents = courses.reduce((acc, c) => acc + c._count.enrollments, 0)
    const totalRevenue = courses.reduce((acc, c) => acc + c.earnings.reduce((e, earning) => e + earning.netEarning, 0), 0)
    const totalCommission = courses.reduce((acc, c) => acc + c.earnings.reduce((e, earning) => e + earning.commission, 0), 0)
    const totalReviews = courses.reduce((acc, c) => acc + c._count.reviews, 0)
    const avgRating = totalReviews > 0
      ? courses.reduce((acc, c) => acc + c.reviews.reduce((r, rev) => r + rev.rating, 0), 0) / totalReviews
      : 0

    const periodDate = new Date()
    periodDate.setDate(periodDate.getDate() - parseInt(period))

    const recentEnrollments = courses.reduce((acc, c) =>
      acc + c.enrollments.filter(e => new Date(e.createdAt) >= periodDate).length, 0)
    const recentRevenue = courses.reduce((acc, c) =>
      acc + c.earnings.filter(e => new Date(e.createdAt) >= periodDate).reduce((s, e) => s + e.netEarning, 0), 0)

    const courseStats = courses.map(c => {
      const totalLectures = c.sections.reduce((acc, s) => acc + s.lectures.length, 0)
      const completedStudents = c.enrollments.filter(e => e.completed).length
      const completionRate = c._count.enrollments > 0 ? Math.round((completedStudents / c._count.enrollments) * 100) : 0
      const avgCourseRating = c._count.reviews > 0
        ? Math.round((c.reviews.reduce((acc, r) => acc + r.rating, 0) / c._count.reviews) * 10) / 10
        : 0
      const courseRevenue = c.earnings.reduce((acc, e) => acc + e.netEarning, 0)

      return {
        id: c.id,
        title: c.title,
        image: c.image,
        status: c.status,
        totalStudents: c._count.enrollments,
        totalLectures,
        completionRate,
        avgRating: avgCourseRating,
        reviewsCount: c._count.reviews,
        revenue: courseRevenue,
        recentEnrollments: c.enrollments.filter(e => new Date(e.createdAt) >= periodDate).length,
      }
    })

    // Monthly earnings for chart (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const monthEarnings = courses.reduce((acc, c) =>
        acc + c.earnings
          .filter(e => new Date(e.createdAt) >= monthStart && new Date(e.createdAt) <= monthEnd)
          .reduce((s, e) => s + e.netEarning, 0), 0)
      const monthEnrollments = courses.reduce((acc, c) =>
        acc + c.enrollments.filter(e => new Date(e.createdAt) >= monthStart && new Date(e.createdAt) <= monthEnd).length, 0)

      monthlyData.push({
        month: monthDate.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }),
        earnings: monthEarnings,
        enrollments: monthEnrollments,
      })
    }

    return apiSuccess({
      summary: {
        totalStudents,
        totalRevenue,
        totalCommission,
        totalCourses: courses.length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        recentEnrollments,
        recentRevenue,
      },
      courseStats,
      monthlyData,
    })
  } catch { return apiError('حدث خطأ', 500) }
}
