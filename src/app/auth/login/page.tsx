'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      alert('아직 Supabase 설정이 안됐어요!\n.env.local 파일을 먼저 만들어주세요.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 틀렸어요.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요해요. 받은 메일함을 확인해주세요!')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lemon-50 to-lemon-100 flex flex-col">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-br from-lemon-400 to-amber-300 px-4 pt-14 pb-12 text-center relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="relative">
          <span className="text-6xl animate-float inline-block">🍋</span>
          <h1 className="text-3xl font-black text-yellow-900 mt-3">루틴핏</h1>
          <p className="text-yellow-800 text-sm mt-1.5 font-medium">건강한 하루를 만들어요 ✨</p>
          <div className="flex justify-center gap-4 mt-4">
            {['🔥 스트릭', '💧 물 트래커', '🏆 챌린지'].map((badge) => (
              <span key={badge} className="bg-white/30 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 로그인 폼 */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-cute border-2 border-lemon-200">
          <h2 className="text-lg font-black text-gray-800 mb-5">로그인</h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-sm font-black text-gray-700 mb-1.5 block">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full border-2 border-lemon-200 rounded-2xl px-4 py-3 text-sm focus:border-lemon-400 focus:outline-none transition-colors bg-lemon-50/50"
              />
            </div>
            <div>
              <label className="text-sm font-black text-gray-700 mb-1.5 block">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
                className="w-full border-2 border-lemon-200 rounded-2xl px-4 py-3 text-sm focus:border-lemon-400 focus:outline-none transition-colors bg-lemon-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-lemon-400 to-amber-300 disabled:opacity-60 text-yellow-900 font-black py-3.5 rounded-2xl transition-all mt-4 shadow-lemon active:scale-95 text-sm"
            >
              {loading ? '로그인 중...' : '🚀 로그인'}
            </button>
          </form>

          {/* 소셜 로그인 (Phase 3에서 구현) */}
          <div className="mt-5">
            <div className="relative text-center mb-4">
              <div className="border-t-2 border-lemon-100 absolute top-1/2 w-full" />
              <span className="relative bg-white px-3 text-gray-400 text-xs font-bold">또는</span>
            </div>
            <div className="space-y-2">
              {[
                { emoji: '💬', label: '카카오로 로그인', bg: 'bg-yellow-300 text-yellow-900 border-2 border-yellow-400' },
                { emoji: '🟢', label: '네이버로 로그인', bg: 'bg-green-500 text-white' },
                { emoji: '⚪', label: '구글로 로그인', bg: 'bg-white text-gray-700 border-2 border-gray-200' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => alert('소셜 로그인은 Phase 3에서 추가될 예정이에요! 🚀')}
                  className={`w-full ${btn.bg} font-bold py-3 rounded-2xl text-sm transition-opacity hover:opacity-80 active:scale-95`}
                >
                  {btn.emoji} {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            아직 계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-lemon-600 font-black underline">
              회원가입
            </Link>
          </p>
        </div>

        <div className="text-center mt-3">
          <Link href="/" className="text-gray-400 text-xs underline">
            로그인 없이 건강 정보 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
