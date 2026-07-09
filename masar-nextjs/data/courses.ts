export interface Course {
  id: number;
  title: string;
  category: 'programming' | 'design' | 'marketing' | 'management';
  instructor: string;
  duration: string;
  rating: number;
  reviews: string;
  price: string;
  oldPrice: string;
  tag: string;
  image: string;
  description?: string;
  learningPoints?: string[];
  requirements?: string[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: "دبلومة الويب الكاملة Full-Stack (React & Node.js)",
    category: "programming",
    instructor: "م. أحمد الشاذلي",
    duration: "65 ساعة",
    rating: 4.9,
    reviews: "1.2k",
    price: "$149",
    oldPrice: "$299",
    tag: "الأكثر مبيعاً",
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
    ]
  },
  {
    id: 2,
    title: "تصميم واجهات وتطبيقات الجوال (UI/UX) باستخدام Figma",
    category: "design",
    instructor: "أ. منى التميمي",
    duration: "28 ساعة",
    rating: 4.8,
    reviews: "820",
    price: "$79",
    oldPrice: "$150",
    tag: "جديد",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=600&auto=format&fit=crop",
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
    ]
  },
  {
    id: 3,
    title: "التسويق الرقمي المتكامل وإعلانات السوشيال ميديا",
    category: "marketing",
    instructor: "أ. رامي سليم",
    duration: "32 ساعة",
    rating: 4.7,
    reviews: "640",
    price: "$59",
    oldPrice: "$120",
    tag: "رائج",
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
    ]
  },
  {
    id: 4,
    title: "إدارة المشاريع الرشيقة Agile Scrum للمهندسين والمطورين",
    category: "management",
    instructor: "د. هاني الرفاعي",
    duration: "20 ساعة",
    rating: 4.9,
    reviews: "420",
    price: "$99",
    oldPrice: "$199",
    tag: "مميز",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop",
    description: "تعلم منهجيات Agile و Scrum لإدارة المشاريع البرمجية بكفاءة عالية. سي preparingك هذا الكورس للحصول على شهادة PSM.",
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
    ]
  },
  {
    id: 5,
    title: "برمجة تطبيقات الأندرويد والآيفون عبر Flutter",
    category: "programming",
    instructor: "م. كريم طارق",
    duration: "50 ساعة",
    rating: 4.8,
    reviews: "510",
    price: "$119",
    oldPrice: "$230",
    tag: "موصى به",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
    description: "تعلم بناء تطبيقات الهاتف لنظامي Android و iOS باستخدام لغة Dart و Flutter من Google.",
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
    ]
  },
  {
    id: 6,
    title: "تأسيس الهوية البصرية والعلامات التجارية الاحترافية",
    category: "design",
    instructor: "أ. روان العلي",
    duration: "18 ساعة",
    rating: 4.6,
    reviews: "320",
    price: "$49",
    oldPrice: "$99",
    tag: "شائع",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop",
    description: "تعلم بناء هوية بصرية كاملة للعلامات التجارية من الصفر، من الشعار إلى الدليل البصري الكامل.",
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
    ]
  }
];

export const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'programming', name: 'البرمجة' },
  { id: 'design', name: 'التصميم' },
  { id: 'marketing', name: 'التسويق' },
  { id: 'management', name: 'الإدارة والمشاريع' },
];

export const getCategoryNameInArabic = (cat: string): string => {
  switch(cat) {
    case 'programming': return 'البرمجة والتطوير';
    case 'design': return 'التصميم والواجهات';
    case 'marketing': return 'التسويق الرقمي';
    case 'management': return 'الإدارة والمشاريع';
    default: return 'عام';
  }
};
