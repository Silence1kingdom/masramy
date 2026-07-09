import { prisma } from '@/lib/prisma'
import { getAuthUser, apiError, apiSuccess } from '@/lib/middleware'

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const configs = await prisma.platformConfig.findMany()
    const configMap: Record<string, string> = {}
    configs.forEach(c => { configMap[c.key] = c.value })
    return apiSuccess({ configs: configMap })
  } catch { return apiError('حدث خطأ', 500) }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser(request)
    if (auth instanceof Response) return auth
    if (auth.user.role !== 'admin') return apiError('ليس لديك صلاحية', 403)

    const { key, value, description } = await request.json()
    if (!key || value === undefined) return apiError('البيانات ناقصة', 400)

    if (key === 'commission_rate') {
      const rate = parseFloat(value)
      if (isNaN(rate) || rate < 0 || rate > 100) return apiError('نسبة العمولة يجب أن تكون بين 0 و 100', 400)
    }

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    })

    return apiSuccess({ config })
  } catch { return apiError('حدث خطأ', 500) }
}
