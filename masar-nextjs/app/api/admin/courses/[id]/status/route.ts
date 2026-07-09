import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)
    const { id } = await params
    const { status } = await request.json()
    if (!['pending', 'approved', 'rejected'].includes(status)) return apiError('حالة غير صالحة')
    await prisma.course.update({ where: { id: parseInt(id) }, data: { status } })
    return apiSuccess({ message: `تم ${status === 'approved' ? 'الموافقة على' : 'رفض'} الكورس` })
  } catch { return apiError('حدث خطأ', 500) }
}
