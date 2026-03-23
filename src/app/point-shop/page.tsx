'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const EARN_WAYS = [
  { emoji: '✅', label: '루틴 완료',         desc: '매일 루틴 하나 완료',       point: '+2P'      },
  { emoji: '🎯', label: '챌린지 체크인',      desc: '나만의 챌린지 매일 인증',    point: '+5P'      },
  { emoji: '📸', label: '커뮤니티 인증 공유', desc: '루틴 인증 사진 공유',        point: '+10P'     },
  { emoji: '🩸', label: '혈당 기록',          desc: '오늘 혈당 저장',             point: '+3P'      },
  { emoji: '⚖️', label: '체중 기록',          desc: '오늘 체중 & 식사 저장',      point: '+3P'      },
  { emoji: '🔥', label: '7일 연속 달성',      desc: '7일 연속 루틴 달성 보너스',  point: '+30P'     },
  { emoji: '🏆', label: '챌린지 완료',        desc: '챌린지 기간 완주',           point: '+50~350P' },
]


export default function PointShopPage() {
  const [points, setPoints] = useState(0)

  useEffect(() => {
    setPoints(parseInt(localStorage.getItem('routinefit_points') ?? '0'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Header title="포인트샵" />

      {/* 히어로 */}
      <div className="bg-gradient-to-br from-amber-400 via-lemon-400 to-yellow-300 px-4 py-6 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-black/5 rounded-full" />
        <div className="relative">
          <p className="text-black/50 text-xs font-bold mb-1">내 포인트</p>
          <p className="text-5xl font-black text-gray-900 leading-none">
            {points.toLocaleString()}<span className="text-2xl ml-1">P</span>
          </p>
          <p className="text-black/60 text-xs mt-2">지금 모아두면 오픈 즉시 사용할 수 있어요!</p>
        </div>
      </div>

      {/* 메인 오픈 예정 카드 */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🛍️</span>
              <span className="bg-lemon-400 text-gray-900 font-black text-xs px-2.5 py-1 rounded-full">Coming Soon</span>
            </div>
            <h2 className="text-white font-black text-xl leading-snug mb-2">
              포인트로 할인받는<br />건강 쇼핑몰이 열려요
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              루틴핏에서 모은 포인트를 사용해<br />
              건강 관련 제품을 더 저렴하게 구매할 수 있는<br />
              포인트샵이 곧 오픈될 예정이에요.
            </p>
            <div className="mt-4 h-px bg-white/10" />
            <p className="text-lemon-400 font-black text-xs mt-3">
              📌 지금 포인트를 모아두세요 — 오픈 즉시 사용 가능해요!
            </p>
          </div>
        </div>
      </div>


      {/* 브랜드 협업 안내 */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-4 py-4 text-center">
          <p className="text-2xl mb-2">🤝</p>
          <p className="font-black text-gray-800 text-sm">다양한 브랜드들과 협업 준비 중이에요</p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            건강과 웰니스 분야의 여러 브랜드들과<br />함께할 수 있도록 열심히 준비하고 있어요
          </p>
        </div>
      </div>

      {/* 포인트 적립 방법 */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-amber-400 rounded-full" />
          <h2 className="font-black text-gray-800 text-sm">이렇게 포인트를 모아요</h2>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {EARN_WAYS.map((w, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < EARN_WAYS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <span className="text-xl w-8 text-center flex-shrink-0">{w.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-800 text-sm">{w.label}</p>
                <p className="text-xs text-gray-500">{w.desc}</p>
              </div>
              <span className="font-black text-amber-500 text-sm flex-shrink-0">{w.point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="px-4 mt-4 mb-2">
        <div className="bg-lemon-50 border-2 border-lemon-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">🍋</p>
          <p className="font-black text-gray-800 text-sm">건강한 습관이 곧 혜택이 돼요</p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            루틴을 꾸준히 실천할수록 포인트가 쌓이고<br />
            쌓인 포인트로 건강 제품을 저렴하게 살 수 있어요
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
