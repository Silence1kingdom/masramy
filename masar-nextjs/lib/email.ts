import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER) {
      console.log('SMTP not configured, skipping email:', subject)
      return true
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"مسار أكاديمي" <noreply@masar-academy.com>',
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

function emailTemplate(subject: string, html: string): { subject: string; html: string } {
  return { subject, html }
}

export function welcomeEmail(name: string) {
  return emailTemplate(
    'مرحباً بك في مسار أكاديمي!',
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">مسار أكاديمي</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 5px;">Masar Academy</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">مرحباً ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            يسعدنا انضمامك إلى منصة مسار أكاديمي. هنا ستجد عشرات الكورسات التدريبية في مختلف المجالات.
          </p>
          <p style="color: #4b5563; line-height: 1.8;">
            ابدأ رحلتك التعليمية الآن واستكشف الكورسات المتاحة.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">تصفح الكورسات</a>
          </div>
        </div>
        <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} مسار أكاديمي - جميع الحقوق محفوظة
        </p>
      </div>
    `
  )
}

export function enrollmentEmail(studentName: string, courseTitle: string, instructorName: string) {
  return emailTemplate(
    `تم تسجيلك في كورس "${courseTitle}"`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">تم التسجيل بنجاح!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">مرحباً ${studentName}</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            تم تسجيلك بنجاح في كورس <strong>"${courseTitle}"</strong>
          </p>
          <p style="color: #4b5563; line-height: 1.8;">
            المدرب: ${instructorName}
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">ابدأ التعلم</a>
          </div>
        </div>
      </div>
    `
  )
}

export function saleAlertEmail(instructorName: string, courseTitle: string, buyerName: string, amount: number) {
  return emailTemplate(
    `بيع جديد في كورس "${courseTitle}"`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">بيع جديد!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">مرحباً ${instructorName}</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            تم شراء كورس <strong>"${courseTitle}"</strong> بواسطة ${buyerName}
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #6b7280; margin: 0;">المبلغ</p>
            <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 5px 0;">$${amount.toFixed(2)}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/instructor/earnings" style="background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">عرض الأرباح</a>
          </div>
        </div>
      </div>
    `
  )
}

export function completionEmail(studentName: string, courseTitle: string) {
  return emailTemplate(
    `تهانينا! أكملت كورس "${courseTitle}"`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🎓 تهانينا!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">أحسنت ${studentName}!</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            لقد أتممت بنجاح كورس <strong>"${courseTitle}"</strong>
          </p>
          <p style="color: #4b5563; line-height: 1.8;">
            يمكنك الآن تحميل شهادة إتمام الكورس.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/certificates" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">تحميل الشهادة</a>
          </div>
        </div>
      </div>
    `
  )
}

export function newQuestionEmail(instructorName: string, studentName: string, courseTitle: string, questionTitle: string) {
  return emailTemplate(
    `سؤال جديد في كورس "${courseTitle}"`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">سؤال جديد</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">مرحباً ${instructorName}</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            ${studentName} سأل سؤالاً جديداً في كورس <strong>"${courseTitle}"</strong>
          </p>
          <div style="background: white; padding: 15px; border-radius: 8px; border-right: 3px solid #2563eb; margin: 20px 0;">
            <p style="color: #1f2937; font-weight: bold; margin: 0;">${questionTitle}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/courses" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">عرض السؤال</a>
          </div>
        </div>
      </div>
    `
  )
}

export function newReviewEmail(instructorName: string, courseTitle: string, reviewerName: string, rating: number, comment: string) {
  const stars = '⭐'.repeat(rating)
  return emailTemplate(
    `تقييم جديد في كورس "${courseTitle}"`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">تقييم جديد</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1f2937;">مرحباً ${instructorName}</h2>
          <p style="color: #4b5563; line-height: 1.8;">
            قام ${reviewerName} بتقييم كورس <strong>"${courseTitle}"</strong>
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 24px; margin: 0;">${stars}</p>
            <p style="color: #6b7280; margin: 5px 0;">${rating} من 5</p>
          </div>
          ${comment ? `<div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #4b5563; margin: 0;">"${comment}"</p></div>` : ''}
        </div>
      </div>
    `
  )
}
