import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://postgres.qarpyzovxzgfsoxanyol:Awsed1582$$@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres" })
})

async function main() {
  await prisma.platformConfig.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: '15', description: 'نسبة العمولة للمنصة (15%)' }
  })
  await prisma.platformConfig.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: { key: 'platform_name', value: 'مسار أكاديمي', description: 'اسم المنصة' }
  })
  await prisma.platformConfig.upsert({
    where: { key: 'min_withdrawal' },
    update: {},
    create: { key: 'min_withdrawal', value: '50', description: 'الحد الأدنى للسحب ($50)' }
  })
  console.log('Platform config seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
