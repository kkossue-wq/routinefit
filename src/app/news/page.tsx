'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { getTodayHealthNews, getWeeklyHealthNews, type NewsArticle } from '@/lib/newsContent'

const subTabs = [
  { id: 'health',  label: '건강 정보', icon: '🌿' },
  { id: 'archive', label: '지난 기사', icon: '📂' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function getTodayLabel() {
  const now = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`
}

function ArticleCard({
  article, saved, onSave,
}: {
  article: NewsArticle; saved: boolean; onSave: () => void
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs bg-lemon-100 text-lemon-700 font-bold px-2 py-0.5 rounded-full">
          {article.tag}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">{article.readTime}</span>
          <button onClick={onSave} className="text-base transition-transform active:scale-125">
            {saved ? '🔖' : '📌'}
          </button>
        </div>
      </div>
      <h3 className="font-black text-gray-800 text-sm leading-snug mb-1.5">{article.title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{article.summary}</p>
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">{article.source}</span>
        {article.date && (
          <span className="text-xs text-gray-500">{formatDate(article.date)}</span>
        )}
      </div>
    </div>
  )
}

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState('health')
  const [saved, setSaved] = useState<string[]>([])
  const [todayHealth, setTodayHealth] = useState<NewsArticle[]>([])
  const [archive, setArchive] = useState<NewsArticle[]>([])

  useEffect(() => {
    setTodayHealth(getTodayHealthNews())
    setArchive(getWeeklyHealthNews())
    const savedIds = JSON.parse(localStorage.getItem('saved_articles') ?? '[]')
    setSaved(savedIds)
  }, [])

  const toggleSave = (id: string) => {
    const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('saved_articles', JSON.stringify(next))
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Header title="건강 정보" />

      {/* 페이지 헤더 */}
      <div className="bg-lemon-400 px-4 py-4 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-black/5 rounded-full" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-black/50 text-xs font-medium">{getTodayLabel()}</p>
            <h2 className="text-gray-900 font-black text-lg mt-0.5">오늘의 건강 정보</h2>
            <p className="text-black/60 text-xs mt-0.5">매일 새로운 건강 정보를 확인하세요</p>
          </div>
          <div className="bg-white/40 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-black/60 font-medium">다음 업데이트</p>
            <p className="font-black text-gray-900 text-sm">내일 00:00</p>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 건강 정보 */}
      {activeTab === 'health' && (
        <div className="px-4 pt-4 space-y-3 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-lemon-400 rounded-full" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide">오늘의 건강 뉴스</p>
          </div>
          {todayHealth.map((a) => (
            <ArticleCard key={a.id} article={a} saved={saved.includes(a.id)} onSave={() => toggleSave(a.id)} />
          ))}

          {/* 혈당 관리 특집 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-red-400 rounded-full" />
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide">혈당 관리 핵심</p>
            </div>
            {[
              '채소 먼저, 단백질, 탄수화물 순으로 드세요',
              '식후 10-15분 걷기로 혈당 스파이크를 30% 줄여요',
              '흰쌀밥 대신 잡곡밥을 드세요',
              '당 음료 대신 물 또는 녹차를 마셔요',
              '규칙적인 식사 시간이 혈당 안정의 핵심이에요',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                <span className="w-5 h-5 bg-red-400 text-white text-xs font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* 지난 기사 */}
      {activeTab === 'archive' && (
        <div className="px-4 pt-4 space-y-3 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-gray-400 rounded-full" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide">최근 5일 건강 정보</p>
          </div>
          {archive.map((a) => (
            <ArticleCard key={a.id} article={a} saved={saved.includes(a.id)} onSave={() => toggleSave(a.id)} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
