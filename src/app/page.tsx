'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { healthTips, communityPosts } from '@/lib/data'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return '늦게까지 계시네요'
  if (h < 12) return '좋은 아침이에요'
  if (h < 14) return '식후 산책 어때요?'
  if (h < 18) return '잘 하고 있어요'
  if (h < 21) return '오늘도 수고했어요'
  return '오늘 하루 어땠나요?'
}

// 시간대별 응원 메시지 풀
const MSG_POOL: Record<string, string[]> = {
  early: [
    '밤 루틴으로 내일을 준비해요 🌙',
    '충분한 수면도 중요한 루틴이에요 😴',
    '오늘 루틴 잘 지키셨나요? 💙',
  ],
  morning: [
    '작은 루틴 하나가 오늘 하루를 바꿔줘요 ✨',
    '기상 후 물 한 잔, 최고의 시작이에요 💧',
    '오늘도 어제보다 더 건강해질 거예요 🌱',
    '루틴을 지키는 당신, 정말 대단해요 💪',
    '5분의 스트레칭이 하루의 에너지를 채워요 🧘',
    '오늘 루틴 완료하면 건강 점수가 올라가요 ⭐',
    '당신의 몸은 당신의 관심에 반응해요 💚',
    '아침 루틴이 하루의 방향을 잡아줘요 🌅',
  ],
  noon: [
    '식후 10분 걷기, 지금이 딱이에요 🚶',
    '점심 후 스트레칭 잊지 마세요 💪',
    '오늘 물은 몇 잔 마셨나요? 💧',
    '오후 루틴도 화이팅이에요 ✨',
    '잠깐 눈 감고 심호흡 세 번 해봐요 🌬️',
  ],
  afternoon: [
    '오늘 절반 이상 왔어요, 잘하고 있어요 🌟',
    '의자 스트레칭 한 번 해볼까요? 🧘',
    '꾸준함이 건강의 비결이에요 🌿',
    '지금 이 순간도 루틴 하나 해봐요 ✨',
    '당신의 노력이 쌓이고 있어요 📈',
  ],
  evening: [
    '하루 마무리 스트레칭 어때요? 🧘',
    '오늘도 정말 수고했어요 💛',
    '자기 전 루틴으로 하루를 마무리해요 🌙',
    '내일 더 건강한 하루를 위해 일찍 자요 😴',
    '오늘 루틴 달성한 것들을 돌아봐요 ✅',
  ],
  night: [
    '푹 자는 것도 건강 루틴이에요 😴',
    '내일은 더 잘할 수 있어요 💪',
    '오늘 하루도 정말 수고했어요 🌙',
  ],
}

function getMotivationMsg() {
  const h = new Date().getHours()
  let pool: string[]
  if (h < 6)       pool = MSG_POOL.early
  else if (h < 12) pool = MSG_POOL.morning
  else if (h < 14) pool = MSG_POOL.noon
  else if (h < 18) pool = MSG_POOL.afternoon
  else if (h < 21) pool = MSG_POOL.evening
  else             pool = MSG_POOL.night
  return pool[h % pool.length]
}

function getTodayDate() {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const now = new Date()
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`
}

// ── 루틴 풀 (각 15개) ──────────────────────────────────────
type Routine = { id: string; emoji: string; title: string; duration: string }

const MORNING_POOL: Routine[] = [
  { id: 'm-water',       emoji: '💧',  title: '기상 후 물 한 잔',     duration: '1분'   },
  { id: 'm-stretch',     emoji: '🧘',  title: '5분 스트레칭',         duration: '5분'   },
  { id: 'm-sunlight',    emoji: '☀️',  title: '햇빛 쬐기',           duration: '10분'  },
  { id: 'm-breakfast',   emoji: '🍳',  title: '아침 식사',            duration: '15분'  },
  { id: 'm-vitamin',     emoji: '💊',  title: '비타민 복용',          duration: '1분'   },
  { id: 'm-memo',        emoji: '📝',  title: '오늘 할 일 메모',      duration: '5분'   },
  { id: 'm-meditation',  emoji: '🧘‍♀️', title: '명상 5분',            duration: '5분'   },
  { id: 'm-gratitude',   emoji: '📔',  title: '감사 일기 쓰기',       duration: '3분'   },
  { id: 'm-skincare',    emoji: '🧴',  title: '세안 / 스킨케어',      duration: '5분'   },
  { id: 'm-walk',        emoji: '🚶',  title: '아침 산책',            duration: '10분'  },
  { id: 'm-breathing',   emoji: '🌬️',  title: '깊은 호흡 3회',       duration: '3분'   },
  { id: 'm-exercise',    emoji: '🏃',  title: '아침 운동',            duration: '20분'  },
  { id: 'm-fruit',       emoji: '🍎',  title: '과일 / 요거트',        duration: '5분'   },
  { id: 'm-window',      emoji: '🪟',  title: '창문 열고 환기',       duration: '2분'   },
  { id: 'm-affirmation', emoji: '💬',  title: '긍정 확언 읽기',       duration: '2분'   },
]

const DAILY_POOL: Routine[] = [
  { id: 'd-water',       emoji: '💧',  title: '물 8잔 마시기',        duration: '하루'         },
  { id: 'd-exercise',    emoji: '🏃',  title: '30분 운동',            duration: '30분'         },
  { id: 'd-veggie',      emoji: '🥗',  title: '채소 한 끼 이상',      duration: '매끼'         },
  { id: 'd-reading',     emoji: '📚',  title: '독서 10분',            duration: '10분'         },
  { id: 'd-noscreen',    emoji: '📵',  title: '취침 전 스크린 끄기',  duration: '자기 1시간 전' },
  { id: 'd-sleep',       emoji: '😴',  title: '일찍 자기',            duration: '11시 이전'    },
  { id: 'd-posture',     emoji: '🪑',  title: '바른 자세 의식하기',   duration: '하루'         },
  { id: 'd-breathing',   emoji: '🌬️',  title: '심호흡 5분',          duration: '5분'          },
  { id: 'd-stretch',     emoji: '💪',  title: '점심 스트레칭',        duration: '5분'          },
  { id: 'd-thanks',      emoji: '🙏',  title: '감사한 일 3가지',      duration: '5분'          },
  { id: 'd-snack',       emoji: '🍬',  title: '간식 줄이기',          duration: '하루'         },
  { id: 'd-stairs',      emoji: '🚶',  title: '계단 이용하기',        duration: '매일'         },
  { id: 'd-contact',     emoji: '📞',  title: '소중한 사람 연락하기', duration: '5분'          },
  { id: 'd-learn',       emoji: '🎓',  title: '새로운 것 배우기',     duration: '10분'         },
  { id: 'd-phone-break', emoji: '⏸️',  title: '폰 내려놓기',         duration: '1시간'        },
]

const EVENING_POOL: Routine[] = [
  { id: 'e-stretch',    emoji: '🧘',  title: '잠자리 스트레칭',      duration: '10분'          },
  { id: 'e-meditation', emoji: '🧘‍♀️', title: '명상 / 심호흡',       duration: '5분'           },
  { id: 'e-diary',      emoji: '📔',  title: '하루 일기 쓰기',       duration: '10분'          },
  { id: 'e-prep',       emoji: '📝',  title: '내일 준비하기',        duration: '5분'           },
  { id: 'e-noscreen',   emoji: '📵',  title: '스마트폰 끄기',        duration: '자기 1시간 전' },
  { id: 'e-tea',        emoji: '🫖',  title: '따뜻한 허브차',        duration: '5분'           },
  { id: 'e-reading',    emoji: '📚',  title: '잠자리 독서',          duration: '15분'          },
  { id: 'e-skincare',   emoji: '🧴',  title: '저녁 스킨케어',        duration: '5분'           },
  { id: 'e-brush',      emoji: '🪥',  title: '치실 / 양치',          duration: '5분'           },
  { id: 'e-breathing',  emoji: '🌬️',  title: '4-7-8 호흡법',        duration: '5분'           },
  { id: 'e-foot',       emoji: '🦶',  title: '발 마사지',            duration: '5분'           },
  { id: 'e-knee',       emoji: '💪',  title: '다리 / 무릎 스트레칭', duration: '5분'           },
  { id: 'e-reflect',    emoji: '💭',  title: '오늘 하루 돌아보기',   duration: '5분'           },
  { id: 'e-plan',       emoji: '🗓️',  title: '내일 계획 세우기',     duration: '5분'           },
  { id: 'e-gratitude',  emoji: '🙏',  title: '감사 일기 3줄',        duration: '3분'           },
]

const DEFAULT_MORNING_IDS = ['m-water', 'm-stretch', 'm-breakfast', 'm-vitamin', 'm-memo', 'm-sunlight']
const DEFAULT_DAILY_IDS   = ['d-water', 'd-exercise', 'd-reading', 'd-sleep', 'd-posture']
const DEFAULT_EVENING_IDS = ['e-stretch', 'e-noscreen', 'e-diary', 'e-brush', 'e-reflect']

// ── 물방울 SVG ─────────────────────────────────────────────
function WaterDrop({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition-all">
      <svg viewBox="0 0 24 32" className={`w-7 h-9 transition-all duration-300 ${filled ? 'drop-shadow-sm' : ''}`}>
        <path
          d="M12 0 C12 0 1 13 1 21 C1 27.075 5.925 32 12 32 C18.075 32 23 27.075 23 21 C23 13 12 0 12 0 Z"
          fill={filled ? '#7DD3FC' : '#E5E7EB'}
        />
        {filled && (
          <ellipse cx="9" cy="19" rx="2.5" ry="4" fill="white" opacity="0.35" transform="rotate(-20 9 19)" />
        )}
      </svg>
    </button>
  )
}

// ── 물 트래커 ──────────────────────────────────────────────
function WaterTracker() {
  const [water, setWater] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(`water_${getTodayKey()}`)
    if (saved) setWater(parseInt(saved))
  }, [])

  const tap = (i: number) => {
    const newVal = i < water ? i : i + 1
    setWater(newVal)
    localStorage.setItem(`water_${getTodayKey()}`, String(newVal))
  }

  const msgs = ['아직 한 잔도 안 마셨어요', '좋은 시작이에요', '잘 하고 있어요', '절반 달성!', '조금만 더요', '거의 다 왔어요', '한 잔만 더!', '목표 달성!']

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">수분 섭취</h3>
          <p className="text-gray-500 text-xs mt-0.5">{msgs[Math.min(water, msgs.length - 1)]}</p>
        </div>
        <span className="text-sm font-black text-sky-500">
          {water}<span className="text-gray-500 font-normal text-xs">/8잔</span>
        </span>
      </div>
      <div className="flex justify-between items-end px-1">
        {Array.from({ length: 8 }, (_, i) => (
          <WaterDrop key={i} filled={i < water} onClick={() => tap(i)} />
        ))}
      </div>
      {water >= 8 && (
        <p className="text-center text-sky-500 font-bold text-xs mt-2 animate-bounce-in">
          오늘 수분 목표 완료!
        </p>
      )}
    </div>
  )
}

// ── 스트릭 ─────────────────────────────────────────────────
function getStreakCount(): number {
  try {
    const d = JSON.parse(localStorage.getItem('streak_data') || '{}')
    if (!d.lastDate) return 0
    const today = getTodayKey()
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (d.lastDate === today || d.lastDate === yesterday) return d.count || 0
    return 0
  } catch { return 0 }
}

function maybeUpdateStreak() {
  try {
    const today = getTodayKey()
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const d = JSON.parse(localStorage.getItem('streak_data') || '{}')
    if (d.lastDate === today) return
    const newCount = d.lastDate === yesterday ? (d.count || 0) + 1 : 1
    localStorage.setItem('streak_data', JSON.stringify({ count: newCount, lastDate: today }))
  } catch { /* ignore */ }
}

// ── 루틴 타일 ──────────────────────────────────────────────
function RoutineTile({
  emoji, title, duration, isDone, onToggle, onCertify,
}: {
  emoji: string; title: string; duration: string
  isDone: boolean; onToggle: () => void; onCertify?: () => void
}) {
  return (
    <div className={`relative rounded-2xl border transition-all ${
      isDone ? 'bg-lemon-50 border-lemon-300' : 'bg-white border-gray-100 shadow-card'
    }`}>
      <button onClick={onToggle} className="w-full text-left p-3.5 active:scale-95 transition-all block">
        <div className={`text-2xl mb-2 ${isDone ? 'opacity-40' : ''}`}>{emoji}</div>
        <h3 className={`font-bold text-sm leading-tight ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {title}
        </h3>
        <span className={`text-xs mt-1 block ${isDone ? 'text-gray-300' : 'text-gray-500'}`}>{duration}</span>
      </button>
      {isDone && (
        <>
          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-lemon-400 flex items-center justify-center">
            <span className="text-gray-900 text-xs font-black leading-none">✓</span>
          </div>
          {onCertify && (
            <button
              onClick={onCertify}
              className="w-full flex items-center justify-center gap-1 py-2 border-t border-lemon-200 text-xs font-bold text-emerald-700 active:bg-lemon-100 transition-colors"
            >
              <span>📸</span>
              <span>인증하기</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── 루틴 편집 모달 ─────────────────────────────────────────
function EditRoutineModal({
  pool, selected, sectionTitle, onSave, onClose,
}: {
  pool: Routine[]
  selected: string[]
  sectionTitle: string
  onSave: (ids: string[]) => void
  onClose: () => void
}) {
  const [picked, setPicked] = useState<string[]>(selected)
  const [applied, setApplied] = useState(false)

  const toggle = (id: string) => {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleApply = () => {
    onSave(picked)
    setApplied(true)
    setTimeout(() => onClose(), 900)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end max-w-[480px] mx-auto">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <div>
            <h3 className="font-black text-gray-800 text-base">{sectionTitle} 루틴 설정</h3>
            <p className="text-xs text-gray-500 mt-0.5">원하는 루틴을 선택해요 · {picked.length}개 선택됨</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 space-y-1.5 pb-3">
          {pool.map((r) => {
            const isSelected = picked.includes(r.id)
            return (
              <button key={r.id} onClick={() => toggle(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  isSelected ? 'bg-lemon-50 border-lemon-300' : 'bg-gray-50 border-transparent'
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.duration}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'bg-lemon-400 border-lemon-400' : 'border-gray-300'
                }`}>
                  {isSelected && <span className="text-gray-900 text-xs font-black">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-5 pt-3 border-t border-gray-100 flex-shrink-0">
          {picked.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {picked.map((id) => {
                const r = pool.find((p) => p.id === id)
                return r ? (
                  <span key={id} className="flex items-center gap-1 bg-lemon-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                    {r.emoji} {r.title}
                  </span>
                ) : null
              })}
            </div>
          )}
          {applied ? (
            <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-mint-100 text-forest-800 font-black text-sm">
              <span>✓</span> 적용됐어요!
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm">취소</button>
              <button onClick={handleApply} className="flex-[2] py-3.5 rounded-2xl bg-lemon-400 text-forest-900 font-black text-sm">
                {picked.length}개 루틴 적용하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 사진 인증 모달 ─────────────────────────────────────────
function PhotoCertModal({
  routineTitle, routineEmoji, onClose,
}: {
  routineTitle: string
  routineEmoji: string
  onClose: () => void
}) {
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end max-w-[480px] mx-auto">
      <div className="bg-white rounded-t-3xl w-full p-5 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{routineEmoji}</span>
          <div className="flex-1">
            <h3 className="font-black text-gray-800">루틴 인증하기</h3>
            <p className="text-xs text-gray-500">{routineTitle}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">×</button>
        </div>

        {!photo ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-lemon-300 hover:bg-lemon-50 transition-all active:scale-95"
          >
            <span className="text-4xl">📸</span>
            <span className="text-sm font-bold text-gray-600">사진 찍어서 인증하기</span>
            <span className="text-xs text-gray-500">갤러리 선택 또는 카메라 촬영</span>
          </button>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="인증 사진" className="w-full h-52 object-cover rounded-2xl" />
            <button onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold">×</button>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
              {routineEmoji} {routineTitle}
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

        <div className="mt-4 space-y-2">
          {photo && (
            <Link href="/community"
              className="flex items-center justify-center gap-2 w-full bg-forest-800 text-white font-black py-3.5 rounded-2xl text-sm active:scale-95 transition-all"
            >
              <span>🌍</span> 커뮤니티에 공유하기
            </Link>
          )}
          <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm">
            {photo ? '나만 저장하고 닫기' : '닫기'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 루틴 섹션 ──────────────────────────────────────────────
function RoutineSection({
  title, subtitle, pool, activeIds, completed, storageKey,
  onSave, onToggle, onCertify,
}: {
  title: string; subtitle: string; pool: Routine[]
  activeIds: string[]; completed: string[]; storageKey: string
  onSave: (ids: string[]) => void
  onToggle: (id: string) => void
  onCertify: (r: Routine) => void
}) {
  const [showEdit, setShowEdit] = useState(false)
  const routines = pool.filter((r) => activeIds.includes(r.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h2 className="text-sm font-black text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="text-xs font-bold text-lemon-700 bg-lemon-100 px-2.5 py-1 rounded-full"
        >
          편집
        </button>
      </div>

      {routines.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {routines.map((r) => (
            <RoutineTile key={r.id} emoji={r.emoji} title={r.title} duration={r.duration}
              isDone={completed.includes(r.id)}
              onToggle={() => onToggle(r.id)}
              onCertify={() => onCertify(r)}
            />
          ))}
        </div>
      ) : (
        <button onClick={() => setShowEdit(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-1.5 text-gray-500 hover:border-lemon-300 transition-colors"
        >
          <span className="text-2xl">+</span>
          <span className="text-sm font-bold">{title} 추가하기</span>
          <span className="text-xs">15가지 루틴 중에서 선택해요</span>
        </button>
      )}

      {showEdit && (
        <EditRoutineModal pool={pool} selected={activeIds} sectionTitle={title}
          onSave={(ids) => { onSave(ids); localStorage.setItem(storageKey, JSON.stringify(ids)) }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

// ── 홈 페이지 ──────────────────────────────────────────────
export default function HomePage() {
  const [completed, setCompleted]       = useState<string[]>([])
  const [streak, setStreak]             = useState(0)
  const [waterCount, setWaterCount]     = useState(0)
  const [morningIds, setMorningIds]     = useState<string[]>(DEFAULT_MORNING_IDS)
  const [dailyIds, setDailyIds]         = useState<string[]>(DEFAULT_DAILY_IDS)
  const [eveningIds, setEveningIds]     = useState<string[]>(DEFAULT_EVENING_IDS)
  const [certRoutine, setCertRoutine]   = useState<Routine | null>(null)
  const [myChallenges, setMyChallenges] = useState<{ title: string; emoji: string; done: number; total: number }[]>([])

  const todayTip  = healthTips[new Date().getDay() % healthTips.length]
  const greeting  = getGreeting()
  const motivation = getMotivationMsg()

  useEffect(() => {
    const today = getTodayKey()
    const saved = localStorage.getItem(`routines_${today}`)
    if (saved) setCompleted(JSON.parse(saved))
    setStreak(getStreakCount())
    setWaterCount(parseInt(localStorage.getItem(`water_${today}`) || '0'))

    const sm = localStorage.getItem('user_morning_routines')
    if (sm) setMorningIds(JSON.parse(sm))
    const sd = localStorage.getItem('user_daily_routines')
    if (sd) setDailyIds(JSON.parse(sd))
    const se = localStorage.getItem('user_evening_routines')
    if (se) setEveningIds(JSON.parse(se))

    const challenges = JSON.parse(localStorage.getItem('my_challenges') || '[]')
    setMyChallenges(
      challenges.slice(0, 3).map((c: { title: string; emoji: string; checkIns: unknown[]; days: number }) => ({
        title: c.title, emoji: c.emoji,
        done: c.checkIns.length, total: c.days,
      }))
    )
  }, [])

  const toggleRoutine = (id: string) => {
    const today = getTodayKey()
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id]
    setCompleted(next)
    localStorage.setItem(`routines_${today}`, JSON.stringify(next))
    if (!completed.includes(id)) {
      maybeUpdateStreak()
      setStreak(getStreakCount())
    }
  }

  const allActive      = [
    ...MORNING_POOL.filter((r) => morningIds.includes(r.id)),
    ...DAILY_POOL.filter((r) => dailyIds.includes(r.id)),
    ...EVENING_POOL.filter((r) => eveningIds.includes(r.id)),
  ]
  const totalCount     = allActive.length
  const completedCount = completed.filter((id) => allActive.some((r) => r.id === id)).length
  const progress       = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const routineScore   = totalCount > 0 ? Math.round((completedCount / totalCount) * 60) : 0
  const waterScore     = Math.round((waterCount / 8) * 20)
  const streakScore    = Math.min(streak * 2, 20)
  const healthScore    = routineScore + waterScore + streakScore

  // 스트릭 아이콘
  const streakIcon = streak >= 30 ? '🔥' : streak >= 7 ? '⚡' : streak >= 3 ? '✨' : '🌱'
  // 건강 점수 아이콘
  const scoreIcon  = healthScore >= 80 ? '⭐' : healthScore >= 50 ? '🌟' : healthScore >= 20 ? '💪' : '🌱'

  return (
    <div className="min-h-screen pb-28 bg-gray-100">
      <Header />

      {/* 히어로 */}
      <div className="bg-lemon-400 px-4 pt-5 pb-6 relative overflow-hidden">

        {/* 날짜 + 인사 + 응원 메시지 */}
        <div className="relative">
          <p className="text-black/50 text-xs font-medium">{getTodayDate()}</p>
          <h1 className="text-xl font-black text-gray-900 mt-1">{greeting}</h1>
          <div className="mt-2 bg-white/40 rounded-xl px-3 py-2">
            <p className="text-gray-900 text-xs font-medium">{motivation}</p>
          </div>
        </div>

        {/* 스탯 카드 3개 */}
        <div className="flex gap-2 mt-3 relative">

          {/* 연속 달성 — 강조 */}
          <div className="flex-1 bg-white/60 rounded-2xl p-3 text-center border border-white/50 shadow-sm">
            <p className="text-xs text-black/50 font-bold mb-0.5">연속 달성</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{streak}</p>
            <p className="text-base font-black text-gray-700 leading-none mt-0.5">일</p>
            <p className="text-xl mt-1">{streakIcon}</p>
          </div>

          {/* 달성률 */}
          <div className="flex-[2] bg-white/60 rounded-2xl p-3 border border-white/50 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-black/60 font-bold">오늘 달성률</span>
              <span className="text-gray-900 font-black text-base">{completedCount}/{totalCount}</span>
            </div>
            <div className="bg-black/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-forest-800 transition-all duration-700"
                style={{ width: `${Math.max(progress, 2)}%` }}
              />
            </div>
            <p className="text-gray-900 font-black text-3xl mt-1 text-right leading-none">{progress}%</p>
            {completedCount > 0 && completedCount === totalCount ? (
              <p className="text-forest-800 font-black text-xs text-center mt-0.5 animate-bounce-in">🎉 오늘 완료!</p>
            ) : (
              <p className="text-black/40 text-xs mt-0.5">탭해서 체크</p>
            )}
          </div>

          {/* 건강 점수 — 강조 */}
          <div className="flex-1 bg-white/60 rounded-2xl p-3 text-center border border-white/50 shadow-sm">
            <p className="text-xs text-black/50 font-bold mb-0.5">건강 점수</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{healthScore}</p>
            <p className="text-base font-black text-gray-700 leading-none mt-0.5">점</p>
            <p className="text-xl mt-1">{scoreIcon}</p>
          </div>

        </div>
      </div>

      <div className="px-4 space-y-5 pt-4">
        {/* 수분 섭취 */}
        <WaterTracker />

        {/* 퀵 액션 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: '/community',    emoji: '📸', label: '루틴 공유',    bg: 'bg-emerald-50 border-emerald-200' },
            { href: '/news',         emoji: '🌿', label: '건강 정보',    bg: 'bg-lemon-50   border-lemon-200'  },
            { href: '/blood-sugar',  emoji: '🩸', label: '혈당·다이어트', bg: 'bg-red-50    border-red-200'    },
            { href: '/my-challenge', emoji: '🎯', label: '나만의 챌린지', bg: 'bg-sky-50    border-sky-200'    },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 ${item.bg} border rounded-2xl py-3 active:scale-95 transition-all`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold text-gray-600 text-center leading-tight whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* 아침 루틴 */}
        <RoutineSection
          title="아침 루틴" subtitle="기상 후 하루를 여는 습관"
          pool={MORNING_POOL} activeIds={morningIds} completed={completed}
          storageKey="user_morning_routines"
          onSave={setMorningIds} onToggle={toggleRoutine} onCertify={setCertRoutine}
        />

        {/* 평소 루틴 */}
        <RoutineSection
          title="평소 루틴" subtitle="하루 동안 꾸준히 지키는 습관"
          pool={DAILY_POOL} activeIds={dailyIds} completed={completed}
          storageKey="user_daily_routines"
          onSave={setDailyIds} onToggle={toggleRoutine} onCertify={setCertRoutine}
        />

        {/* 자기 전 루틴 */}
        <RoutineSection
          title="자기 전 루틴" subtitle="잠자리에 들기 전 마무리 습관"
          pool={EVENING_POOL} activeIds={eveningIds} completed={completed}
          storageKey="user_evening_routines"
          onSave={setEveningIds} onToggle={toggleRoutine} onCertify={setCertRoutine}
        />

        {/* 커뮤니티 미리보기 */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-gray-800">오늘의 인증</h2>
            <Link href="/community" className="text-xs font-bold text-lemon-700 bg-lemon-100 px-2.5 py-1 rounded-full">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {communityPosts.slice(0, 2).map((post) => (
              <div key={post.id} className="bg-white rounded-2xl p-3 flex gap-3 border border-gray-100 shadow-card">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-gray-800">{post.user}</span>
                    <span className="text-xs text-gray-500">{post.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 나만의 챌린지 */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-gray-800">나만의 챌린지</h2>
            <Link href="/my-challenge" className="text-xs font-bold text-lemon-700 bg-lemon-100 px-2.5 py-1 rounded-full">
              전체보기
            </Link>
          </div>
          {myChallenges.length > 0 ? (
            <div className="space-y-2">
              {myChallenges.map((c, i) => {
                const pct = Math.min(Math.round((c.done / c.total) * 100), 100)
                return (
                  <Link key={i} href="/my-challenge" className="block bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-1.5 bg-lemon-400 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">{c.done}/{c.total}일</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Link href="/my-challenge" className="block bg-emerald-500 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-lemon-400 text-gray-900 text-xs font-black px-2 py-0.5 rounded-full">
                    나만의 챌린지
                  </span>
                  <p className="text-white font-black text-sm mt-2">내 목표를 직접 만들고<br />매일 사진으로 인증해요</p>
                  <p className="text-white/50 text-xs mt-1">체크인 +5P · 완료 최대 +350P</p>
                </div>
                <span className="text-4xl">🎯</span>
              </div>
            </Link>
          )}
        </div>

        {/* 오늘의 팁 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-lemon-400 rounded-full" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide">오늘의 팁</p>
          </div>
          <h3 className="font-black text-gray-800 text-sm mb-1">{todayTip.title}</h3>
          <p className="text-gray-500 text-xs leading-relaxed">{todayTip.content}</p>
          <Link href="/news" className="mt-3 block text-xs font-bold text-forest-700">
            건강 정보 더 보기 →
          </Link>
        </div>
      </div>

      {certRoutine && (
        <PhotoCertModal
          routineTitle={certRoutine.title}
          routineEmoji={certRoutine.emoji}
          onClose={() => setCertRoutine(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
