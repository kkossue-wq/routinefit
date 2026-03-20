'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { morningRoutines, workRoutines, eveningRoutines, healthTips, Routine } from '@/lib/data'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

const categories = [
  { id: 'morning', label: '아침', emoji: '🌅', routines: morningRoutines },
  { id: 'work',    label: '직장', emoji: '💼', routines: workRoutines },
  { id: 'evening', label: '저녁', emoji: '🌙', routines: eveningRoutines },
]

const tipCategories = ['전체', '혈당 관리', '식단', '운동', '수분', '수면', '스트레스']

const tipCategoryColors: Record<string, string> = {
  '혈당 관리': 'bg-red-100 text-red-700 border-red-200',
  '식단':     'bg-green-100 text-green-700 border-green-200',
  '운동':     'bg-blue-100 text-blue-700 border-blue-200',
  '수분':     'bg-sky-100 text-sky-700 border-sky-200',
  '수면':     'bg-purple-100 text-purple-700 border-purple-200',
  '스트레스': 'bg-orange-100 text-orange-700 border-orange-200',
}

// 루틴별 효과 & 이유
const ROUTINE_BENEFITS: Record<string, string[]> = {
  'morning-water':     ['신진대사를 깨워 칼로리 소모를 높여요', '독소 배출에 도움이 돼요', '피부를 촉촉하게 만들어요'],
  'morning-stretch':   ['혈액순환이 좋아져 뇌가 활성화돼요', '하루 종일 자세가 좋아져요', '근육 긴장을 풀어줘요'],
  'morning-news':      ['하루 대화 주제가 풍부해져요', '정보 습득으로 자신감이 올라가요'],
  'morning-breakfast': ['점심 폭식을 예방해요', '오전 집중력이 높아져요', '혈당을 안정적으로 유지해요'],
  'work-desk-stretch': ['허리 통증을 50% 줄여줘요', '집중력이 다시 높아져요', '혈액순환이 개선돼요'],
  'work-eye-rest':     ['눈 피로도를 50% 이상 줄여줘요', '두통 예방에 효과적이에요', '장기적으로 시력을 보호해줘요'],
  'work-water':        ['뇌 기능을 최상으로 유지해요', '오후 피로감을 줄여줘요', '카페인 의존도를 낮춰요'],
  'work-walk':         ['혈당 스파이크를 30% 줄여줘요', '식후 졸음이 싹 사라져요', '소화를 도와줘요'],
  'evening-no-sugar':  ['체지방 축적을 막아요', '수면의 질이 높아져요', '아침 공복감이 적절해져요'],
  'evening-stretch':   ['수면의 질을 높여줘요', '하루 쌓인 근육 피로를 풀어줘요', '스트레스 호르몬을 낮춰요'],
  'evening-phone':     ['멜라토닌 분비를 정상화해요', '30분 더 일찍 잠들 수 있어요', '수면이 깊어져요'],
}

// 알람 지원 루틴
const ALARM_ROUTINES: Record<string, number> = {
  'work-desk-stretch': 60,
  'work-eye-rest': 20,
}

// 유튜브 검색 링크 (특정 루틴에만)
const ROUTINE_YOUTUBE: Record<string, { label: string; url: string }> = {
  'morning-stretch':   { label: '아침 스트레칭 따라하기', url: 'https://www.youtube.com/results?search_query=아침+스트레칭+5분' },
  'work-desk-stretch': { label: '의자 스트레칭 따라하기', url: 'https://www.youtube.com/results?search_query=의자+스트레칭+직장인' },
  'work-eye-rest':     { label: '눈 운동 따라하기',       url: 'https://www.youtube.com/results?search_query=눈+피로+회복+운동' },
  'evening-stretch':   { label: '저녁 스트레칭 따라하기', url: 'https://www.youtube.com/results?search_query=저녁+스트레칭+수면+전' },
  'work-walk':         { label: '식후 걷기 가이드',        url: 'https://www.youtube.com/results?search_query=식후+걷기+운동' },
}

// ── 루틴 카드 ─────────────────────────────────────────────
function RoutineCard({
  routine, isDone, onToggle,
}: {
  routine: Routine; isDone: boolean; onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [alarmOn, setAlarmOn] = useState(false)
  const alarmRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const alarmMinutes = ALARM_ROUTINES[routine.id] ?? null
  const benefits = ROUTINE_BENEFITS[routine.id] ?? []
  const youtube = ROUTINE_YOUTUBE[routine.id] ?? null

  useEffect(() => {
    return () => { if (alarmRef.current) clearInterval(alarmRef.current) }
  }, [])

  const toggleAlarm = async () => {
    if (alarmOn) {
      if (alarmRef.current) clearInterval(alarmRef.current)
      setAlarmOn(false)
      return
    }
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않아요')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      alert('알림 권한을 허용해주세요! 브라우저 주소창 왼쪽 자물쇠 아이콘을 눌러 허용해주세요.')
      return
    }
    alarmRef.current = setInterval(() => {
      new Notification('루틴핏 알람 🔔', {
        body: `⏰ ${routine.title} 시간이에요!`,
        icon: '/favicon.ico',
      })
    }, alarmMinutes! * 60 * 1000)
    setAlarmOn(true)
    alert(`✅ ${alarmMinutes}분마다 알람이 설정됐어요!`)
  }

  return (
    <div className={`bg-white rounded-3xl shadow-cute border-2 overflow-hidden card-lift ${
      isDone ? 'border-lemon-300 bg-lemon-50/30' : 'border-lemon-100'
    }`}>
      {/* 카드 헤더 */}
      <button
        className="w-full text-left p-4 flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
          isDone ? 'bg-lemon-100' : 'bg-lemon-50'
        }`}>
          {isDone ? '✅' : routine.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-sm ${isDone ? 'text-lemon-600 line-through' : 'text-gray-800'}`}>
            {routine.title}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{routine.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-lemon-600 font-bold">⏱ {routine.duration}</span>
            {alarmMinutes && alarmOn && (
              <span className="text-xs text-amber-500 font-bold animate-pulse">🔔 알람 ON</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-300 text-sm">{expanded ? '▲' : '▼'}</span>
          {/* 세련된 체크 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isDone
                ? 'bg-gradient-to-br from-lemon-400 to-amber-400 shadow-md'
                : 'border-2 border-dashed border-gray-300 bg-white hover:border-lemon-400 hover:bg-lemon-50'
            }`}
          >
            {isDone && <span className="text-yellow-900 font-black text-base leading-none">✓</span>}
          </button>
        </div>
      </button>

      {/* 확장 영역: 팁 + 이유 */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          {/* 꿀팁 */}
          {routine.tip && (
            <div className="bg-lemon-50 rounded-2xl p-3 border border-lemon-200">
              <p className="text-xs text-yellow-800 font-bold mb-0.5">💡 꿀팁</p>
              <p className="text-xs text-yellow-800 leading-relaxed">{routine.tip}</p>
            </div>
          )}

          {/* 하면 좋은 이유 */}
          {benefits.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-lemon-100 p-3">
              <p className="text-xs font-black text-gray-700 mb-2">✨ 하면 이런 효과가 있어요!</p>
              <div className="space-y-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-lemon-400 text-yellow-900 text-xs font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 유튜브 링크 */}
          {youtube && (
            <a
              href={youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-red-50 border border-red-200 text-red-600 font-black py-2.5 rounded-2xl text-sm active:scale-95 transition-all"
            >
              <span className="text-base">▶</span>
              {youtube.label}
            </a>
          )}

          {/* 알람 버튼 (의자 스트레칭, 눈 휴식만) */}
          {alarmMinutes && (
            <button
              onClick={toggleAlarm}
              className={`w-full font-black py-2.5 rounded-2xl text-sm transition-all active:scale-95 ${
                alarmOn
                  ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-lemon-300'
              }`}
            >
              {alarmOn ? `🔔 ${alarmMinutes}분 알람 켜짐 (탭하면 끄기)` : `🔕 ${alarmMinutes}분마다 알람 설정`}
            </button>
          )}

          {/* 완료 버튼 */}
          {!isDone && (
            <button
              onClick={onToggle}
              className="w-full bg-gradient-to-r from-lemon-400 to-amber-300 text-yellow-900 font-black py-2.5 rounded-2xl text-sm shadow-lemon active:scale-95"
            >
              ✅ 완료!
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── 메인 루틴 페이지 ──────────────────────────────────────
export default function RoutinesPage() {
  const [completed, setCompleted] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('morning')
  const [tipFilter, setTipFilter] = useState('전체')

  useEffect(() => {
    const saved = localStorage.getItem(`routines_${getTodayKey()}`)
    if (saved) setCompleted(JSON.parse(saved))
  }, [])

  const toggleRoutine = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter((c) => c !== id)
      : [...completed, id]
    setCompleted(newCompleted)
    localStorage.setItem(`routines_${getTodayKey()}`, JSON.stringify(newCompleted))
  }

  const allCount = categories.reduce((s, c) => s + c.routines.length, 0)
  const active = categories.find((c) => c.id === activeCategory)!
  const catCompleted = (routines: Routine[]) => routines.filter((r) => completed.includes(r.id)).length

  const filteredTips = tipFilter === '전체'
    ? healthTips
    : healthTips.filter((t) => t.tag === tipFilter)

  return (
    <div className="min-h-screen bg-gradient-to-b from-lemon-50 to-lemon-100 pb-28">
      <Header title="루틴 가이드" />

      {/* 상단 달성률 */}
      <div className="bg-gradient-to-r from-lemon-400 to-amber-300 px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-yellow-900 font-black text-lg">오늘의 달성률</p>
            <p className="text-yellow-800 text-xs">루틴 탭하면 꿀팁과 효과를 볼 수 있어요!</p>
          </div>
          <div className="bg-white/40 rounded-2xl px-4 py-2 text-center">
            <span className="text-3xl font-black text-yellow-900">{completed.length}</span>
            <span className="text-yellow-700 text-sm">/{allCount}</span>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {categories.map((cat) => {
          const done = catCompleted(cat.routines)
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all ${
                isActive
                  ? 'bg-lemon-400 text-yellow-900 shadow-lemon scale-105'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-yellow-600/25 text-yellow-900' : 'bg-gray-100'
              }`}>
                {done}/{cat.routines.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* 루틴 목록 */}
      <div className="px-4 pb-4 space-y-3">
        {active.routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            isDone={completed.includes(routine.id)}
            onToggle={() => toggleRoutine(routine.id)}
          />
        ))}
      </div>

      {/* 건강 팁 */}
      <div className="px-4 py-2">
        <h2 className="text-base font-black text-gray-800 mb-3">🩺 건강 관리 꿀팁</h2>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {tipCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setTipFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                tipFilter === cat
                  ? 'bg-lemon-400 text-yellow-900 shadow-lemon scale-105'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {filteredTips.map((tip) => {
            const tagColor = tipCategoryColors[tip.tag] ?? 'bg-lemon-100 text-yellow-700 border-lemon-200'
            return (
              <div key={tip.id} className="bg-white rounded-3xl p-4 border-2 border-lemon-100 shadow-cute card-lift">
                <div className="flex gap-3">
                  <span className="text-2xl animate-float">{tip.emoji}</span>
                  <div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${tagColor}`}>
                      {tip.tag}
                    </span>
                    <h3 className="font-black text-sm text-gray-800 mt-1">{tip.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.content}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
