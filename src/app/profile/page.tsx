'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

const LEVELS = [
  { name: '🌱 씨앗',  min: 0,   max: 100 },
  { name: '🌿 새싹',  min: 100, max: 300 },
  { name: '💪 건강인', min: 300, max: 700 },
  { name: '👑 건강왕', min: 700, max: 99999 },
]

function getLevelInfo(points: number) {
  return LEVELS.find((l) => points >= l.min && points < l.max) ?? LEVELS[LEVELS.length - 1]
}

const AVATARS = ['🙋', '🏃', '💪', '🧘', '🌟', '🎯', '🦁', '🐯', '🌈', '🍋', '🐣', '🌸']

export default function ProfilePage() {
  const { user, loading, logout, nickname } = useAuth()
  const [points, setPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState('🙋')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // 알림 설정
  const [notifGranted, setNotifGranted] = useState(false)
  const [morningTime, setMorningTime] = useState('07:00')
  const [bloodSugarTime, setBloodSugarTime] = useState('08:00')
  const [waterNotif, setWaterNotif] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  useEffect(() => {
    const p = parseInt(localStorage.getItem('routinefit_points') ?? '0')
    const s = parseInt(localStorage.getItem('streak_count') ?? '0')
    const avatar = localStorage.getItem('user_avatar') ?? '🙋'
    setPoints(p)
    setStreak(s)
    setSelectedAvatar(avatar)
    setMorningTime(localStorage.getItem('notif_morning_time') ?? '07:00')
    setBloodSugarTime(localStorage.getItem('notif_bloodsugar_time') ?? '08:00')
    setWaterNotif(localStorage.getItem('notif_water') === 'true')

    // 알림 권한 확인
    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted')
    }

    // 전체 완료 루틴 수
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('routines_')) {
        const val = JSON.parse(localStorage.getItem(key) ?? '[]')
        total += val.length
      }
    }
    setCompletedCount(total)

  }, [])

  const saveAvatar = (av: string) => {
    setSelectedAvatar(av)
    localStorage.setItem('user_avatar', av)
    setShowAvatarPicker(false)
  }

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않아요')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifGranted(true)
      alert('✅ 알림이 허용됐어요!')
    } else {
      alert('알림 권한을 허용해주세요!\n브라우저 주소창 왼쪽 자물쇠 아이콘을 눌러 허용해주세요.')
    }
  }

  const scheduleNotif = (title: string, body: string, time: string) => {
    const [h, m] = time.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    setTimeout(() => {
      new Notification(title, { body, icon: '/favicon.ico' })
    }, target.getTime() - now.getTime())
  }

  const saveNotifSettings = () => {
    localStorage.setItem('notif_morning_time', morningTime)
    localStorage.setItem('notif_bloodsugar_time', bloodSugarTime)
    localStorage.setItem('notif_water', String(waterNotif))

    if (notifGranted) {
      scheduleNotif('루틴핏 🌅', '좋은 아침! 오늘 루틴 시작할 시간이에요 💪', morningTime)
      scheduleNotif('루틴핏 🩸', '아침 공복 혈당 측정 시간이에요!', bloodSugarTime)
      if (waterNotif) {
        setInterval(() => {
          new Notification('루틴핏 💧', { body: '물 한잔 마실 시간이에요! 건강을 지켜요 😊', icon: '/favicon.ico' })
        }, 2 * 60 * 60 * 1000)
      }
    }

    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2000)
  }

  const levelInfo = getLevelInfo(points)
  const levelPct = levelInfo.max === 99999
    ? 100
    : Math.min(((points - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100, 100)

  const displayName = nickname ?? user?.email?.split('@')[0] ?? '게스트'

  if (loading) {
    return (
      <div className="min-h-screen bg-lemon-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl animate-bounce-in">🍋</p>
          <p className="text-gray-500 text-sm mt-2">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lemon-50 to-lemon-100 pb-28">
      <Header title="내 프로필" />

      {/* 프로필 배너 */}
      <div className="bg-gradient-to-br from-lemon-400 to-amber-300 px-4 pt-6 pb-10 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-20 h-20 bg-white/30 rounded-3xl flex items-center justify-center text-5xl shadow-cute border-4 border-white/50 active:scale-95"
            >
              {selectedAvatar}
            </button>
            <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full px-1 border border-lemon-200">✏️</span>
          </div>
          <div>
            <h2 className="text-yellow-900 font-black text-xl">{displayName}</h2>
            {user?.email && <p className="text-yellow-800 text-xs mt-0.5">{user.email}</p>}
            {!isSupabaseConfigured && <p className="text-yellow-700 text-xs mt-0.5">🔓 로컬 모드</p>}
            <div className="mt-1.5 bg-white/30 rounded-full px-3 py-1 inline-block">
              <span className="text-yellow-900 font-black text-sm">{levelInfo.name}</span>
            </div>
          </div>
        </div>

        {/* 아바타 선택 팝업 */}
        {showAvatarPicker && (
          <div className="relative mt-3 bg-white rounded-2xl p-3 border-2 border-lemon-200 animate-bounce-in">
            <p className="text-xs font-black text-gray-700 mb-2">아바타 선택</p>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => saveAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-lemon-200 border-2 border-lemon-400 scale-110'
                      : 'bg-gray-50 hover:bg-lemon-50'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="px-4 -mt-5">
        <div className="bg-white rounded-3xl p-4 shadow-cute-lg border-2 border-lemon-100">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: '연속 달성', value: `${streak}일`, emoji: '🔥' },
              { label: '루핏 포인트', value: `${points.toLocaleString()}P`, emoji: '⭐' },
              { label: '완료 루틴', value: `${completedCount}개`, emoji: '✅' },
            ].map((s) => (
              <div key={s.label} className="text-center bg-lemon-50 rounded-2xl p-2.5 border border-lemon-100">
                <p className="text-xl">{s.emoji}</p>
                <p className="font-black text-gray-800 text-sm mt-0.5">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          {/* 레벨 진행바 */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="font-bold">{levelInfo.name}</span>
              <span>{points} / {levelInfo.max === 99999 ? '∞' : levelInfo.max}P</span>
            </div>
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-lemon-400 to-amber-400 transition-all duration-700"
                style={{ width: `${Math.max(levelPct, 3)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 포인트샵 배너 */}
      <div className="px-4 mt-3">
        <Link href="/point-shop" className="block bg-gradient-to-r from-amber-400 to-lemon-400 rounded-3xl p-4 shadow-cute active:scale-95 transition-all relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-black/50 text-xs font-bold mb-0.5">내 포인트</p>
              <p className="text-3xl font-black text-gray-900 leading-none">{points.toLocaleString()}<span className="text-base ml-0.5">P</span></p>
              <p className="text-black/60 text-xs mt-1.5">포인트 모아서 제휴 쿠폰으로 교환해요</p>
            </div>
            <div className="text-right">
              <p className="text-3xl">🎁</p>
              <div className="mt-1 bg-gray-900 text-lemon-400 font-black text-xs px-2.5 py-1 rounded-full">
                포인트샵 →
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 알림 설정 */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-3xl p-4 shadow-cute border-2 border-lemon-100">
          <h3 className="font-black text-gray-800 mb-3">🔔 알림 설정</h3>

          {!notifGranted ? (
            <div>
              <p className="text-xs text-gray-500 mb-3">
                알림을 켜면 아침 루틴, 혈당 측정, 물 마시기를 잊지 않아요!
              </p>
              <button
                onClick={enableNotifications}
                className="w-full bg-gradient-to-r from-lemon-400 to-amber-300 text-yellow-900 font-black py-3 rounded-2xl text-sm shadow-lemon active:scale-95"
              >
                🔔 알림 허용하기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 아침 루틴 알림 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-700">🌅 아침 루틴 알림</p>
                  <p className="text-xs text-gray-500">매일 설정 시간에 알림</p>
                </div>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="border-2 border-lemon-200 rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:border-lemon-400 focus:outline-none"
                />
              </div>

              {/* 혈당 측정 알림 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-700">🩸 혈당 측정 알림</p>
                  <p className="text-xs text-gray-500">아침 공복 혈당 측정 알림</p>
                </div>
                <input
                  type="time"
                  value={bloodSugarTime}
                  onChange={(e) => setBloodSugarTime(e.target.value)}
                  className="border-2 border-lemon-200 rounded-xl px-2 py-1.5 text-sm font-bold text-gray-700 focus:border-lemon-400 focus:outline-none"
                />
              </div>

              {/* 물 마시기 알림 토글 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-700">💧 물 마시기 알림</p>
                  <p className="text-xs text-gray-500">2시간마다 알림</p>
                </div>
                <button
                  onClick={() => setWaterNotif(!waterNotif)}
                  className={`relative w-12 h-6 rounded-full transition-all ${waterNotif ? 'bg-lemon-400' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${waterNotif ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <button
                onClick={saveNotifSettings}
                className={`w-full font-black py-2.5 rounded-2xl text-sm active:scale-95 transition-all ${
                  notifSaved
                    ? 'bg-green-400 text-white'
                    : 'bg-gradient-to-r from-lemon-400 to-amber-300 text-yellow-900 shadow-lemon'
                }`}
              >
                {notifSaved ? '✅ 저장됐어요!' : '💾 알림 설정 저장'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                ⚠️ 앱(브라우저 탭)이 열려있을 때만 알림이 와요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-3xl shadow-cute border-2 border-lemon-100 overflow-hidden">
          {[
            { href: '/point-shop',   emoji: '🎁', label: '포인트샵' },
            { href: '/my-challenge', emoji: '🎯', label: '나만의 챌린지' },
            { href: '/community',    emoji: '👥', label: '커뮤니티' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 hover:bg-lemon-50 active:bg-lemon-100 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-bold text-gray-700">{item.label}</span>
              <span className="ml-auto text-gray-300">→</span>
            </Link>
          ))}

          {isSupabaseConfigured && user ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="text-sm font-bold">로그아웃</span>
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-4 py-4 hover:bg-lemon-50 transition-colors"
            >
              <span className="text-xl">🔑</span>
              <span className="text-sm font-bold text-gray-700">로그인 / 회원가입</span>
              <span className="ml-auto text-gray-300">→</span>
            </Link>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
