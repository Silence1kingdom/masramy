import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

const coursesData = [
  {
    title: "دبلومة الويب الكاملة Full-Stack (React & Node.js)",
    slug: "full-stack-react-nodejs",
    categorySlug: "programming",
    price: 149,
    oldPrice: 299,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
    description: "هذا الكورس الشامل سيبدأ معك من الصفر حتى الاحتراف في تطوير الويب الكامل. ستتعلم React للواجهة الأمامية و Node.js للخادوم مع قواعد البيانات PostgreSQL.",
    learningPoints: [
      "أساسيات HTML, CSS, JavaScript",
      "تطوير الواجهات الأمامية باستخدام React.js",
      "بناء API باستخدام Node.js و Express",
      "إدارة قواعد البيانات مع PostgreSQL",
      "نشر المشاريع على سحابات AWS و Vercel",
      "بناء مشاريع حقيقية كاملة"
    ],
    requirements: [
      "جهاز كمبيوتر متصل بالإنترنت",
      "لا تحتاج لخبرة سابقة",
      "الرغبة في التعلم والممارسة"
    ],
    level: "جميع المستويات",
    videoUrl: "https://www.youtube.com/watch?v=example1"
  },
  {
    title: "تصميم واجهات وتطبيقات الجوال (UI/UX) باستخدام Figma",
    slug: "ui-ux-figma",
    categorySlug: "design",
    price: 79,
    oldprice: 150,
    image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=600&auto=format&fit=crop",
    description: "تعلم تصميم واجهات المستخدم وتجربة المستخدم من الصفر باستخدام Figma. ستصمم تطبيقات جوال ومواقع ويب احترافية.",
    learningPoints: [
      "مبادئ التصميم الأساسية ونظرية الألوان",
      "استخدام Figma بشكل احترافي",
      "تصميم Wireframes و Prototypes",
      "مبادئ UX و سلوك المستخدم",
      "بناء Portfolio احترافي"
    ],
    requirements: [
      "جهاز كمبيوتر (Windows أو Mac)",
      "حساب مجاني على Figma",
      "لا تحتاج لخبرة سابقة في التصميم"
    ],
    level: "مبتدئ",
    videoUrl: "https://www.youtube.com/watch?v=example2"
  },
  {
    title: "التسويق الرقمي المتكامل وإعلانات السوشيال ميديا",
    slug: "digital-marketing-social-media",
    categorySlug: "marketing",
    price: 59,
    oldprice: 120,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
    description: "كورس شامل في التسويق الرقمي يغطي جميع القنوات الرقمية من SEO إلى الإعلانات المدفوعة وتسويق المحتوى.",
    learningPoints: [
      "أساسيات التسويق الرقمي",
      "تحسين محركات البحث SEO",
      "إدارة حملات Google Ads",
      "التسويق عبر وسائل التواصل الاجتماعي",
      "تحليل البيانات وقياس النتائج",
      "بناء استراتيجية تسويقية كاملة"
    ],
    requirements: [
      "اتصال بالإنترنت",
      "حسابات على وسائل التواصل الاجتماعي",
      "لا تحتاج لخبرة سابقة"
    ],
    level: "جميع المستويات",
    videoUrl: "https://www.youtube.com/watch?v=example3"
  },
  {
    title: "إدارة المشاريع الرشيقة Agile Scrum للمهندسين والمطورين",
    slug: "agile-scrum",
    categorySlug: "management",
    price: 99,
    oldprice: 199,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
    description: "تعلم منهجيات Agile و Scrum لإدارة المشاريع البرمجية بكفاءة عالية. ستحصل على شهادة PSM.",
    learningPoints: [
      "مبادئ Agile宣言 والقيم",
      "دور Product Owner و Scrum Master",
      "التخطيط والتقييم في Scrum",
      "أدوات إدارة المشاريع",
      "التعامل مع الفرق البعيدة"
    ],
    requirements: [
      "خبرة في العمل مع فرق",
      "فهم أساسي للمشاريع البرمجية"
    ],
    level: "متوسط",
    videoUrl: "https://www.youtube.com/watch?v=example4"
  },
  {
    title: "برمجة تطبيقات الأندرويد والآيفون عبر Flutter",
    slug: "flutter-mobile-apps",
    categorySlug: "programming",
    price: 119,
    oldprice: 230,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
    description: "تعلم بناء تطبيقات الهاتف لنظامي Android و iOS باستخدام Flutter من Google.",
    learningPoints: [
      "لغة Dart fundamentals",
      "بناء واجهات المستخدم مع Flutter",
      "التعامل مع APIs و البيانات",
      "نشر التطبيقات على المتاجر",
      "بناء تطبيقات حقيقية متعددة"
    ],
    requirements: [
      "جهاز كمبيوتر (Windows, Mac, أو Linux)",
      "لا تحتاج لخبرة سابقة"
    ],
    level: "مبتدئ",
    videoUrl: "https://www.youtube.com/watch?v=example5"
  },
  {
    title: "تأسيس الهوية البصرية والعلامات التجارية الاحترافية",
    slug: "brand-identity-design",
    categorySlug: "design",
    price: 49,
    oldprice: 99,
    image: "https://images.unsplash.com/photo-1626785774573-4b315799345d?q=80&w=600&auto=format&fit=crop",
    description: "تعلم بناء هوية بصرية كاملة للعلامات التجارية من الصفر، من الشعار إلى الدليل البصري.",
    learningPoints: [
      "مبادئ التصميم البصري",
      "بناء الهوية البصرية للعلامة التجارية",
      "تصميم الشعارات الاحترافية",
      "إعداد الدليل البصري (Brand Guidelines)",
      "تقديم المشروع للعملاء"
    ],
    requirements: [
      "جهاز كمبيوتر",
      "Adobe Illustrator أو Figma"
    ],
    level: "مبتدئ",
    videoUrl: "https://www.youtube.com/watch?v=example6"
  }
]

async function main() {
  console.log('🌱 Seeding courses...')

  await prisma.course.deleteMany()

  const categories = await prisma.category.findMany()
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!adminUser) throw new Error('No admin user found. Run the migration first.')

  for (const courseData of coursesData) {
    const category = categories.find(c => c.slug === courseData.categorySlug)
    if (!category) {
      console.log(`  ⚠️  Category not found for slug: ${courseData.categorySlug}, skipping...`)
      continue
    }
    const { categorySlug, ...data } = courseData
    await prisma.course.create({
      data: {
        ...data,
        categoryId: category.id,
        instructorId: adminUser.id,
        status: 'approved',
      }
    })
    console.log(`  ✅ ${courseData.title}`)
  }

  console.log(`\n✨ Seeding complete! ${coursesData.length} courses created.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
