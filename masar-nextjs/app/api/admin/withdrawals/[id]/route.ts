import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { id } = await params
    const { status, adminNote } = await request.json()

    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return apiError('حالة غير صالحة', 400)
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: parseInt(id) },
    })
    if (!withdrawal) return apiError('طلب السحب غير موجود', 404)

    if (status === 'approved' && withdrawal.status !== 'pending') {
      return apiError('هذا الطلب تمت معالجته بالفعل', 400)
    }

    if (status === 'rejected' && withdrawal.status !== 'pending') {
      return apiError('هذا الطلب تمت معالجته بالفعل', 400)
    }

    const updated = await prisma.withdrawalRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNote: adminNote || withdrawal.adminNote,
        processedAt: new Date(),
      },
    })

    if (status === 'approved') {
      await prisma.notification.create({
        data: {
          userId: withdrawal.instructorId,
          type: 'withdrawal_approved',
          title: 'تم الموافقة على طلب السحب',
          message: `تم الموافقة على طلب سحب بقيمة $${withdrawal.amount}`,
          link: '/instructor/earnings',
        },
      })
    }

    if (status === 'rejected') {
      await prisma.notification.create({
        data: {
          userId: withdrawal.instructorId,
          type: 'withdrawal_rejected',
          title: 'تم رفض طلب السحب',
          message: `تم رفض طلب سحب بقيمة $${withdrawal.amount}. ${adminNote || ''}`,
          link: '/instructor/earnings',
        },
      })
    }

    return apiSuccess({ withdrawal: updated })
  } catch { return apiError('حدث خطأ', 500) }
}
