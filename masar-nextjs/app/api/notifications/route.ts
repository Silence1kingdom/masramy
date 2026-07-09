import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter(n => !n.read).length

    return apiSuccess({ notifications, unreadCount })
  } catch (error: any) {
    console.error('Notifications GET error:', error)
    return apiError('حدث خطأ', 500)
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { notificationId, markAll } = await request.json()

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: auth.userId, read: false },
        data: { read: true },
      })
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
    }

    return apiSuccess({ message: 'تم التحديث' })
  } catch (error: any) {
    console.error('Notifications PUT error:', error)
    return apiError('حدث خطأ', 500)
  }
}
