import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '루틴핏 — 매일 나에게 하는 작은 약속',
  description: '매일 작은 루틴이 건강한 삶을 만듭니다. 아침 루틴, 건강 뉴스, 혈당 관리까지.',
  keywords: ['건강 루틴', '아침 루틴', '혈당 관리', '스트레칭', '건강 앱'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '루틴핏',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFF87C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
