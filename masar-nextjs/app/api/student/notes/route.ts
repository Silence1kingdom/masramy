import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// GET - Get notes for a lecture
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const lectureId = searchParams.get('lectureId')
    if (!lectureId) return apiError('معرف المحاضرة مطلوب', 400)

    const notes = await prisma.studentNote.findMany({
      where: { userId: auth.userId, lectureId: parseInt(lectureId) },
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess({ notes })
  } catch { return apiError('حدث خطأ', 500) }
}

// POST - Create a note
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { lectureId, content, timestamp } = await request.json()
    if (!lectureId || !content) return apiError('البيانات ناقصة', 400)

    const note = await prisma.studentNote.create({
      data: { userId: auth.userId, lectureId, content, timestamp },
    })

    return apiSuccess({ note })
  } catch { return apiError('حدث خطأ', 500) }
}

// DELETE - Delete a note
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return apiError('معرف الملاحظة مطلوب', 400)

    await prisma.studentNote.deleteMany({
      where: { id: parseInt(id), userId: auth.userId },
    })

    return apiSuccess({ message: 'تم حذف الملاحظة' })
  } catch { return apiError('حدث خطأ', 500) }
}
