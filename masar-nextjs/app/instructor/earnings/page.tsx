'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

interface Earning {
  id: number
  saleAmount: number
  commissionRate: number
  commission: number
  netEarning: number
  status: string
  createdAt: string
  course: { title: string; image: string }
  order: { createdAt: string }
}

interface Withdrawal {
  id: number
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
}

interface Summary {
  totalSales: number
  totalCommission: number
  totalEarnings: number
  settledEarnings: number
  pendingEarnings: number
  totalTransactions: number
}

export default function InstructorEarningsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>('earnings')
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer')
  const [withdrawDetails, setWithdrawDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchEarnings()
    fetchWithdrawals()
  }, [user])

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setEarnings(data.data.earnings)
        setSummary(data.data.summary)
      }
    } catch (e) { console.error(e) }
  }

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/withdrawals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setWithdrawals(data.data.requests)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/instructor/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          paymentMethod: withdrawMethod,
          paymentDetails: withdrawDetails,
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        setWithdrawDetails('')
        fetchWithdrawals()
        fetchEarnings()
      } else {
        alert(data.error)
      }
    } catch (e) { console.error(e) }
    setSubmitting(false)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    settled: 'bg-green-100 text-green-700',
    withdrawn: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-blue-100 text-blue-700',
  }

  const statusLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    settled: 'تم التسوية',
    withdrawn: 'تم السحب',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
    paid: 'تم الدفع',
  }

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>جاري التحميل...</p></div>

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الأرباح والسحوبات</h1>
            <p className="text-gray-500 mt-1">تتبع أرباحك وإدارة سحوباتك</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            طلب سحب
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${summary.totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">عمولة المنصة</p>
              <p className="text-2xl font-bold text-red-600 mt-1">${summary.totalCommission.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">صافي الأرباح</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${summary.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">المتاح للسحب</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">${summary.settledEarnings.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'earnings' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            الأرباح
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'withdrawals' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            السحوبات
          </button>
        </div>

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الكورس</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">مبلغ البيع</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">العمولة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">صافي الربح</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {earnings.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={e.course.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900">{e.course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">${e.saleAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-red-600">${e.commission.toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">${e.netEarning.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[e.status] || 'bg-gray-100'}`}>
                        {statusLabels[e.status] || e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(e.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
                {earnings.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">لا توجد أرباح بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المبلغ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">${w.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{w.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'فودافون كاش'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[w.status] || 'bg-gray-100'}`}>
                        {statusLabels[w.status] || w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">لا توجد سحوبات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">طلب سحب أرباح</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ ($)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="أدخل المبلغ"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل الدفع</label>
                  <textarea
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="رقم الحساب أو رقم المحفظة..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleWithdraw}
                  disabled={submitting || !withdrawAmount}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
