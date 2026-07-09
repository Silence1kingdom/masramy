import { verifyRefreshToken, generateTokenPair } from '@/lib/auth'
import { apiError, apiSuccess, rateLimit } from '@/lib/middleware'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = rateLimit(`refresh:${ip}`, 20, 60000)
    if (!rl.allowed) return apiError('طلبات كثيرة جداً', 429)

    const { refreshToken } = await request.json()
    if (!refreshToken) return apiError('رمز التحديث مطلوب')

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) return apiError('رمز التحديث غير صالح أو منتهي الصلاحية', 401)

    const tokens = generateTokenPair({ userId: payload.userId, email: payload.email, role: payload.role })

    return apiSuccess(tokens)
  } catch {
    return apiError('حدث خطأ', 500)
  }
}
