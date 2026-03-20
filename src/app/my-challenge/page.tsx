'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

type CheckIn = {
  date: string
  photo?: string   // base64
  note?: string
}

type CustomChallenge = {
  id: string
  title: string
  emoji: string
  days: number
  createdAt: string
  checkIns: CheckIn[]
}

const EMOJI_LIST = ['💪', '🏃', '🧘', '🥗', '💧', '📚', '🎯', '🌅', '🚴', '🏊', '✍️', '🎵', '🛌', '🌿', '🧹']
const DAY_PRESETS = [7, 14, 30, 60, 100]

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getPointsForDays(days: number) {
  if (days <= 7)  return 50
  if (days <= 14) return 100
  if (days <= 30) return 200
  return 350
}

function getDailyPoints() { return 5 }

// ── 챌린지 카드 ───────────────────────────────────────────
function ChallengeCard({
  challenge,
  onCheckin,
  onDelete,
}: {
  challenge: CustomChallenge
  onCheckin: (id: string, photo?: string, note?: string) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const today = getTodayKey()
  const checkedToday = challenge.checkIns.some((c) => c.date === today)
  const pct = Math.min(Math.round((challenge.checkIns.length / challenge.days) * 100), 100)
  const isComplete = challenge.checkIns.length >= challenge.days
  const reward = getPointsForDays(challenge.days)
  const startDate = new Date(challenge.createdAt)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + challenge.days)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const submit = () => {
    onCheckin(challenge.id, previewPhoto ?? undefined, note || undefined)
    setNote('')
    setPreviewPhoto(null)
    setExpanded(false)
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-card ${
      isComplete ? 'border-lemon-400' : 'border-gray-100'
    }`}>
      {/* 카드 헤더 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-4 flex items-center gap-3"
      >
        <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100">
          {challenge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-gray-800 text-sm truncate">{challenge.title}</h3>
            {isComplete && (
              <span className="text-xs bg-lemon-400 text-gray-900 font-black px-2 py-0.5 rounded-full flex-shrink-0">
                완료!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{challenge.checkIns.length}/{challenge.days}일</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-500">완료시 +{reward}P</span>
          </div>
          {/* 진행바 */}
          <div className="mt-1.5 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-lemon-400 transition-all duration-500"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-gray-300 text-sm">{expanded ? '▲' : '▼'}</span>
          {checkedToday && (
            <span className="text-xs font-bold text-green-500">오늘 완료</span>
          )}
        </div>
      </button>

      {/* 확장 영역 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {/* 체크인 캘린더 (최근 14일) */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">인증 기록</p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(challenge.days, 30) }, (_, i) => {
                const d = new Date(challenge.createdAt)
                d.setDate(d.getDate() + i)
                const key = d.toISOString().split('T')[0]
                const checked = challenge.checkIns.find((c) => c.date === key)
                const isPast = d <= new Date()
                return (
                  <div
                    key={i}
                    title={key}
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${
                      checked
                        ? 'bg-lemon-400 text-gray-900 font-black'
                        : isPast
                        ? 'bg-red-50 border border-red-100 text-red-300'
                        : 'bg-gray-50 border border-gray-100 text-gray-300'
                    }`}
                  >
                    {checked ? '✓' : i + 1}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 오늘 인증 */}
          {!isComplete && !checkedToday && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700">오늘 인증하기 (+{getDailyPoints()}P)</p>

              {/* 사진 업로드 */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhoto}
              />
              {previewPhoto ? (
                <div className="relative">
                  <img
                    src={previewPhoto}
                    alt="인증 사진"
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setPreviewPhoto(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-lemon-300 transition-colors"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs">사진으로 인증하기 (선택)</span>
                </button>
              )}

              {/* 한마디 */}
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="오늘 한마디 (선택)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-lemon-400 focus:outline-none"
              />

              <button
                onClick={submit}
                className="w-full bg-lemon-400 text-gray-900 font-black py-3 rounded-xl text-sm"
              >
                오늘 인증 완료!
              </button>
            </div>
          )}

          {isComplete && (
            <div className="bg-lemon-50 rounded-xl p-3 text-center border border-lemon-200">
              <p className="font-black text-gray-800">🎉 챌린지 완료!</p>
              <p className="text-xs text-gray-500 mt-0.5">+{reward}P 포인트가 적립됐어요</p>
            </div>
          )}

          {/* 삭제 */}
          <button
            onClick={() => {
              if (confirm('챌린지를 삭제할까요? 기록도 함께 사라져요.')) onDelete(challenge.id)
            }}
            className="w-full text-xs text-gray-500 py-2"
          >
            챌린지 삭제
          </button>
        </div>
      )}
    </div>
  )
}

// ── 챌린지 생성 폼 ────────────────────────────────────────
function CreateForm({ onSave, onCancel }: { onSave: (c: CustomChallenge) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('💪')
  const [days, setDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const finalDays = useCustom ? (parseInt(customDays) || 30) : days

  const save = () => {
    if (!title.trim()) { alert('챌린지 이름을 입력해주세요'); return }
    if (finalDays < 1 || finalDays > 365) { alert('기간은 1~365일 사이로 입력해주세요'); return }
    onSave({
      id: `custom_${Date.now()}`,
      title: title.trim(),
      emoji,
      days: finalDays,
      createdAt: getTodayKey(),
      checkIns: [],
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-4 animate-slide-up">
      <h3 className="font-black text-gray-800">새 챌린지 만들기</h3>

      {/* 이모지 선택 */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">아이콘</p>
        <div className="flex gap-2 flex-wrap">
          {EMOJI_LIST.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl transition-all ${
                emoji === e ? 'bg-lemon-400 scale-110' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* 챌린지 이름 */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-1.5">챌린지 이름</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 매일 30분 걷기, 하루 책 10페이지 읽기"
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-lemon-400 focus:outline-none"
        />
      </div>

      {/* 기간 선택 */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">목표 기간</p>
        <div className="flex gap-2 flex-wrap">
          {DAY_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => { setDays(d); setUseCustom(false) }}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                !useCustom && days === d ? 'bg-lemon-400 text-gray-900' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {d}일
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
              useCustom ? 'bg-lemon-400 text-gray-900' : 'bg-gray-100 text-gray-600'
            }`}
          >
            직접 입력
          </button>
        </div>
        {useCustom && (
          <input
            type="number"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            placeholder="일수 입력 (최대 365)"
            min={1}
            max={365}
            className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-lemon-400 focus:outline-none"
          />
        )}
      </div>

      {/* 보상 안내 */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <p className="text-xs font-bold text-gray-600 mb-1">보상 안내</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>매일 인증 체크인</span>
          <span className="font-bold text-gray-700">+{getDailyPoints()}P</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
          <span>챌린지 완료 ({finalDays}일)</span>
          <span className="font-bold text-lemon-600">+{getPointsForDays(finalDays)}P</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={save}
          className="flex-1 py-3 rounded-xl text-sm font-black bg-lemon-400 text-gray-900"
        >
          시작하기!
        </button>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────
export default function MyChallengePage() {
  const [challenges, setChallenges] = useState<CustomChallenge[]>([])
  const [creating, setCreating] = useState(false)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('my_challenges')
    if (saved) setChallenges(JSON.parse(saved))
    setPoints(parseInt(localStorage.getItem('routinefit_points') ?? '0'))
  }, [])

  const save = (list: CustomChallenge[]) => {
    setChallenges(list)
    localStorage.setItem('my_challenges', JSON.stringify(list))
  }

  const addPoints = (amount: number) => {
    const next = points + amount
    setPoints(next)
    localStorage.setItem('routinefit_points', String(next))
  }

  const createChallenge = (c: CustomChallenge) => {
    save([c, ...challenges])
    setCreating(false)
  }

  const deleteChallenge = (id: string) => {
    save(challenges.filter((c) => c.id !== id))
  }

  const checkIn = (id: string, photo?: string, note?: string) => {
    const today = getTodayKey()
    const updated = challenges.map((c) => {
      if (c.id !== id) return c
      const newCheckIns = [...c.checkIns, { date: today, photo, note }]
      return { ...c, checkIns: newCheckIns }
    })
    save(updated)

    // 포인트 지급
    const ch = updated.find((c) => c.id === id)!
    const isNowComplete = ch.checkIns.length >= ch.days
    const wasComplete = challenges.find((c) => c.id === id)!.checkIns.length >= ch.days
    if (isNowComplete && !wasComplete) {
      addPoints(getDailyPoints() + getPointsForDays(ch.days))
      alert(`🎉 챌린지 완료! +${getDailyPoints() + getPointsForDays(ch.days)}P 획득!`)
    } else {
      addPoints(getDailyPoints())
    }
  }

  const active = challenges.filter((c) => c.checkIns.length < c.days)
  const done   = challenges.filter((c) => c.checkIns.length >= c.days)

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Header title="나만의 챌린지" />

      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 px-4 py-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">나만의 챌린지</h2>
            <p className="text-white/80 text-xs mt-0.5">목표를 세우고 매일 인증하면 포인트를 받아요</p>
          </div>
          <div className="bg-white/30 rounded-xl px-3 py-2 text-right">
            <p className="font-black text-white text-base">{points.toLocaleString()}P</p>
            <p className="text-white/70 text-xs">보유 포인트</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 새 챌린지 만들기 버튼 */}
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="w-full bg-white border-2 border-dashed border-lemon-300 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-black text-gray-600 hover:border-lemon-400 transition-colors"
          >
            <span className="text-xl">+</span>
            새 챌린지 만들기
          </button>
        )}

        {/* 챌린지 생성 폼 */}
        {creating && (
          <CreateForm
            onSave={createChallenge}
            onCancel={() => setCreating(false)}
          />
        )}

        {/* 진행 중인 챌린지 */}
        {active.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide">진행 중 ({active.length})</h3>
            {active.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onCheckin={checkIn}
                onDelete={deleteChallenge}
              />
            ))}
          </div>
        )}

        {/* 완료한 챌린지 */}
        {done.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wide">완료 ({done.length})</h3>
            {done.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onCheckin={checkIn}
                onDelete={deleteChallenge}
              />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {challenges.length === 0 && !creating && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🎯</p>
            <p className="font-black text-gray-700 text-base">아직 챌린지가 없어요</p>
            <p className="text-gray-500 text-sm mt-1">나만의 목표를 만들어보세요!</p>
            <p className="text-xs text-gray-500 mt-3">매일 인증 시 +5P · 완료 시 최대 +350P</p>
          </div>
        )}

        {/* 기본 챌린지 추천 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-black text-gray-500 mb-3">추천 챌린지 바로 시작하기</p>
          {[
            { emoji: '🏃', title: '매일 30분 걷기', days: 30 },
            { emoji: '📚', title: '하루 10페이지 읽기', days: 14 },
            { emoji: '🧘', title: '아침 5분 명상', days: 7 },
          ].map((rec) => (
            <button
              key={rec.title}
              onClick={() => {
                const newC: CustomChallenge = {
                  id: `custom_${Date.now()}`,
                  title: rec.title,
                  emoji: rec.emoji,
                  days: rec.days,
                  createdAt: getTodayKey(),
                  checkIns: [],
                }
                createChallenge(newC)
              }}
              className="w-full flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl px-2 transition-colors"
            >
              <span className="text-xl">{rec.emoji}</span>
              <span className="flex-1 text-sm font-bold text-gray-700 text-left">{rec.title}</span>
              <span className="text-xs text-gray-500">{rec.days}일</span>
              <span className="text-xs font-bold text-lemon-600 bg-lemon-50 px-2 py-0.5 rounded-full">
                +{getPointsForDays(rec.days)}P
              </span>
            </button>
          ))}
        </div>

        <Link
          href="/challenge"
          className="block text-center text-xs font-bold text-gray-500 py-2"
        >
          루틴핏 공식 챌린지 보기 →
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
