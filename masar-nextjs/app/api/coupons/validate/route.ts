import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const { code, courseId } = await request.json()

    if (!code) return apiError('أدخل كود الخصم', 400)

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { course: { select: { id: true, title: true, price: true } } },
    })

    if (!coupon) return apiError('كود الخصم غير صالح', 404)
    if (!coupon.active) return apiError('هذا الكود غير نشط', 400)
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return apiError('هذا الكود منتهي الصلاحية', 400)
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return apiError('هذا الكود وصل للحد الأقصى من الاستخدام', 400)
    }

    if (coupon.courseId && courseId && coupon.courseId !== courseId) {
      return apiError('هذا الكود غير صالح لهذا الكورس', 400)
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = coupon.discountValue
    } else {
      discount = coupon.discountValue
    }

    return apiSuccess({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        course: coupon.course,
      },
      discount,
    })
  } catch { return apiError('حدث خطأ', 500) }
}
