import { NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { prisma } from './prisma'

// ─── Types ───────────────────────────────────────────
export interface AuthResult {
  userId: number
  email: string
  user: { id: number; name: string; email: string; role: string }
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  pagination?: PaginationMeta
}

// ─── Auth ────────────────────────────────────────────
export async function getAuthUser(request: Request): Promise<AuthResult | NextResponse> {
  let token: string | null = null

  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/accessToken=([^;]+)/)
    if (match) {
      token = match[1]
    }
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'يجب تسجيل الدخول أولاً' },
      { status: 401 }
    )
  }
  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'رمز الدخول غير صالح أو منتهي الصلاحية' },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'المستخدم غير موجود' },
      { status: 404 }
    )
  }

  return { userId: payload.userId, email: payload.email, user }
}

// ─── Response Helpers ────────────────────────────────
export function apiSuccess<T>(data?: T, status: number = 200) {
  const body: ApiResponse<T> = { success: true }
  if (data !== undefined) body.data = data
  return NextResponse.json(body, { status })
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

export function apiSuccessWithPagination<T>(
  data: T,
  pagination: PaginationMeta
) {
  return NextResponse.json(
    { success: true, data, pagination },
    { status: 200 }
  )
}

// ─── Pagination ──────────────────────────────────────
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  return { page, limit, skip: (page - 1) * limit }
}

export function buildPaginationMeta(total: number, params: PaginationParams): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit)
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  }
}

// ─── Validation ──────────────────────────────────────
export const validators = {
  email: (email: string): string | null => {
    if (!email?.trim()) return 'البريد الإلكتروني مطلوب'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'البريد الإلكتروني غير صالح'
    return null
  },

  password: (password: string): string | null => {
    if (!password) return 'كلمة المرور مطلوبة'
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    if (password.length > 128) return 'كلمة المرور طويلة جداً'
    return null
  },

  name: (name: string): string | null => {
    if (!name?.trim()) return 'الاسم مطلوب'
    if (name.trim().length < 2) return 'الاسم يجب أن يكون حرفين على الأقل'
    if (name.trim().length > 100) return 'الاسم طويل جداً'
    return null
  },

  required: (value: any, field: string): string | null => {
    if (!value?.toString().trim()) return `${field} مطلوب`
    return null
  },

  minLength: (value: string, min: number, field: string): string | null => {
    if (value.trim().length < min) return `${field} يجب أن يكون ${min} أحرف على الأقل`
    return null
  },

  maxLength: (value: string, max: number, field: string): string | null => {
    if (value.trim().length > max) return `${field} طويل جداً (الحد الأقصى ${max} حرف)`
    return null
  },

  number: (value: any, field: string): string | null => {
    const num = parseInt(value)
    if (isNaN(num)) return `${field} يجب أن يكون رقماً`
    return null
  },

  range: (value: number, min: number, max: number, field: string): string | null => {
    if (value < min || value > max) return `${field} يجب أن يكون بين ${min} و ${max}`
    return null
  },
}

// ─── Input Sanitization ──────────────────────────────
export function sanitize(str: string): string {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

// ─── Simple In-Memory Rate Limiter ───────────────────
// ملاحظة: هذا الـ rate limiter يعمل لكل instance بشكل منفصل
// في بيئة Vercel serverless قد لا يكون دقيقاً 100%
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
let lastCleanup = Date.now()

export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()

  // Cleanup stale entries كل 5 دقائق عند الطلب
  if (now - lastCleanup > 300000) {
    lastCleanup = now
    Array.from(rateLimitMap.entries()).forEach(([k, entry]) => {
      if (now > entry.resetAt) rateLimitMap.delete(k)
    })
  }

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}
