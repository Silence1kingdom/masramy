import Image from 'next/image'

export default function AboutPage() {
  return (
    <section className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">عن أكاديمية مسار</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">نؤمن بأن التعليم هو المفتاح لبناء مستقبل أفضل للشباب العربي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">قصتنا</h2>
            <p className="text-gray-600 leading-relaxed">تأسست أكاديمية مسار في عام 2020 بهدف سد الفجوة بين التعليم الأكاديمي والمتطلبات المهنية الحقيقية في سوق العمل التقني العربي.</p>
            <p className="text-gray-600 leading-relaxed">نقدم محتوى تعليمي عالي الجودة في مجالات البرمجة، التصميم، التسويق الرقمي، وإدارة المشاريع، مع التركيز على التطبيق العملي والمشاريع الحقيقية.</p>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-extrabold text-indigo-600">+50,000</p>
                <p className="text-gray-500 text-sm">طالب تخرج</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-600">+200</p>
                <p className="text-gray-500 text-sm">دورة متاحة</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-600">%95</p>
                <p className="text-gray-500 text-sm">نسبة التوظيف</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" 
              alt="Our Team"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-indigo-600 text-white p-6 rounded-xl shadow-lg">
              <p className="text-2xl font-bold">10+</p>
              <p className="text-sm">سنوات من الخبرة</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">رسالتنا</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-lightbulb text-2xl text-indigo-600"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">الابتكار</h3>
              <p className="text-gray-500 text-sm">نستخدم أحدث الأساليب التعليمية والتقنيات لتقديم تجربة فريدة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-handshake text-2xl text-emerald-600"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">الشراكة</h3>
              <p className="text-gray-500 text-sm">نتعاون مع أفضل الشركات والمؤسسات لضمان جودة المحتوى</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-chart-line text-2xl text-amber-600"></i>
              </div>
              <h3 className="font-bold text-lg mb-2">التميز</h3>
              <p className="text-gray-500 text-sm">نسعى دائماً لتقديم أفضل المحتوى وأعلى معايير الجودة</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">فريق العمل</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Team" width={80} height={80} className="rounded-full mx-auto mb-3 object-cover" />
              <h4 className="font-bold">م. أحمد الشاذلي</h4>
              <p className="text-gray-500 text-xs">المدير التقني</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" alt="Team" width={80} height={80} className="rounded-full mx-auto mb-3 object-cover" />
              <h4 className="font-bold">أ. منى التميمي</h4>
              <p className="text-gray-500 text-xs">مديرة التصميم</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" alt="Team" width={80} height={80} className="rounded-full mx-auto mb-3 object-cover" />
              <h4 className="font-bold">أ. رامي سليم</h4>
              <p className="text-gray-500 text-xs">مدير التسويق</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Image src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop" alt="Team" width={80} height={80} className="rounded-full mx-auto mb-3 object-cover" />
              <h4 className="font-bold">د. هاني الرفاعي</h4>
              <p className="text-gray-500 text-xs">مدير المشاريع</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
