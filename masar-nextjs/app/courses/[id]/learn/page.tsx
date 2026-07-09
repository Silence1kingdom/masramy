'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function LearnPage() {
  const params = useParams()
  const courseId = params.id as string
  const { user, token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentLecture, setCurrentLecture] = useState<any>(null)
  const [lectureProgress, setLectureProgress] = useState(new Map())
  const [activeTab, setActiveTab] = useState<'content' | 'qa' | 'quizzes'>('content')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [autoPlay, setAutoPlay] = useState(true)

  // Q&A state
  const [questions, setQuestions] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' })
  const [newAnswer, setNewAnswer] = useState<Record<number, string>>({})
  const [qaLoading, setQaLoading] = useState(false)

  // Quiz state
  const [quizzes, setQuizzes] = useState<any[]>([])

  // Certificate state
  const [certificate, setCertificate] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [totalLectures, setTotalLectures] = useState(0)
  const [completedLectures, setCompletedLectures] = useState(0)

  useEffect(() => {
    if (!token || !courseId) return
    fetchData()
  }, [token, courseId])

  const fetchData = async () => {
    try {
      const [learnRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/learn`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/instructor/quizzes?courseId=${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const learnData = await learnRes.json()
      const quizzesData = await quizzesRes.json()

      if (learnData.success) {
        setData(learnData.data)
        const pMap = new Map()
        Object.entries(learnData.data.progressMap || {}).forEach(([k, v]: any) => pMap.set(parseInt(k), v))
        setLectureProgress(pMap)

        const total = learnData.data.totalLectures || 0
        const completed = learnData.data.completedLectures || 0
        setTotalLectures(total)
        setCompletedLectures(completed)
        setProgress(total > 0 ? Math.round((completed / total) * 100) : 0)

        const firstUnwatched = learnData.data.course.sections?.flatMap((s: any) => s.lectures || []).find((l: any) => !pMap.get(l.id)?.completed)
        if (firstUnwatched) setCurrentLecture(firstUnwatched)
        else {
          const first = learnData.data.course.sections?.[0]?.lectures?.[0]
          if (first) setCurrentLecture(first)
        }

        if (completed === total && total > 0) {
          const certRes = await fetch('/api/student/certificates', { headers: { Authorization: `Bearer ${token}` } })
          const certData = await certRes.json()
          if (certData.success) {
            const existing = certData.data.certificates.find((c: any) => c.course.id === parseInt(courseId))
            if (existing) setCertificate(existing)
          }
        }
      }
      if (quizzesData.success) setQuizzes(quizzesData.data.quizzes || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const markComplete = async (lectureId: number) => {
    const res = await fetch(`/api/lectures/${lectureId}/progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ completed: true, timeSpentSeconds: 0 }),
    })
    const d = await res.json()
    if (d.success) {
      setLectureProgress(prev => { const n = new Map(prev); n.set(lectureId, { completed: true }); return n })
      setCompletedLectures(prev => prev + 1)
      setProgress(totalLectures > 0 ? Math.round(((completedLectures + 1) / totalLectures) * 100) : 0)

      if (autoPlay && currentLecture) {
        const allLectures = data?.course.sections?.flatMap((s: any) => s.lectures || []) || []
        const idx = allLectures.findIndex((l: any) => l.id === lectureId)
        if (idx >= 0 && idx < allLectures.length - 1) {
          setCurrentLecture(allLectures[idx + 1])
        }
      }
    }
  }

  const fetchQuestions = async () => {
    setQaLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/questions`, { headers: { Authorization: `Bearer ${token}` } })
      const d = await res.json()
      if (d.success) setQuestions(d.data.questions)
    } catch (e) { console.error(e) }
    setQaLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'qa' && courseId) fetchQuestions()
  }, [activeTab, courseId])

  const submitQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) return
    try {
      const res = await fetch(`/api/courses/${courseId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newQuestion),
      })
      const d = await res.json()
      if (d.success) {
        setQuestions(prev => [d.data.question, ...prev])
        setNewQuestion({ title: '', content: '' })
      }
    } catch (e) { console.error(e) }
  }

  const submitAnswer = async (questionId: number) => {
    const content = newAnswer[questionId]
    if (!content) return
    try {
      const res = await fetch(`/api/courses/${courseId}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      })
      const d = await res.json()
      if (d.success) {
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: [...q.answers, d.data.answer], _count: { ...q._count, answers: q._count.answers + 1 } } : q))
        setNewAnswer(prev => ({ ...prev, [questionId]: '' }))
      }
    } catch (e) { console.error(e) }
  }

  const getCertificate = async () => {
    try {
      const res = await fetch('/api/student/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: parseInt(courseId) }),
      })
      const d = await res.json()
      if (d.success) setCertificate(d.data.certificate)
      else alert(d.error)
    } catch (e) { console.error(e) }
  }

  const handlePrintCert = () => {
    if (!certificate || !user) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>شهادة - ${certificate.certificateNumber}</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');body{margin:0;padding:40px;font-family:'Cairo',sans-serif;background:#f5f5f5}.cert{width:800px;margin:0 auto;background:white;padding:60px;border:3px solid #4f46e5;border-radius:12px;text-align:center;position:relative}.cert::before{content:'';position:absolute;top:10px;left:10px;right:10px;bottom:10px;border:1px solid #c7d2fe;border-radius:8px}.logo{font-size:28px;font-weight:700;color:#4f46e5;margin-bottom:10px}.title{font-size:24px;font-weight:700;color:#1f2937;margin:20px 0}.name{font-size:32px;font-weight:700;color:#4f46e5;margin:20px 0;padding:10px 0;border-bottom:2px solid #e5e7eb;display:inline-block}.course{font-size:18px;color:#374151;margin:20px 0}.details{display:flex;justify-content:space-between;margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb}.detail{text-align:center}.detail-label{font-size:12px;color:#9ca3af}.detail-value{font-size:14px;font-weight:600;color:#374151}@media print{body{background:white}}</style></head><body>
    <div class="cert"><div class="logo">مسار أكاديمي</div><div style="color:#6b7280;font-size:14px">Masar Academy</div>
    <div class="title">شهادة إتمام دورة تدريبية</div><p style="color:#6b7280">تُشهد بأن</p><div class="name">${user.name}</div>
    <p style="color:#6b7280">لقد أتم بنجاح دورة</p><div class="course">${data?.course?.title || ''}</div>
    <div class="details"><div class="detail"><div class="detail-label">رقم الشهادة</div><div class="detail-value">${certificate.certificateNumber}</div></div>
    <div class="detail"><div class="detail-label">تاريخ الإصدار</div><div class="detail-value">${new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}</div></div>
    <div class="detail"><div class="detail-label">المدرب</div><div class="detail-value">${data?.course?.instructor || ''}</div></div></div></div>
    <script>window.onload=function(){window.print()}</script></body></html>`)
    w.document.close()
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">تسجيل الدخول</Link></div>
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">جاري التحميل...</div>
  if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">غير مسجل في هذا الكورس</div>

  const { course } = data
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-arrow-right"></i></Link>
            <Link href={`/courses/${courseId}`} className="text-gray-700 font-bold text-sm hover:text-indigo-600">{course.title}</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-gray-500">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentLecture && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-4">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <i className={`${currentLecture.type === 'video' ? 'fa-solid fa-video text-indigo-500' : 'fa-solid fa-file-lines text-emerald-500'}`}></i>
                  <h2 className="font-bold text-lg">{currentLecture.title}</h2>
                </div>
                {currentLecture.type === 'video' && currentLecture.videoUrl ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <iframe
                      src={currentLecture.videoUrl.replace('watch?v=', 'embed/')}
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : currentLecture.content ? (
                  <div className="prose max-w-none mb-4 text-sm text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: currentLecture.content }} />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 mb-4">لا يوجد محتوى</div>
                )}

                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  {currentLecture.type === 'video' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">السرعة:</span>
                      <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))} className="text-xs border rounded px-2 py-1">
                        {speeds.map(s => <option key={s} value={s}>{s}x</option>)}
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} className="rounded" />
                    تشغيل تلقائي للمحاضرة التالية
                  </label>
                </div>

                {!lectureProgress.get(currentLecture.id)?.completed ? (
                  <button onClick={() => markComplete(currentLecture.id)} className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-600 flex items-center gap-2">
                    <i className="fa-solid fa-check"></i> تمت المشاهدة
                  </button>
                ) : (
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i> مكتمل
                  </div>
                )}
              </div>
            </div>
          )}

          {progress === 100 && (
            <div className="bg-gradient-to-l from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">هنيئاً! أكملت الكورس</h3>
                  <p className="text-sm opacity-80">حصلت على 100% في محتوى الكورس</p>
                </div>
                {certificate ? (
                  <button onClick={handlePrintCert} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100">
                    <i className="fa-solid fa-certificate ml-1"></i> طباعة الشهادة
                  </button>
                ) : (
                  <button onClick={getCertificate} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100">
                    <i className="fa-solid fa-award ml-1"></i> احصل على الشهادة
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {(['content', 'qa', 'quizzes'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
                {tab === 'content' ? 'المحتوى' : tab === 'qa' ? 'أسئلة وأجوبة' : 'اختبارات'}
              </button>
            ))}
          </div>

          {activeTab === 'qa' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">أسئلة وأجوبة الكورس</h3>
              <div className="mb-6">
                <input type="text" value={newQuestion.title} onChange={(e) => setNewQuestion(p => ({ ...p, title: e.target.value }))} placeholder="عنوان السؤال" className="w-full border rounded-lg px-4 py-2 mb-2 text-sm" />
                <textarea value={newQuestion.content} onChange={(e) => setNewQuestion(p => ({ ...p, content: e.target.value }))} placeholder="تفاصيل السؤال..." rows={3} className="w-full border rounded-lg px-4 py-2 mb-2 text-sm" />
                <button onClick={submitQuestion} disabled={!newQuestion.title || !newQuestion.content} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">إرسال السؤال</button>
              </div>
              {qaLoading ? <p className="text-gray-400 text-center py-4">جاري التحميل...</p> : questions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">لا توجد أسئلة بعد</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {q.user.avatar ? <img src={q.user.avatar} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{q.user.name.charAt(0)}</div>}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{q.user.name}</p>
                          <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                        {q.resolved && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">تم الحل</span>}
                      </div>
                      <h4 className="font-bold mb-1">{q.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{q.content}</p>
                      {q.answers?.map((a: any) => (
                        <div key={a.id} className={`mr-8 p-3 rounded-lg mb-2 ${a.isAccepted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {a.user.avatar ? <img src={a.user.avatar} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">{a.user.name.charAt(0)}</div>}
                            <span className="text-xs font-semibold">{a.user.name}</span>
                            {a.isAccepted && <span className="text-green-600 text-xs"><i className="fa-solid fa-check-circle"></i> مقبول</span>}
                          </div>
                          <p className="text-sm">{a.content}</p>
                        </div>
                      ))}
                      <div className="mr-8 mt-2 flex gap-2">
                        <input type="text" value={newAnswer[q.id] || ''} onChange={(e) => setNewAnswer(p => ({ ...p, [q.id]: e.target.value }))} placeholder="اكتب إجابة..." className="flex-1 border rounded px-3 py-1.5 text-xs" />
                        <button onClick={() => submitAnswer(q.id)} disabled={!newAnswer[q.id]} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 disabled:opacity-50">إرسال</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">اختبارات الكورس</h3>
              {quizzes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">لا توجد اختبارات بعد</p>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{quiz.title}</h4>
                        <p className="text-xs text-gray-500">{quiz.questions?.length || 0} سؤال | درجة النجاح: {quiz.passingScore}%{quiz.timeLimit ? ` | مدة: ${quiz.timeLimit} دقيقة` : ''}</p>
                      </div>
                      <Link href={`/student/quiz/${quiz.id}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
                        ابدأ الاختبار
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-bold text-sm mb-4">محتوى الكورس</h3>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {course.sections?.map((section: any) => (
              <div key={section.id}>
                <p className="text-xs font-bold text-gray-700 px-2 py-2">{section.title}</p>
                {section.lectures?.map((lecture: any) => {
                  const isCompleted = lectureProgress.get(lecture.id)?.completed
                  const isActive = currentLecture?.id === lecture.id
                  return (
                    <button key={lecture.id} onClick={() => { setCurrentLecture(lecture); setActiveTab('content') }}
                      className={`w-full text-right px-3 py-2.5 rounded-lg text-xs transition flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <i className={`${isCompleted ? 'fa-solid fa-circle-check text-emerald-500' : isActive ? 'fa-regular fa-circle-play text-indigo-500' : 'fa-regular fa-circle text-gray-300'} text-xs`}></i>
                      <span className="flex-1">{lecture.title}</span>
                      {lecture.duration > 0 && <span className="text-gray-400">{lecture.duration}د</span>}
                    </button>
                  )
                })}
              </div>
            ))}
            {quizzes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 px-2 py-2">اختبارات</p>
                {quizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/student/quiz/${quiz.id}`} className="w-full text-right px-3 py-2.5 rounded-lg text-xs transition flex items-center gap-2 hover:bg-purple-50 text-purple-600">
                    <i className="fa-solid fa-question-circle text-xs"></i>
                    <span className="flex-1">{quiz.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
