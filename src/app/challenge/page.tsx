'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { challenges } from '@/lib/data'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

const LEVELS = [
  { name: '🌱 씨앗', min: 0,   max: 100,  color: 'text-green-600' },
  { name: '🌿 새싹', min: 100,  max: 300,  color: 'text-emerald-600' },
  { name: '💪 건강인', min: 300, max: 700,  color: 'text-lemon-600' },
  { name: '👑 건강왕', min: 700, max: 99999, color: 'text-amber-600' },
]

function getLevelInfo(points: number) {
  return LEVELS.find((l) => points >= l.min && points < l.max) ?? LEVELS[LEVELS.length - 1]
}

export default function ChallengePage() {
  const [joined, setJoined] = useState<string[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [justJoined, setJustJoined] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [pointAnim, setPointAnim] = useState<string | null>(null)

  useEffect(() => {
    const savedJoined = localStorage.getItem('challenge_joined')
    const savedProgress = localStorage.getItem('challenge_progress')
    const savedPoints = localStorage.getItem('routinefit_points')
    if (savedJoined) setJoined(JSON.parse(savedJoined))
    if (savedProgress) setProgress(JSON.parse(savedProgress))
    if (savedPoints) setPoints(parseInt(savedPoints))
  }, [])

  const addPoints = (amount: number, label: string) => {
    const newPoints = points + amount
    setPoints(newPoints)
    localStorage.setItem('routinefit_points', String(newPoints))
    setPointAnim(`+${amount} 포인트! ${label}`)
    setTimeout(() => setPointAnim(null), 2000)
  }

  const joinChallenge = (id: string) => {
    if (joined.includes(id)) return
    const newJoined = [...joined, id]
    const newProgress = { ...progress, [id]: progress[id] ?? 1 }
    setJoined(newJoined)
    setProgress(newProgress)
    setJustJoined(id)
    localStorage.setItem('challenge_joined', JSON.stringify(newJoined))
    localStorage.setItem('challenge_progress', JSON.stringify(newProgress))
    addPoints(20, '챌린지 참가!')
    setTimeout(() => setJustJoined(null), 1500)
  }

  const checkIn = (id: string) => {
    const today = getTodayKey()
    const lastKey = `challenge_last_${id}`
    const last = localStorage.getItem(lastKey)
    if (last === today) {
      alert('오늘은 이미 체크인했어요! 내일 또 와주세요 😊')
      return
    }
    const newProgress = { ...progress, [id]: (progress[id] ?? 0) + 1 }
    const ch = challenges.find((c) => c.id === id)!
    const isComplete = newProgress[id] >= ch.duration

    setProgress(newProgress)
    localStorage.setItem('challenge_progress', JSON.stringify(newProgress))
    localStorage.setItem(lastKey, today)

    if (isComplete) {
      addPoints(100, '챌린지 완료 🎉')
    } else {
      addPoints(10, '체크인!')
    }
  }

  const levelInfo = getLevelInfo(points)

  const colorMap: Record<string, string> = {
    coral: 'from-coral-400 to-pink-400',
    lemon: 'from-lemon-400 to-amber-300',
    sky: 'from-sky-400 to-blue-400',
  }
  const bgMap: Record<string, string> = {
    coral: 'bg-coral-100 border-coral-200',
    lemon: 'bg-lemon-100 border-lemon-200',
    sky: 'bg-sky-50 border-sky-200',
  }
  const textMap: Record<string, string> = {
    coral: 'text-red-600',
    lemon: 'text-yellow-700',
    sky: 'text-sky-600',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lemon-50 to-lemon-100 pb-28">
      <Header title="챌린지" />

      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-coral-400 to-pink-400 px-4 py-5 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="relative">
          <h2 className="text-white font-black text-xl">🏆 건강 챌린지</h2>
          <p className="text-white/80 text-xs mt-1">함께하면 더 쉬워요! 지금 도전해보세요</p>
          <div className="flex gap-3 mt-3">
            {[
              { label: '진행 중인 챌린지', value: `${joined.length}개` },
              { label: '전체 참가자', value: '11,861명' },
            ].map((s) => (
              <div key={s.label} className="bg-white/25 rounded-xl px-3 py-1.5 text-center">
                <p className="text-white font-black text-sm">{s.value}</p>
                <p className="text-white/80 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 루핏 포인트 카드 */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl p-4 shadow-cute border-2 border-lemon-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold">내 루핏 포인트</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-black text-gray-800">{points.toLocaleString()}</span>
                <span className="text-sm text-gray-500 mb-1">P</span>
              </div>
              <p className={`text-sm font-black mt-1 ${levelInfo.color}`}>{levelInfo.name}</p>
            </div>
            <div className="text-right">
              <div className="bg-lemon-50 rounded-2xl p-3 border-2 border-lemon-200">
                <p className="text-xs text-gray-500 mb-1">획득 방법</p>
                <p className="text-xs text-gray-700">참가: +20P</p>
                <p className="text-xs text-gray-700">체크인: +10P</p>
                <p className="text-xs text-amber-600 font-black">완료: +100P 🎉</p>
              </div>
            </div>
          </div>
          {/* 레벨 진행바 */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{levelInfo.name}</span>
              <span>{points} / {levelInfo.max === 99999 ? '∞' : levelInfo.max}P</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-lemon-400 to-amber-400 transition-all duration-700"
                style={{ width: `${levelInfo.max === 99999 ? 100 : Math.min(((points - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100, 100)}%` }}
              />
            </div>
          </div>
          {/* 포인트 획득 애니메이션 */}
          {pointAnim && (
            <div className="absolute top-4 right-4 bg-lemon-400 text-yellow-900 font-black text-sm px-3 py-1.5 rounded-2xl animate-bounce-in shadow-lemon">
              {pointAnim}
            </div>
          )}
        </div>
      </div>

      {/* 챌린지 카드 목록 */}
      <div className="px-4 py-4 space-y-4">
        {challenges.map((ch) => {
          const isJoined = joined.includes(ch.id)
          const currentProgress = progress[ch.id] ?? 0
          const pct = Math.min(Math.round((currentProgress / ch.duration) * 100), 100)
          const gradient = colorMap[ch.color] ?? colorMap.lemon
          const bg = bgMap[ch.color] ?? bgMap.lemon
          const textColor = textMap[ch.color] ?? textMap.lemon
          const isJustJoined = justJoined === ch.id

          return (
            <div
              key={ch.id}
              className={`bg-white rounded-3xl shadow-cute-lg border-2 overflow-hidden card-lift ${
                isJoined ? 'border-lemon-300' : 'border-gray-100'
              }`}
            >
              {/* 카드 헤더 그라디언트 */}
              <div className={`bg-gradient-to-r ${gradient} p-4 relative overflow-hidden`}>
                <div className="shimmer absolute inset-0" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <span className="bg-white/25 text-white text-xs font-black px-2 py-0.5 rounded-full">
                      {ch.duration}일 챌린지
                    </span>
                    <h3 className="text-white font-black text-lg mt-1 leading-tight">{ch.title}</h3>
                    <p className="text-white/80 text-xs mt-0.5">{ch.subtitle}</p>
                  </div>
                  <span className="text-4xl animate-float">{ch.emoji}</span>
                </div>
                <p className="text-white/70 text-xs mt-2">🔥 {ch.participants.toLocaleString()}명 참가 중</p>
              </div>

              {/* 카드 내용 */}
              <div className="p-4">
                <p className="text-gray-600 text-xs mb-3">{ch.description}</p>

                {/* 미션 목록 */}
                <div className={`rounded-2xl p-3 border ${bg} mb-3`}>
                  <p className={`text-xs font-black mb-2 ${textColor}`}>📌 매일 미션</p>
                  <div className="space-y-1">
                    {ch.tasks.map((task, i) => (
                      <p key={i} className="text-xs text-gray-700 flex items-center gap-1">
                        <span className="text-green-400 font-bold">✓</span> {task}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 보상 안내 */}
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 mb-3">
                  <p className="text-xs font-black text-amber-700 mb-1">🎁 완료 보상</p>
                  <div className="flex gap-3">
                    <span className="text-xs text-gray-700">✨ {ch.badge} 배지</span>
                    <span className="text-xs text-amber-600 font-bold">+100 루핏 포인트</span>
                  </div>
                </div>

                {/* 진행률 (참가 시) */}
                {isJoined && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-700">내 진행률</span>
                      <span className={`text-xs font-black ${textColor}`}>
                        {currentProgress}/{ch.duration}일 ({pct}%)
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    {pct === 100 && (
                      <p className="text-center font-black text-sm mt-1 animate-bounce-in">
                        🎉 챌린지 완료! {ch.badge} 획득!
                      </p>
                    )}
                  </div>
                )}

                {/* 버튼 */}
                {!isJoined ? (
                  <button
                    onClick={() => joinChallenge(ch.id)}
                    className={`w-full bg-gradient-to-r ${gradient} text-white font-black py-3 rounded-2xl text-sm shadow-cute transition-all active:scale-95`}
                  >
                    🚀 챌린지 참가하기! (+20P)
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-lemon-50 border-2 border-lemon-200 rounded-2xl py-2.5 text-center">
                      <p className="text-lemon-600 font-black text-xs">✅ 참가 중!</p>
                      <p className="text-gray-500 text-xs">{ch.badge}</p>
                    </div>
                    <button
                      onClick={() => checkIn(ch.id)}
                      className={`flex-1 bg-gradient-to-r ${gradient} text-white font-black py-2.5 rounded-2xl text-xs shadow-cute active:scale-95`}
                    >
                      📅 오늘 체크인 (+10P)
                    </button>
                  </div>
                )}

                {/* 참가 완료 축하 메시지 */}
                {isJustJoined && (
                  <div className="mt-2 bg-lemon-100 rounded-2xl py-2 text-center animate-bounce-in">
                    <p className="text-yellow-800 font-black text-sm">🎉 챌린지 시작! 화이팅! +20P 획득!</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 챌린지 완료 배지 섹션 */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-3xl p-4 shadow-cute border-2 border-lemon-100">
          <h3 className="font-black text-gray-800 mb-3">🏅 획득 가능한 배지</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {challenges.map((ch) => {
              const earned = (progress[ch.id] ?? 0) >= ch.duration
              return (
                <div key={ch.id} className={`flex-shrink-0 text-center rounded-2xl p-3 border-2 min-w-[80px] ${
                  earned ? 'bg-lemon-100 border-lemon-400' : 'bg-gray-50 border-gray-200 grayscale opacity-50'
                }`}>
                  <p className="text-2xl">{ch.emoji}</p>
                  <p className="text-xs font-black text-gray-700 mt-1 leading-tight">
                    {ch.badge.split(' ')[1]}
                  </p>
                  {earned && <p className="text-xs text-lemon-600 font-bold">획득!</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 나만의 챌린지 CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/my-challenge"
          className="block bg-gray-900 rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-lemon-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                나만의 챌린지
              </span>
              <h3 className="text-white font-black text-base mt-2">
                내가 직접 목표를 만들고<br />매일 사진으로 인증해요
              </h3>
              <p className="text-white/50 text-xs mt-1">체크인 +5P · 완료 최대 +350P</p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
