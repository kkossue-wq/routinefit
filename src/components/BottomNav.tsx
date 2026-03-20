'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',            label: '홈',   emoji: '🏠' },
  { href: '/blood-sugar', label: '혈당', emoji: '🩸' },
  { href: '/news',        label: '건강', emoji: '🌿' },
  { href: '/community',   label: '공유', emoji: '📸' },
  { href: '/profile',     label: '내정보', emoji: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 max-w-[480px] mx-auto">
      <div className="flex justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              <span className={`text-lg transition-all ${isActive ? 'scale-110' : ''}`}>
                {item.emoji}
              </span>
              <span className={`text-xs transition-all ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-lemon-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
