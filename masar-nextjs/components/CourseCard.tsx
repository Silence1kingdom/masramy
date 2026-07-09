import Link from 'next/link'
import Image from 'next/image'


function formatReviews(reviews: any, reviewsCount?: number): string {
  if (reviews !== undefined) return reviews
  if (reviewsCount !== undefined) {
    if (reviewsCount >= 1000) return (reviewsCount / 1000).toFixed(1) + 'k'
    return String(reviewsCount)
  }
  return '0'
}

export default function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full cursor-pointer">
        <div className="relative">
          <Image 
            src={course.image} 
            alt={course.title}
            width={600}
            height={300}
            className="w-full h-48 object-cover"
          />
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">
            {course.tag}
          </span>
        </div>
        <div className="p-5 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                {course.category?.name || 'عام'}
              </span>
              <span className="flex items-center gap-1">
                <i className="fa-regular fa-clock"></i> {course.duration}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2 hover:text-indigo-600 transition">
              {course.title}
            </h3>
            <p className="text-xs text-gray-500 mb-4">المدرب: {course.instructor}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 text-sm mb-4">
              <i className="fa-solid fa-star"></i>
              <span className="font-bold text-gray-800">{course.rating}</span>
              <span className="text-gray-400 text-xs">({formatReviews(course.reviews, course.reviewsCount)} تقييم)</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div>
                <span className="text-indigo-600 font-extrabold text-lg">${course.price}</span>
                {course.oldPrice > 0 && <span className="text-gray-400 line-through text-xs ml-1">${course.oldPrice}</span>}
              </div>
              <span className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                اشترك الآن
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
