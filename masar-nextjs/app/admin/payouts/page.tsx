'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'


interface Withdrawal {
  id: number
  amount: number
  status: string
  paymentMethod: string
  paymentDetails: string | null
  adminNote: string | null
  createdAt: string
  processedAt: string | null
  instructor: { id: number; name: string; email: string; avatar: string | null }
}

interface EarningsSummary {
  totalSales: number
  totalPlatformCommission: number
  totalInstructorEarnings: number
  totalTransactions: number
  pendingWithdrawals: number
  pendingWithdrawalCount: number
}

export default function AdminPayoutsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals'>('overview')
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const [earningsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/earnings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const earningsData = await earningsRes.json()
      const withdrawalsData = await withdrawalsRes.json()
      if (earningsData.success) setSummary(earningsData.data.summary)
      if (withdrawalsData.success) setWithdrawals(withdrawalsData.data.requests)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleAction = async (id: number, status: string, note?: string) => {
    setActionLoading(id)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNote: note || '' })
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
      } else {
        alert(data.error)
      }
    } catch (e) { console.error(e) }
    setActionLoading(null)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-blue-100 text-blue-700',
  }

  const statusLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
    paid: 'تم الدفع',
  }

  if (!user || user.role !== 'admin') return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>ليس لديك صلاحية</p></div>

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">إدارة السحوبات والأرباح</h1>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">إجمالي مبيعات المدراء</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${summary.totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">عمولة المنصة (أرباحك)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${summary.totalPlatformCommission.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <p className="text-sm text-gray-500">سحوبات معلقة</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">${summary.pendingWithdrawals.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.pendingWithdrawalCount} طلب</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'withdrawals' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            طلبات السحب
          </button>
        </div>

        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المدرب</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المبلغ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التفاصيل</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {w.instructor.avatar ? (
                          <img src={w.instructor.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {w.instructor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{w.instructor.name}</p>
                          <p className="text-xs text-gray-500">{w.instructor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">${w.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{w.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'فودافون كاش'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate">{w.paymentDetails || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[w.status]}`}>
                        {statusLabels[w.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(w.id, 'approved')}
                            disabled={actionLoading === w.id}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('سبب الرفض:')
                              if (note !== null) handleAction(w.id, 'rejected', note)
                            }}
                            disabled={actionLoading === w.id}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                      {w.status === 'approved' && (
                        <button
                          onClick={() => handleAction(w.id, 'paid')}
                          disabled={actionLoading === w.id}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          تم الدفع
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا توجد طلبات سحب</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
