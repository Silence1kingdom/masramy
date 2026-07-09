import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, sanitize } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true, name: true, email: true, avatar: true, bio: true,
        createdAt: true, updatedAt: true,
        _count: { select: { enrollments: true, wishlists: true, reviews: true, orders: true } }
      }
    })

    return apiSuccess({ user })
  } catch (error: any) {
    console.error('Me error:', error)
    return apiError('حدث خطأ', 500)
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const body = await request.json()
    const updates: any = {}

    if (body.name !== undefined) {
      const name = sanitize(body.name)
      if (name.length < 2) return apiError('الاسم يجب أن يكون حرفين على الأقل')
      updates.name = name
    }

    if (body.bio !== undefined) {
      updates.bio = sanitize(body.bio).slice(0, 500) || null
    }

    if (body.avatar !== undefined) {
      if (body.avatar && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(body.avatar)) {
        return apiError('رابط الصورة غير صالح')
      }
      updates.avatar = body.avatar || null
    }

    if (!Object.keys(updates).length) return apiError('لا توجد بيانات للتحديث')

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updates,
      select: { id: true, name: true, email: true, avatar: true, bio: true }
    })

    return apiSuccess({ user })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return apiError('حدث خطأ أثناء تحديث الملف الشخصي', 500)
  }
}
