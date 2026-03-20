'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const { user, loading, logout, nickname } = useAuth()
  const router = useRouter()

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => router.back()} className="text-gray-500 mr-1 font-bold">
            ←
          </button>
        )}
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-lemon-400 rounded-lg flex items-center justify-center">
            <span className="text-xs font-black text-gray-900">R</span>
          </div>
          <div>
            <span className="font-black text-gray-900">{title || '루틴핏'}</span>
            {!title && (
              <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">매일 나에게 하는 작은 약속</p>
            )}
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {!isSupabaseConfigured && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            로컬
          </span>
        )}

        {loading ? (
          <div className="w-14 h-6 bg-gray-100 rounded-full animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">
              {nickname || user.email?.split('@')[0]}
            </span>
            <button
              onClick={async () => { await logout(); router.push('/') }}
              className="text-gray-500 text-xs hover:text-gray-600"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="bg-lemon-400 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
