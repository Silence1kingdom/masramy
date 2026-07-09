import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

// POST - Generate certificate for completed course
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const { courseId } = await request.json()
    if (!courseId) return apiError('معرف الكورس مطلوب', 400)

    // Check enrollment and completion
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } },
      include: { course: { include: { sections: { include: { lectures: true } } } } },
    })
    if (!enrollment) return apiError('أنت غير مسجل في هذا الكورس', 404)

    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } },
    })
    if (existing) return apiSuccess({ certificate: existing, message: 'الشهادة موجودة بالفعل' })

    // Check if course is completed (all lectures done)
    const totalLectures = enrollment.course.sections.reduce((acc: number, s: any) => acc + s.lectures.length, 0)
    const completedLectures = await prisma.lectureProgress.count({
      where: {
        userId: auth.userId,
        completed: true,
        lecture: { section: { courseId } },
      },
    })

    if (completedLectures < totalLectures) {
      return apiError('يجب إكمال جميع محاضرات الكورس أولاً', 400)
    }

    // Generate certificate number
    const year = new Date().getFullYear()
    const count = await prisma.certificate.count()
    const certificateNumber = `MASAR-${year}-${String(count + 1).padStart(6, '0')}`

    const certificate = await prisma.certificate.create({
      data: {
        userId: auth.userId,
        courseId,
        certificateNumber,
        completedAt: new Date(),
      },
      include: {
        course: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    })

    // Mark enrollment as completed
    await prisma.enrollment.update({
      where: { userId_courseId: { userId: auth.userId, courseId } },
      data: { completed: true, progress: 100 },
    })

    // Notify instructor
    if (enrollment.course.instructorId) {
      await prisma.notification.create({
        data: {
          userId: enrollment.course.instructorId,
          type: 'course_completed',
          title: 'طالب أكمل الكورس!',
          message: `أكمل ${auth.user.name} كورس "${enrollment.course.title}" وحصل على شهادة`,
          link: '/instructor',
        },
      })
    }

    return apiSuccess({ certificate }, 201)
  } catch { return apiError('حدث خطأ', 500) }
}

// GET - Get user's certificates
export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const certificates = await prisma.certificate.findMany({
      where: { userId: auth.userId },
      include: {
        course: { select: { id: true, title: true, image: true, instructor: true } },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return apiSuccess({ certificates })
  } catch { return apiError('حدث خطأ', 500) }
}
