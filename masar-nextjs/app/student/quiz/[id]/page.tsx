'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Header from '@/components/Header'
import Link from 'next/link'

interface Quiz {
  id: number
  title: string
  description: string
  passingScore: number
  timeLimit: number | null
  maxAttempts: number | null
  questions: any[]
  course: { id: number; title: string }
}

interface Attempt {
  id: number
  score: number
  passed: boolean
  startedAt: string
  completedAt: string
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptInfo, setAttemptInfo] = useState<any>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    fetchData()
  }, [token, quizId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/student/quiz?quizId=${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        const { quiz, attempts } = data.data
        setQuiz(quiz)
        setQuestions(quiz.questions || [])
        setAttempts(attempts || [])
        setAttemptInfo(data.data)
        if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quizId: parseInt(quizId), answers }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        setSubmitted(true)
      } else {
        alert(data.error)
      }
    } catch (e) { console.error(e) }
    setSubmitting(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>جاري التحميل...</p></div>
  if (!quiz) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>الكويز غير موجود</p></div>

  // Show results
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${result.attempt.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              <i className={`text-3xl ${result.attempt.passed ? 'fa-solid fa-check text-green-600' : 'fa-solid fa-times text-red-600'}`}></i>
            </div>
            <h1 className="text-2xl font-bold mb-2">{result.attempt.passed ? 'أحسنت! لقد نجحت' : 'لم تنجح هذه المرة'}</h1>
            <p className="text-gray-500 mb-6">النتيجة: {result.attempt.score}% ({result.attempt.earnedPoints}/{result.attempt.totalPoints})</p>
            <p className="text-sm text-gray-400 mb-8">درجة النجاح: {quiz.passingScore}%</p>

            <div className="text-left space-y-4 mb-8">
              {result.answers.map((a: any, i: number) => (
                <div key={a.questionId} className={`p-4 rounded-lg border ${a.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-semibold mb-2">{i + 1}. {questions.find(q => q.id === a.questionId)?.question}</p>
                  <p className="text-sm">إجابتك: <span className={a.isCorrect ? 'text-green-600' : 'text-red-600'}>{a.selectedAnswer || 'لم تجب'}</span></p>
                  {!a.isCorrect && <p className="text-sm text-green-600">الإجابة الصحيحة: {a.correctAnswer}</p>}
                  {a.explanation && <p className="text-sm text-gray-500 mt-1">{a.explanation}</p>}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              {(!quiz.maxAttempts || attempts.length < quiz.maxAttempts) && (
                <button onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); setCurrentQ(0); if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60) }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">
                  المحاولة مرة أخرى
                </button>
              )}
              <Link href={`/courses/${quiz.course.id}/learn`} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200">
                العودة للكورس
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show previous attempts
  if (attempts.length > 0 && !submitted) {
    const bestScore = Math.max(...attempts.map(a => a.score))
    const lastAttempt = attempts[0]

    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && <p className="text-gray-500 mb-6">{quiz.description}</p>}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">المحاولات</p>
                <p className="text-xl font-bold">{attempts.length}{quiz.maxAttempts ? `/${quiz.maxAttempts}` : ''}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">أعلى نتيجة</p>
                <p className="text-xl font-bold text-green-600">{bestScore.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">درجة النجاح</p>
                <p className="text-xl font-bold">{quiz.passingScore}%</p>
              </div>
            </div>

            <h3 className="font-semibold mb-3">المحاولات السابقة</h3>
            <div className="space-y-2 mb-6">
              {attempts.map((a) => (
                <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg ${a.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className="text-sm">{new Date(a.completedAt || a.startedAt).toLocaleDateString('ar-EG')}</span>
                  <span className={`font-bold ${a.passed ? 'text-green-600' : 'text-red-600'}`}>{a.score.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {(!quiz.maxAttempts || attempts.length < quiz.maxAttempts) ? (
              <button onClick={() => { setAnswers({}); setCurrentQ(0); if (quiz.timeLimit) setTimeLeft(quiz.timeLimit * 60) }} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
                <i className="fa-solid fa-play ml-2"></i> ابدأ محاولة جديدة
              </button>
            ) : (
              <p className="text-center text-gray-500">لقد استنفدت جميع المحاولات</p>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Take the quiz
  const question = questions[currentQ]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{quiz.title}</h1>
              <p className="text-sm text-gray-500">السؤال {currentQ + 1} من {questions.length}</p>
            </div>
            {timeLeft !== null && (
              <div className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                <i className="fa-solid fa-clock ml-1"></i> {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>

        {question && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <p className="text-lg font-semibold mb-6">{question.question}</p>
            <div className="space-y-3">
              {question.type === 'multiple_choice' && question.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(question.id, opt)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition font-medium ${answers[question.id] === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {opt}
                </button>
              ))}
              {question.type === 'true_false' && ['true', 'false'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(question.id, opt)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition font-medium ${answers[question.id] === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {opt === 'true' ? 'صحيح' : 'خطأ'}
                </button>
              ))}
              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="اكتب إجابتك..."
                />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            السابق
          </button>
          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < questions.length}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'جاري التسليم...' : `تسليم (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
