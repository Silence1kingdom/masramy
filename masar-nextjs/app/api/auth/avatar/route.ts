import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess, rateLimit } from '@/lib/middleware'
import { getSupabase } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`avatar:${ip}`, 5, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً، حاول بعد دقيقة', 429)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return apiError('الملف مطلوب')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return apiError('نوع الملف غير مدعوم. يُسمح فقط بـ JPG, PNG, WebP, GIF')
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return apiError('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `avatars/${auth.userId}-${Date.now()}.${ext}`

    const supabase = getSupabase()
    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      return apiError('حدث خطأ أثناء رفع الصورة')
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

    await prisma.user.update({
      where: { id: auth.userId },
      data: { avatar: urlData.publicUrl },
    })

    return apiSuccess({ avatar: urlData.publicUrl })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return apiError('حدث خطأ أثناء رفع الصورة', 500)
  }
}
