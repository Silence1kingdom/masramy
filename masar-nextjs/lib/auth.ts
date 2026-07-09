import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET: string = process.env.JWT_SECRET!
const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables')
}

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// ─── Password Hashing ────────────────────────────────
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Password Strength ───────────────────────────────
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: 'ضعيفة جداً' | 'ضعيفة' | 'متوسطة' | 'قوية' | 'قوية جداً'
  hints: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const hints: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else hints.push('استخدم 8 أحرف على الأقل')

  if (password.length >= 12) score++

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  else if (/[a-zA-Z]/.test(password)) hints.push('أضف حروف كبيرة وصغيرة')

  if (/\d/.test(password)) score++
  else hints.push('أضف أرقام')

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  else hints.push('أضف رموزاً خاصة (!@#$%)')

  const labels: PasswordStrength['label'][] = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً']

  return { score: score as 0|1|2|3|4, label: labels[score], hints }
}

// ─── Token Generation ────────────────────────────────
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' })
}

export function generateTokenPair(payload: JwtPayload): TokenPair {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// ─── Email Normalization ─────────────────────────────
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}
