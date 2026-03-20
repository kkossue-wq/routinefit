'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function SignupPage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      alert('아직 Supabase 설정이 안됐어요!\n.env.local 파일을 먼저 만들어주세요.')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.')
      return
    }

    setLoading(true)
    setError('')

    // 1. Supabase 계정 생성 (닉네임은 user_metadata에 저장)
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    })

    if (signupError) {
      if (signupError.message.includes('already registered')) {
        setError('이미 사용 중인 이메일이에요.')
      } else {
        setError(signupError.message)
      }
      setLoading(false)
      return
    }

    // 2. profiles 테이블에 사용자 정보 저장
    if (data.user) {
      const avatars = ['🌿', '💪', '🌅', '🍎', '🧘', '⚡', '🏃', '🌱']
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)]

      await supabase.from('profiles').insert({
        id: data.user.id,
        nickname,
        avatar_emoji: randomAvatar,
      })
    }

    // 이메일 인증이 필요한 경우 완료 화면 표시
    setDone(true)
    setLoading(false)
  }

  // 가입 완료 화면
  if (done) {
    return (
      <div className="min-h-screen bg-lemon-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-lemon-200 text-center max-w-sm w-full">
          <span className="text-5xl">📧</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4">이메일을 확인해주세요!</h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            <strong>{email}</strong>로 인증 메일을 보냈어요.
            <br />
            메일 속 링크를 클릭하면 가입이 완료됩니다!
          </p>
          <Link
            href="/auth/login"
            className="mt-6 block w-full bg-yellow-400 text-yellow-900 font-bold py-3 rounded-2xl text-center"
          >
            로그인 하러 가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lemon-50 flex flex-col">
      <div className="bg-gradient-to-br from-yellow-400 to-amber-300 px-4 pt-10 pb-8 text-center">
        <span className="text-4xl">🍋</span>
        <h1 className="text-xl font-bold text-yellow-900 mt-2">루틴핏 가입하기</h1>
        <p className="text-yellow-800 text-sm mt-1">건강한 삶을 함께 만들어요</p>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-lemon-200">
          <h2 className="text-lg font-bold text-gray-800 mb-5">회원가입</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                닉네임 <span className="text-gray-400 font-normal">(커뮤니티에 표시될 이름)</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="건강한닉네임"
                required
                maxLength={10}
                className="w-full border-2 border-lemon-200 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full border-2 border-lemon-200 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                비밀번호 <span className="text-gray-400 font-normal">(8자 이상)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
                required
                minLength={8}
                className="w-full border-2 border-lemon-200 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-yellow-900 font-bold py-3.5 rounded-2xl transition-colors mt-2"
            >
              {loading ? '가입 처리 중...' : '회원가입'}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-yellow-600 font-bold">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
