import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, getPaginationParams, buildPaginationMeta, apiSuccessWithPagination } from '@/lib/middleware'
import { sendEmail, enrollmentEmail, saleAlertEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { courseId, couponCode } = await request.json()
    if (!courseId) return apiError('معرف الكورس مطلوب')

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return apiError('الكورس غير موجود', 404)

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } }
    })
    if (existing) return apiError('أنت مسجل بالفعل في هذه الدورة', 409)

    let discount = 0
    let couponId: number | null = null
    const subtotal = course.price

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (!coupon || !coupon.active) return apiError('كود الخصم غير صالح', 400)
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return apiError('هذا الكود منتهي الصلاحية', 400)
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return apiError('هذا الكود وصل للحد الأقصى', 400)
      if (coupon.courseId && coupon.courseId !== courseId) return apiError('هذا الكود غير صالح لهذا الكورس', 400)

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100
      } else {
        discount = Math.min(coupon.discountValue, subtotal)
      }
      couponId = coupon.id
    }

    const finalTotal = Math.max(0, subtotal - discount)

    const commissionConfig = await prisma.platformConfig.findUnique({ where: { key: 'commission_rate' } })
    const commissionRate = parseFloat(commissionConfig?.value || '15')
    const commission = (finalTotal * commissionRate) / 100
    const netEarning = finalTotal - commission

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: auth.userId,
          total: subtotal,
          discount,
          finalTotal,
          couponId,
          status: 'completed',
          items: { create: { courseId, price: course.price } }
        },
        include: { items: { include: { course: true } } }
      }),
      prisma.enrollment.create({
        data: { userId: auth.userId, courseId }
      }),
      prisma.course.update({
        where: { id: courseId },
        data: { totalEnrollments: { increment: 1 } }
      }),
    ])

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } }
      })
    }

    if (course.instructorId) {
      await prisma.instructorEarning.create({
        data: {
          instructorId: course.instructorId,
          courseId,
          orderId: order.id,
          saleAmount: finalTotal,
          commissionRate,
          commission,
          netEarning,
          status: 'pending',
        },
      })
    }

    if (course.instructorId) {
      await prisma.notification.create({
        data: {
          userId: course.instructorId,
          type: 'new_sale',
          title: 'بيع جديد!',
          message: `تم شراء كورس "${course.title}" بقيمة $${finalTotal.toFixed(2)}`,
          link: '/instructor/earnings',
        },
      })

      const instructor = await prisma.user.findUnique({ where: { id: course.instructorId }, select: { email: true, name: true } })
      if (instructor) {
        const buyer = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } })
        const saleEmail = saleAlertEmail(instructor.name, course.title, buyer?.name || 'طالب', finalTotal)
        sendEmail({ to: instructor.email, subject: saleEmail.subject, html: saleEmail.html }).catch(() => {})
      }
    }

    const enrollEmail = enrollmentEmail(auth.user.name, course.title, course.instructor)
    sendEmail({ to: auth.user.email || '', subject: enrollEmail.subject, html: enrollEmail.html }).catch(() => {})

    return apiSuccess({ order, message: `تم شراء "${course.title}" بنجاح!` }, 201)
  } catch (error: any) {
    console.error('Order error:', error)
    return apiError('حدث خطأ أثناء الشراء', 500)
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const pagination = getPaginationParams(searchParams)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: auth.userId },
        include: {
          items: { include: { course: true } },
          coupon: { select: { code: true, discountType: true, discountValue: true } },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where: { userId: auth.userId } })
    ])

    const meta = buildPaginationMeta(total, pagination)
    return apiSuccessWithPagination({ orders }, meta)
  } catch (error: any) {
    console.error('Orders error:', error)
    return apiError('حدث خطأ', 500)
  }
}
