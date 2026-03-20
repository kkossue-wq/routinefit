'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

// ── 혈당 타입 ──────────────────────────────────────────────
type BSEntry = {
  fasting?: number
  afterBreakfast?: number
  afterLunch?: number
  afterDinner?: number
  bedtime?: number
  foodBreakfast?: string
  foodLunch?: string
  foodDinner?: string
  photoBreakfast?: string   // base64
  photoLunch?: string
  photoDinner?: string
  memo?: string
}

// ── 체중 타입 ──────────────────────────────────────────────
type MealQuality = 'good' | 'okay' | 'bad'
type WeightEntry = {
  weight?: number
  mealBreakfast?: MealQuality
  mealLunch?: MealQuality
  mealDinner?: MealQuality
  foodBreakfast?: string
  foodLunch?: string
  foodDinner?: string
  photoBreakfast?: string   // base64
  photoLunch?: string
  photoDinner?: string
  note?: string
}

const MEASUREMENTS = [
  { id: 'fasting',        label: '공복',      emoji: '🌙', time: '기상 직후',      isFasting: true,  hasFoodLog: false },
  { id: 'afterBreakfast', label: '아침 식후', emoji: '🥗', time: '아침 식후 2시간', isFasting: false, hasFoodLog: true  },
  { id: 'afterLunch',     label: '점심 식후', emoji: '🍱', time: '점심 식후 2시간', isFasting: false, hasFoodLog: true  },
  { id: 'afterDinner',    label: '저녁 식후', emoji: '🍽️', time: '저녁 식후 2시간', isFasting: false, hasFoodLog: true  },
  { id: 'bedtime',        label: '취침 전',   emoji: '😴', time: '취침 1시간 전',   isFasting: true,  hasFoodLog: false },
]

// 혈당 ID → 사진 BSEntry 키 매핑
const BS_PHOTO_KEY: Record<string, keyof BSEntry> = {
  afterBreakfast: 'photoBreakfast',
  afterLunch:     'photoLunch',
  afterDinner:    'photoDinner',
}

function getBSStatus(value: number, isFasting: boolean) {
  if (isFasting) {
    if (value < 100) return { label: '정상', color: 'text-green-600', bg: 'bg-green-50 border-green-200'  }
    if (value < 126) return { label: '주의', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200'  }
    return           { label: '위험', color: 'text-red-600',   bg: 'bg-red-50   border-red-200'    }
  } else {
    if (value < 140) return { label: '정상', color: 'text-green-600', bg: 'bg-green-50 border-green-200'  }
    if (value < 200) return { label: '주의', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200'  }
    return           { label: '위험', color: 'text-red-600',   bg: 'bg-red-50   border-red-200'    }
  }
}

function getBMIStatus(bmi: number) {
  if (bmi < 18.5) return { label: '저체중',  color: 'text-sky-600',    bg: 'bg-sky-50    border-sky-200'    }
  if (bmi < 23)   return { label: '정상',    color: 'text-green-600',  bg: 'bg-green-50  border-green-200'  }
  if (bmi < 25)   return { label: '과체중',  color: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200'  }
  if (bmi < 30)   return { label: '비만',    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }
  return           { label: '고도비만', color: 'text-red-600',    bg: 'bg-red-50    border-red-200'    }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function getDateKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

const MEAL_OPTIONS: { value: MealQuality; label: string; emoji: string; color: string }[] = [
  { value: 'good', label: '잘 먹었어요', emoji: '😊', color: 'bg-green-50  border-green-300  text-green-700'  },
  { value: 'okay', label: '보통이에요',  emoji: '😐', color: 'bg-amber-50  border-amber-300  text-amber-700'  },
  { value: 'bad',  label: '아쉬웠어요', emoji: '😔', color: 'bg-red-50    border-red-300    text-red-700'    },
]

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

function DateNav({ dateKey, isToday, onPrev, onNext }: {
  dateKey: string; isToday: boolean; onPrev: () => void; onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b-2 border-lemon-100">
      <button onClick={onPrev} className="w-9 h-9 rounded-full bg-lemon-100 flex items-center justify-center font-black text-yellow-700 text-lg active:scale-90">‹</button>
      <div className="text-center">
        <p className="font-black text-gray-800 text-base">{formatDate(dateKey)}</p>
        {isToday && <p className="text-xs text-lemon-600 font-bold">오늘</p>}
      </div>
      <button onClick={onNext} disabled={isToday} className="w-9 h-9 rounded-full bg-lemon-100 flex items-center justify-center font-black text-yellow-700 text-lg active:scale-90 disabled:opacity-30">›</button>
    </div>
  )
}

// ── 사진 미리보기 / 삭제 컴포넌트 ─────────────────────────
function PhotoThumb({ src, onDelete }: { src: string; onDelete: () => void }) {
  return (
    <div className="relative mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="식사 사진" className="w-full h-36 object-cover rounded-2xl" />
      <button onClick={onDelete}
        className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
      >×</button>
    </div>
  )
}

export default function BloodSugarPage() {
  const [activeTab, setActiveTab] = useState<'blood' | 'weight'>('blood')

  // ── 혈당 상태 ────────────────────────────────────────────
  const [bsOffset, setBsOffset]         = useState(0)
  const [bsInputs, setBsInputs]         = useState<Record<string, string>>({})
  const [bsPhotos, setBsPhotos]         = useState<Record<string, string>>({})  // photo_afterBreakfast 등
  const [bsSaved, setBsSaved]           = useState(false)
  const [bsHistory, setBsHistory]       = useState<Record<string, BSEntry>>({})
  const [expandedFood, setExpandedFood] = useState<string | null>(null)

  // ── 체중 상태 ────────────────────────────────────────────
  const [wOffset, setWOffset]           = useState(0)
  const [weightInput, setWeightInput]   = useState('')
  const [meals, setMeals]               = useState<Record<string, MealQuality | undefined>>({})
  const [mealFoods, setMealFoods]       = useState<Record<string, string>>({})    // 아침/점심/저녁 식사 내용
  const [mealPhotos, setMealPhotos]     = useState<Record<string, string>>({})    // 아침/점심/저녁 식사 사진
  const [weightNote, setWeightNote]     = useState('')
  const [wSaved, setWSaved]             = useState(false)
  const [wHistory, setWHistory]         = useState<Record<string, WeightEntry>>({})
  const [userHeight, setUserHeight]     = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [showSetup, setShowSetup]       = useState(false)

  // ── 사진 입력 ref (공용) ──────────────────────────────────
  const photoInputRef  = useRef<HTMLInputElement>(null)
  const [photoTarget, setPhotoTarget] = useState<string | null>(null) // 어느 항목의 사진인지

  const bsDateKey = getDateKey(bsOffset)
  const wDateKey  = getDateKey(wOffset)
  const bsIsToday = bsOffset === 0
  const wIsToday  = wOffset === 0

  const loadBsHistory = () => {
    const hist: Record<string, BSEntry> = {}
    for (let i = -6; i <= 0; i++) {
      const k = getDateKey(i)
      const d = localStorage.getItem(`blood_sugar_${k}`)
      if (d) hist[k] = JSON.parse(d)
    }
    setBsHistory(hist)
  }

  const loadWHistory = () => {
    const hist: Record<string, WeightEntry> = {}
    for (let i = -6; i <= 0; i++) {
      const k = getDateKey(i)
      const d = localStorage.getItem(`weight_${k}`)
      if (d) hist[k] = JSON.parse(d)
    }
    setWHistory(hist)
  }

  useEffect(() => {
    const saved = localStorage.getItem(`blood_sugar_${bsDateKey}`)
    if (saved) {
      const p: BSEntry = JSON.parse(saved)
      const ni: Record<string, string> = {}
      MEASUREMENTS.forEach((m) => {
        const val = (p as Record<string, unknown>)[m.id]
        if (val !== undefined) ni[m.id] = String(val)
      })
      if (p.foodBreakfast) ni['food_afterBreakfast'] = p.foodBreakfast
      if (p.foodLunch)     ni['food_afterLunch']     = p.foodLunch
      if (p.foodDinner)    ni['food_afterDinner']    = p.foodDinner
      if (p.memo)          ni['memo']                = p.memo
      setBsInputs(ni)
      // 사진 복원
      const ph: Record<string, string> = {}
      if (p.photoBreakfast) ph['photo_afterBreakfast'] = p.photoBreakfast
      if (p.photoLunch)     ph['photo_afterLunch']     = p.photoLunch
      if (p.photoDinner)    ph['photo_afterDinner']    = p.photoDinner
      setBsPhotos(ph)
    } else {
      setBsInputs({}); setBsPhotos({})
    }
    setBsSaved(false); setExpandedFood(null); loadBsHistory()
  }, [bsDateKey])

  useEffect(() => {
    const saved = localStorage.getItem(`weight_${wDateKey}`)
    if (saved) {
      const p: WeightEntry = JSON.parse(saved)
      setWeightInput(p.weight ? String(p.weight) : '')
      setMeals({ breakfast: p.mealBreakfast, lunch: p.mealLunch, dinner: p.mealDinner })
      setMealFoods({
        breakfast: p.foodBreakfast ?? '',
        lunch:     p.foodLunch     ?? '',
        dinner:    p.foodDinner    ?? '',
      })
      const ph: Record<string, string> = {}
      if (p.photoBreakfast) ph.breakfast = p.photoBreakfast
      if (p.photoLunch)     ph.lunch     = p.photoLunch
      if (p.photoDinner)    ph.dinner    = p.photoDinner
      setMealPhotos(ph)
      setWeightNote(p.note ?? '')
    } else {
      setWeightInput(''); setMeals({}); setMealFoods({}); setMealPhotos({}); setWeightNote('')
    }
    setWSaved(false); loadWHistory()
  }, [wDateKey])

  useEffect(() => {
    const h = localStorage.getItem('user_height')
    if (h) setUserHeight(h)
    const tw = localStorage.getItem('user_target_weight')
    if (tw) setTargetWeight(tw)
  }, [])

  // ── 사진 캡처 공통 핸들러 ─────────────────────────────────
  const openPhotoCapture = (target: string) => {
    setPhotoTarget(target)
    setTimeout(() => photoInputRef.current?.click(), 50)
  }

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !photoTarget) return
    const base64 = await readFileAsBase64(file)
    e.target.value = '' // reset
    if (photoTarget.startsWith('bs_')) {
      const key = photoTarget.replace('bs_', '')
      setBsPhotos((prev) => ({ ...prev, [key]: base64 }))
    } else if (photoTarget.startsWith('w_')) {
      const key = photoTarget.replace('w_', '')
      setMealPhotos((prev) => ({ ...prev, [key]: base64 }))
    }
    setPhotoTarget(null)
  }

  // ── 혈당 저장 ─────────────────────────────────────────────
  const saveBs = () => {
    const entry: Record<string, unknown> = {}
    MEASUREMENTS.forEach((m) => {
      const val = parseInt(bsInputs[m.id] ?? '')
      if (!isNaN(val) && val > 0) entry[m.id] = val
    })
    if (bsInputs['food_afterBreakfast']) entry.foodBreakfast = bsInputs['food_afterBreakfast']
    if (bsInputs['food_afterLunch'])     entry.foodLunch     = bsInputs['food_afterLunch']
    if (bsInputs['food_afterDinner'])    entry.foodDinner    = bsInputs['food_afterDinner']
    if (bsPhotos['photo_afterBreakfast']) entry.photoBreakfast = bsPhotos['photo_afterBreakfast']
    if (bsPhotos['photo_afterLunch'])     entry.photoLunch     = bsPhotos['photo_afterLunch']
    if (bsPhotos['photo_afterDinner'])    entry.photoDinner    = bsPhotos['photo_afterDinner']
    if (bsInputs.memo) entry.memo = bsInputs.memo
    try {
      localStorage.setItem(`blood_sugar_${bsDateKey}`, JSON.stringify(entry))
    } catch { /* 저장 실패(용량 초과)시 사진 제외 */ }
    setBsSaved(true); loadBsHistory()
    setTimeout(() => setBsSaved(false), 2500)
  }

  // ── 체중 저장 ─────────────────────────────────────────────
  const saveWeight = () => {
    const w = parseFloat(weightInput)
    const entry: WeightEntry = {}
    if (!isNaN(w) && w > 0) entry.weight = w
    if (meals.breakfast) entry.mealBreakfast = meals.breakfast as MealQuality
    if (meals.lunch)     entry.mealLunch     = meals.lunch     as MealQuality
    if (meals.dinner)    entry.mealDinner    = meals.dinner    as MealQuality
    if (mealFoods.breakfast) entry.foodBreakfast = mealFoods.breakfast
    if (mealFoods.lunch)     entry.foodLunch     = mealFoods.lunch
    if (mealFoods.dinner)    entry.foodDinner    = mealFoods.dinner
    if (mealPhotos.breakfast) entry.photoBreakfast = mealPhotos.breakfast
    if (mealPhotos.lunch)     entry.photoLunch     = mealPhotos.lunch
    if (mealPhotos.dinner)    entry.photoDinner    = mealPhotos.dinner
    if (weightNote) entry.note = weightNote
    try {
      localStorage.setItem(`weight_${wDateKey}`, JSON.stringify(entry))
    } catch { /* 용량 초과 */ }
    setWSaved(true); loadWHistory()
    setTimeout(() => setWSaved(false), 2500)
  }

  const saveSetup = () => {
    if (userHeight)   localStorage.setItem('user_height', userHeight)
    if (targetWeight) localStorage.setItem('user_target_weight', targetWeight)
    setShowSetup(false)
  }

  const allBsValues = MEASUREMENTS.map((m) => {
    const val = parseInt(bsInputs[m.id] ?? '')
    if (isNaN(val) || val <= 0) return null
    return { val, isFasting: m.isFasting }
  }).filter(Boolean) as { val: number; isFasting: boolean }[]

  const hasBsWarning = allBsValues.some(({ val, isFasting }) => getBSStatus(val, isFasting).label !== '정상')
  const hasBsDanger  = allBsValues.some(({ val, isFasting }) => getBSStatus(val, isFasting).label === '위험')

  const heightNum = parseFloat(userHeight)
  const weightNum = parseFloat(weightInput)
  const bmi = (!isNaN(heightNum) && heightNum > 0 && !isNaN(weightNum) && weightNum > 0)
    ? parseFloat((weightNum / ((heightNum / 100) ** 2)).toFixed(1)) : null
  const bmiStatus = bmi ? getBMIStatus(bmi) : null

  const wHistoryValues = Object.values(wHistory).map((e) => e.weight).filter((v): v is number => v !== undefined)
  const firstWeight  = wHistoryValues.length > 0 ? wHistoryValues[wHistoryValues.length - 1] : null
  const latestWeight = wHistoryValues.length > 0 ? wHistoryValues[0] : null
  const targetNum    = parseFloat(targetWeight)

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Header title="건강 기록" />

      {/* 공용 사진 파일 인풋 */}
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handlePhotoCapture} />

      {/* 탭 */}
      <div className="flex bg-white border-b-2 border-lemon-100">
        <button onClick={() => setActiveTab('blood')}
          className={`flex-1 py-3.5 font-black text-sm transition-all border-b-2 ${
            activeTab === 'blood' ? 'border-red-400 text-red-500' : 'border-transparent text-gray-500'
          }`}>🩸 혈당 기록</button>
        <button onClick={() => setActiveTab('weight')}
          className={`flex-1 py-3.5 font-black text-sm transition-all border-b-2 ${
            activeTab === 'weight' ? 'border-lemon-500 text-gray-800' : 'border-transparent text-gray-500'
          }`}>⚖️ 체중 &amp; 다이어트</button>
      </div>

      {/* ══ 혈당 기록 탭 ══════════════════════════════════════ */}
      {activeTab === 'blood' && (
        <>
          <div className="bg-gradient-to-r from-red-400 to-orange-400 px-4 py-4 relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-lg">🩸 혈당 기록</h2>
                <p className="text-white/80 text-xs mt-0.5">식사 내용과 함께 기록하면 패턴이 보여요</p>
              </div>
              <div className="bg-white/25 rounded-2xl px-3 py-2 text-right">
                <p className="text-white font-black text-xs">정상 범위</p>
                <p className="text-white/90 text-xs">공복: 70~100</p>
                <p className="text-white/90 text-xs">식후: 70~140</p>
              </div>
            </div>
            {allBsValues.length > 0 && (
              <div className={`relative mt-3 rounded-2xl px-3 py-2 border ${
                hasBsDanger ? 'bg-red-100/80 border-red-300' :
                hasBsWarning ? 'bg-amber-100/80 border-amber-300' :
                'bg-green-100/80 border-green-300'
              }`}>
                <p className={`text-xs font-black ${
                  hasBsDanger ? 'text-red-700' : hasBsWarning ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {hasBsDanger ? '⚠️ 위험 수치가 있어요. 전문의 상담을 권장해요.' :
                   hasBsWarning ? '🔶 주의 수치가 있어요. 관리가 필요해요.' :
                   '✅ 오늘 혈당이 모두 정상이에요!'}
                </p>
              </div>
            )}
          </div>

          <DateNav dateKey={bsDateKey} isToday={bsIsToday}
            onPrev={() => setBsOffset((p) => p - 1)}
            onNext={() => setBsOffset((p) => Math.min(p + 1, 0))}
          />

          <div className="px-4 pt-3 space-y-2.5">
            {MEASUREMENTS.map((m) => {
              const raw      = bsInputs[m.id]
              const val      = raw ? parseInt(raw) : null
              const status   = val && val > 0 ? getBSStatus(val, m.isFasting) : null
              const foodKey  = `food_${m.id}`
              const foodVal  = bsInputs[foodKey] ?? ''
              const photoKey = `photo_${m.id}`
              const photoSrc = bsPhotos[photoKey]
              const isExpanded = expandedFood === m.id

              return (
                <div key={m.id} className={`bg-white rounded-3xl border-2 shadow-cute overflow-hidden transition-colors ${
                  status ? status.bg : 'border-lemon-100'
                }`}>
                  {/* 혈당 수치 행 */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <p className="font-black text-sm text-gray-800">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <input type="number" inputMode="numeric"
                          value={bsInputs[m.id] ?? ''}
                          onChange={(e) => setBsInputs((prev) => ({ ...prev, [m.id]: e.target.value }))}
                          placeholder="---" min={40} max={400}
                          className="w-16 text-right border-2 border-lemon-200 rounded-xl px-2 py-1.5 text-sm font-black text-gray-800 focus:border-lemon-400 focus:outline-none"
                        />
                        <span className="text-xs text-gray-500 font-bold">mg/dL</span>
                      </div>
                    </div>
                  </div>

                  {/* 식사 기록 (아침·점심·저녁 식후만) */}
                  {m.hasFoodLog && (
                    <div className="border-t border-gray-100">
                      {/* 토글 버튼 */}
                      <button
                        onClick={() => setExpandedFood(isExpanded ? null : m.id)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                          isExpanded ? 'bg-lemon-50 text-gray-700' : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        <span>🍽️</span>
                        <span>
                          {m.id === 'afterBreakfast' ? '아침 식사 기록' :
                           m.id === 'afterLunch'     ? '점심 식사 기록' : '저녁 식사 기록'}
                        </span>
                        {/* 입력 내용 요약 */}
                        {(foodVal || photoSrc) && !isExpanded && (
                          <span className="ml-auto flex items-center gap-1 text-gray-500">
                            {photoSrc && <span>📷</span>}
                            {foodVal && <span className="truncate max-w-[100px]">{foodVal}</span>}
                          </span>
                        )}
                        <span className={`ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                      </button>

                      {/* 펼쳐진 식사 기록 영역 */}
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-lemon-50 space-y-3">
                          {/* 텍스트 입력 */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1.5">
                              {m.id === 'afterBreakfast' ? '아침에 뭘 드셨나요?' :
                               m.id === 'afterLunch'     ? '점심에 뭘 드셨나요?' : '저녁에 뭘 드셨나요?'}
                            </p>
                            <textarea
                              value={foodVal}
                              onChange={(e) => setBsInputs((prev) => ({ ...prev, [foodKey]: e.target.value }))}
                              placeholder="예: 잡곡밥, 된장찌개, 계란말이"
                              rows={2}
                              className="w-full border-2 border-lemon-200 rounded-2xl px-3 py-2 text-sm text-gray-700 focus:border-lemon-400 focus:outline-none resize-none bg-white"
                            />
                            {/* 빠른 태그 */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['잡곡밥', '현미밥', '빵', '면류', '샐러드', '단백질 위주', '과식 없음'].map((tag) => (
                                <button key={tag}
                                  onClick={() => {
                                    const cur = bsInputs[foodKey] ?? ''
                                    setBsInputs((prev) => ({ ...prev, [foodKey]: cur ? `${cur}, ${tag}` : tag }))
                                  }}
                                  className="text-xs bg-white border border-lemon-200 text-gray-600 px-2 py-1 rounded-full font-medium active:bg-lemon-100"
                                >{tag}</button>
                              ))}
                            </div>
                          </div>

                          {/* 사진 영역 */}
                          {photoSrc ? (
                            <PhotoThumb src={photoSrc} onDelete={() =>
                              setBsPhotos((prev) => { const n = { ...prev }; delete n[photoKey]; return n })
                            } />
                          ) : (
                            <button
                              onClick={() => openPhotoCapture(`bs_${photoKey}`)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-lemon-300 rounded-2xl text-xs font-bold text-gray-500 bg-white active:bg-lemon-50"
                            >
                              <span>📷</span> 식사 사진 찍기
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* 메모 */}
            <div className="bg-white rounded-3xl p-4 border-2 border-lemon-100 shadow-cute">
              <p className="font-black text-sm text-gray-700 mb-2">📝 오늘 메모</p>
              <textarea
                value={bsInputs.memo ?? ''}
                onChange={(e) => setBsInputs((prev) => ({ ...prev, memo: e.target.value }))}
                placeholder="오늘 컨디션, 운동 여부, 특이 사항 등을 적어보세요"
                rows={3}
                className="w-full border-2 border-lemon-200 rounded-2xl px-3 py-2.5 text-sm text-gray-700 focus:border-lemon-400 focus:outline-none resize-none"
              />
            </div>

            <button onClick={saveBs}
              className={`w-full font-black py-3.5 rounded-2xl text-sm shadow-cute active:scale-95 transition-all ${
                bsSaved ? 'bg-green-400 text-white' : 'bg-gradient-to-r from-red-400 to-orange-400 text-white'
              }`}>
              {bsSaved ? '✅ 저장 완료!' : '💾 오늘 혈당 저장하기'}
            </button>
          </div>

          {/* 최근 7일 혈당 */}
          <div className="px-4 mt-5 pb-4">
            <h3 className="font-black text-gray-800 mb-3">📊 최근 7일 혈당 기록</h3>
            {Object.keys(bsHistory).length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border-2 border-lemon-100">
                <p className="text-4xl">📋</p>
                <p className="text-gray-500 text-sm font-bold mt-2">아직 기록이 없어요</p>
                <p className="text-gray-500 text-xs mt-1">매일 기록하면 여기에 쌓여요!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(bsHistory).sort(([a], [b]) => b.localeCompare(a)).map(([date, entry]) => {
                  const fasting = entry.fasting
                  const status  = fasting ? getBSStatus(fasting, true) : null
                  const count   = MEASUREMENTS.filter((m) => (entry as Record<string, unknown>)[m.id] !== undefined).length
                  const foods   = [
                    entry.foodBreakfast && `아침: ${entry.foodBreakfast}`,
                    entry.foodLunch     && `점심: ${entry.foodLunch}`,
                    entry.foodDinner    && `저녁: ${entry.foodDinner}`,
                  ].filter(Boolean)
                  const hasPhotos = entry.photoBreakfast || entry.photoLunch || entry.photoDinner

                  return (
                    <div key={date} className={`bg-white rounded-2xl px-4 py-3 border-2 shadow-cute ${
                      status ? status.bg : 'border-lemon-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-black text-sm text-gray-700">{formatDate(date)}</p>
                          <p className="text-xs text-gray-500">{count}개 항목{hasPhotos ? ' · 📷 사진' : ''}</p>
                          {foods.length > 0 && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">🍽️ {foods.join(' · ')}</p>}
                          {entry.memo && <p className="text-xs text-gray-500 truncate mt-0.5">📝 {entry.memo}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {fasting ? (
                            <>
                              <p className={`font-black text-xl ${status?.color}`}>{fasting}</p>
                              <p className="text-xs text-gray-500">공복 mg/dL</p>
                              {status && <span className={`text-xs font-black ${status.color}`}>{status.label}</span>}
                            </>
                          ) : <p className="text-gray-300 text-xs">공복 미기록</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-3 bg-orange-50 rounded-3xl p-4 border-2 border-orange-200">
              <h4 className="font-black text-orange-800 text-sm mb-2">💡 혈당 관리 핵심 팁</h4>
              {['채소 먼저, 단백질, 탄수화물 순으로 드세요',
                '식후 10분 걷기가 혈당 스파이크를 30% 낮춰요',
                '잠을 잘 자면 혈당 조절이 훨씬 쉬워져요'].map((tip, i) => (
                <p key={i} className="text-xs text-orange-700 mb-1 flex items-start gap-1.5">
                  <span className="font-black flex-shrink-0">{i + 1}.</span> {tip}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══ 체중 & 다이어트 탭 ═══════════════════════════════ */}
      {activeTab === 'weight' && (
        <>
          <div className="bg-gradient-to-r from-lemon-400 to-lemon-300 px-4 py-4 relative overflow-hidden">
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 font-black text-lg">⚖️ 체중 &amp; 다이어트</h2>
                <p className="text-black/60 text-xs mt-0.5">매일 기록하면 변화가 보여요</p>
              </div>
              <button onClick={() => setShowSetup(true)} className="bg-white/60 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-black/60 font-medium">키 · 목표 체중</p>
                <p className="font-black text-gray-900 text-sm">{userHeight ? `${userHeight}cm` : '설정하기'}</p>
              </button>
            </div>
            {(latestWeight || targetNum > 0) && (
              <div className="flex gap-2 mt-3">
                {latestWeight && (
                  <div className="flex-1 bg-white/50 rounded-xl p-2 text-center">
                    <p className="text-xs text-black/50 font-medium">현재 체중</p>
                    <p className="font-black text-gray-900 text-xl">{latestWeight}<span className="text-xs">kg</span></p>
                  </div>
                )}
                {targetNum > 0 && latestWeight && (
                  <div className="flex-1 bg-white/50 rounded-xl p-2 text-center">
                    <p className="text-xs text-black/50 font-medium">목표까지</p>
                    <p className={`font-black text-xl ${latestWeight <= targetNum ? 'text-green-700' : 'text-gray-900'}`}>
                      {latestWeight <= targetNum ? '달성!' : `${(latestWeight - targetNum).toFixed(1)}kg`}
                    </p>
                  </div>
                )}
                {firstWeight && latestWeight && firstWeight !== latestWeight && (
                  <div className="flex-1 bg-white/50 rounded-xl p-2 text-center">
                    <p className="text-xs text-black/50 font-medium">7일 변화</p>
                    <p className={`font-black text-xl ${latestWeight < firstWeight ? 'text-green-700' : 'text-red-600'}`}>
                      {latestWeight < firstWeight ? '-' : '+'}{Math.abs(latestWeight - firstWeight).toFixed(1)}kg
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DateNav dateKey={wDateKey} isToday={wIsToday}
            onPrev={() => setWOffset((p) => p - 1)}
            onNext={() => setWOffset((p) => Math.min(p + 1, 0))}
          />

          <div className="px-4 pt-3 space-y-3 pb-4">
            {/* 오늘 체중 */}
            <div className="bg-white rounded-3xl p-4 border-2 border-lemon-100 shadow-cute">
              <p className="font-black text-gray-800 text-sm mb-3">⚖️ 오늘의 체중</p>
              {/* 수정: min-w-0 추가하여 overflow 방지 */}
              <div className="flex items-center gap-2">
                <input type="number" inputMode="decimal" step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="00.0"
                  className="min-w-0 flex-1 text-center text-3xl font-black text-gray-900 border-2 border-lemon-200 rounded-2xl py-3 focus:border-lemon-400 focus:outline-none"
                />
                <span className="flex-shrink-0 text-gray-500 font-black text-lg">kg</span>
              </div>
              {bmi && bmiStatus && (
                <div className={`mt-3 rounded-2xl px-4 py-2.5 border-2 ${bmiStatus.bg} flex items-center justify-between`}>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">BMI</p>
                    <p className={`font-black text-xl ${bmiStatus.color}`}>{bmi}</p>
                  </div>
                  <span className={`font-black text-sm px-3 py-1 rounded-full border ${bmiStatus.bg} ${bmiStatus.color}`}>{bmiStatus.label}</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">정상 범위</p>
                    <p className="text-xs font-bold text-gray-600">18.5 ~ 23</p>
                  </div>
                </div>
              )}
              {!userHeight && (
                <button onClick={() => setShowSetup(true)} className="mt-2 w-full text-xs text-center text-gray-500 font-medium">
                  키를 입력하면 BMI를 자동 계산해요 →
                </button>
              )}
            </div>

            {/* 식사 관리 (식사 내용 + 사진 포함) */}
            <div className="bg-white rounded-3xl p-4 border-2 border-lemon-100 shadow-cute">
              <p className="font-black text-gray-800 text-sm mb-3">🍽️ 오늘 식사 관리</p>
              {[
                { key: 'breakfast', label: '아침', emoji: '🌅', placeholder: '예: 잡곡밥, 된장찌개, 계란' },
                { key: 'lunch',     label: '점심', emoji: '☀️', placeholder: '예: 비빔밥, 미역국, 두부' },
                { key: 'dinner',    label: '저녁', emoji: '🌙', placeholder: '예: 삼겹살, 쌈채소, 된장찌개' },
              ].map((meal) => (
                <div key={meal.key} className="mb-4 last:mb-0 border-b last:border-b-0 border-gray-100 pb-4 last:pb-0">
                  <p className="text-xs font-bold text-gray-600 mb-2">{meal.emoji} {meal.label}</p>

                  {/* 품질 선택 */}
                  <div className="flex gap-2 mb-2">
                    {MEAL_OPTIONS.map((opt) => (
                      <button key={opt.value}
                        onClick={() => setMeals((prev) => ({ ...prev, [meal.key]: opt.value }))}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all text-xs font-bold ${
                          meals[meal.key] === opt.value ? opt.color : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* 식사 내용 텍스트 */}
                  <input
                    type="text"
                    value={mealFoods[meal.key] ?? ''}
                    onChange={(e) => setMealFoods((prev) => ({ ...prev, [meal.key]: e.target.value }))}
                    placeholder={meal.placeholder}
                    className="w-full border-2 border-lemon-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:border-lemon-400 focus:outline-none mb-2"
                  />

                  {/* 식사 사진 */}
                  {mealPhotos[meal.key] ? (
                    <PhotoThumb src={mealPhotos[meal.key]}
                      onDelete={() => setMealPhotos((prev) => { const n = { ...prev }; delete n[meal.key]; return n })}
                    />
                  ) : (
                    <button
                      onClick={() => openPhotoCapture(`w_${meal.key}`)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-lemon-300 rounded-xl text-xs font-bold text-gray-500 active:bg-lemon-50"
                    >
                      <span>📷</span> {meal.label} 사진 찍기
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 메모 */}
            <div className="bg-white rounded-3xl p-4 border-2 border-lemon-100 shadow-cute">
              <p className="font-black text-sm text-gray-700 mb-2">📝 오늘 메모</p>
              <textarea value={weightNote} onChange={(e) => setWeightNote(e.target.value)}
                placeholder="오늘 운동, 컨디션, 특이 사항을 기록해보세요" rows={3}
                className="w-full border-2 border-lemon-200 rounded-2xl px-3 py-2.5 text-sm text-gray-700 focus:border-lemon-400 focus:outline-none resize-none"
              />
            </div>

            <button onClick={saveWeight}
              className={`w-full font-black py-3.5 rounded-2xl text-sm shadow-cute active:scale-95 transition-all ${
                wSaved ? 'bg-green-400 text-white' : 'bg-lemon-400 text-gray-900'
              }`}>
              {wSaved ? '✅ 저장 완료!' : '💾 오늘 체중 & 식사 저장하기'}
            </button>

            {/* 7일 기록 */}
            <div>
              <h3 className="font-black text-gray-800 mb-3">📊 최근 7일 체중 기록</h3>
              {Object.keys(wHistory).length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border-2 border-lemon-100">
                  <p className="text-4xl">⚖️</p>
                  <p className="text-gray-500 text-sm font-bold mt-2">아직 기록이 없어요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(wHistory).sort(([a], [b]) => b.localeCompare(a)).map(([date, entry]) => {
                    const moodRow = [
                      entry.mealBreakfast && MEAL_OPTIONS.find(o => o.value === entry.mealBreakfast)?.emoji,
                      entry.mealLunch     && MEAL_OPTIONS.find(o => o.value === entry.mealLunch)?.emoji,
                      entry.mealDinner    && MEAL_OPTIONS.find(o => o.value === entry.mealDinner)?.emoji,
                    ].filter(Boolean)
                    const hasPhotos = entry.photoBreakfast || entry.photoLunch || entry.photoDinner
                    return (
                      <div key={date} className="bg-white rounded-2xl px-4 py-3 border-2 border-lemon-100 shadow-cute flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm text-gray-700">{formatDate(date)}</p>
                          {moodRow.length > 0 && <p className="text-sm mt-0.5">{moodRow.join(' ')}{hasPhotos ? ' 📷' : ''}</p>}
                          {entry.note && <p className="text-xs text-gray-500 truncate max-w-[160px] mt-0.5">📝 {entry.note}</p>}
                        </div>
                        <div className="text-right">
                          {entry.weight
                            ? <p className="font-black text-xl text-gray-800">{entry.weight}<span className="text-sm">kg</span></p>
                            : <p className="text-gray-300 text-xs">미기록</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-lemon-50 rounded-3xl p-4 border-2 border-lemon-200">
              <h4 className="font-black text-gray-800 text-sm mb-2">💡 건강한 체중 관리 팁</h4>
              {['아침 공복 체중을 기록하면 가장 정확해요',
                '하루 500kcal 줄이면 1주일에 0.5kg 감량 가능해요',
                '근육량 유지를 위해 단백질 섭취를 충분히 해요',
                '체중보다 허리둘레와 컨디션 변화에 집중해요'].map((tip, i) => (
                <p key={i} className="text-xs text-gray-700 mb-1 flex items-start gap-1.5">
                  <span className="font-black text-lemon-700 flex-shrink-0">{i + 1}.</span> {tip}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 설정 모달 */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end max-w-[480px] mx-auto">
          <div className="bg-white rounded-t-3xl w-full p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-800">내 정보 설정</h3>
              <button onClick={() => setShowSetup(false)} className="text-gray-500 font-bold text-xl">×</button>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">키 (cm)</label>
                <input type="number" inputMode="numeric" value={userHeight} onChange={(e) => setUserHeight(e.target.value)}
                  placeholder="예: 165"
                  className="w-full border-2 border-lemon-200 rounded-xl px-4 py-3 text-base font-black text-gray-800 focus:border-lemon-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">목표 체중 (kg)</label>
                <input type="number" inputMode="decimal" step="0.1" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="예: 60.0"
                  className="w-full border-2 border-lemon-200 rounded-xl px-4 py-3 text-base font-black text-gray-800 focus:border-lemon-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSetup(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold">취소</button>
              <button onClick={saveSetup} className="flex-[2] py-3 rounded-xl bg-lemon-400 text-gray-900 font-black">저장하기</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
