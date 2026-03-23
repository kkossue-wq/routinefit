'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { communityPosts as mockPosts } from '@/lib/data'
import { supabase, isSupabaseConfigured, formatTime } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const filters = [
  { id: 'all', label: '전체', emoji: '✨' },
  { id: '운동', label: '운동', emoji: '💪' },
  { id: '식단', label: '식단', emoji: '🥗' },
  { id: '루틴', label: '루틴', emoji: '📋' },
]

const postTypeOptions = [
  { value: '운동', label: '💪 운동 완료', placeholder: '오늘 어떤 운동을 했나요? 💪' },
  { value: '식단', label: '🥗 식단 인증', placeholder: '건강한 식사를 공유해주세요! 🥗' },
  { value: '루틴', label: '📋 루틴 완료', placeholder: '오늘 완료한 루틴을 공유해요! 📋' },
]

interface Post {
  id: string
  user: string
  avatar: string
  text: string
  type: string
  likes: number
  time: string
  image?: string
}

export default function CommunityPage() {
  const { user, nickname } = useAuth()
  const [activeFilter, setActiveFilter] = useState('all')
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [liked, setLiked] = useState<string[]>([])
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [fetchLoading, setFetchLoading] = useState(false)

  // 글쓰기 폼
  const [postType, setPostType] = useState('운동')
  const [postText, setPostText] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)

  // ── Supabase에서 게시글 불러오기 ──────────────────────────
  const fetchPosts = useCallback(async () => {
    if (!isSupabaseConfigured) return

    setFetchLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname, avatar_emoji)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setPosts(
        data.map((p) => ({
          id: p.id,
          user: p.profiles?.nickname ?? '익명',
          avatar: p.profiles?.avatar_emoji ?? '🌿',
          text: p.text,
          type: p.type,
          likes: p.likes_count,
          time: formatTime(p.created_at),
          image: p.image_url ?? undefined,
        }))
      )
    }
    setFetchLoading(false)
  }, [])

  // 내가 좋아요 누른 게시글 불러오기
  const fetchMyLikes = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return
    const { data } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
    if (data) setLiked(data.map((l) => l.post_id))
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    fetchMyLikes()
  }, [fetchMyLikes])

  // ── 사진 선택 ─────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('사진 크기는 5MB 이하만 가능해요!')
      return
    }
    selectedFileRef.current = file
    const reader = new FileReader()
    reader.onload = (ev) => setSelectedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    selectedFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── 글쓰기 버튼 클릭 ──────────────────────────────────────
  const handleWriteClick = () => {
    if (!user) {
      alert('루틴 인증은 로그인 후 가능해요! 로그인 페이지로 이동합니다.')
      window.location.href = '/auth/login'
      return
    }
    setShowWriteModal(true)
  }

  // ── 게시글 등록 ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!postText.trim()) { alert('내용을 입력해주세요!'); return }
    if (!user) { alert('로그인이 필요해요!'); return }

    setIsSubmitting(true)

    // 1. 사진 Storage 업로드 (있을 경우)
    let imageUrl: string | null = null
    if (selectedFileRef.current) {
      const file = selectedFileRef.current
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    }

    // 2. DB에 게시글 저장
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      text: postText.trim(),
      type: postType,
      image_url: imageUrl,
    })

    if (error) {
      alert('글 등록에 실패했어요. 다시 시도해주세요.')
    } else {
      // 로컬 상태 즉시 반영 (새로고침 없이 피드에 바로 보임)
      const newPost: Post = {
        id: Date.now().toString(),
        user: nickname ?? user.email?.split('@')[0] ?? '나',
        avatar: '🌿',
        text: postText.trim(),
        type: postType,
        likes: 0,
        time: '방금 전',
        image: selectedImage ?? undefined,
      }
      setPosts((prev) => [newPost, ...prev])
      setPostText('')
      removeImage()
      setShowWriteModal(false)
    }

    setIsSubmitting(false)
  }

  // ── 좋아요 ────────────────────────────────────────────────
  const toggleLike = async (postId: string) => {
    if (!isSupabaseConfigured) {
      setLiked((prev) =>
        prev.includes(postId) ? prev.filter((l) => l !== postId) : [...prev, postId]
      )
      return
    }
    if (!user) { alert('좋아요는 로그인 후 가능해요!'); return }

    const isLiked = liked.includes(postId)
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    if (isLiked) {
      await supabase.from('post_likes').delete()
        .eq('post_id', postId).eq('user_id', user.id)
      await supabase.from('posts').update({ likes_count: Math.max(0, post.likes - 1) })
        .eq('id', postId)
      setLiked((prev) => prev.filter((l) => l !== postId))
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      await supabase.from('posts').update({ likes_count: post.likes + 1 }).eq('id', postId)
      setLiked((prev) => [...prev, postId])
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    }
  }

  const filteredPosts =
    activeFilter === 'all' ? posts : posts.filter((p) => p.type === activeFilter)

  const currentPlaceholder = postTypeOptions.find((o) => o.value === postType)?.placeholder ?? ''

  return (
    <div className="min-h-screen bg-lemon-50 pb-24">
      <Header title="루틴 커뮤니티" />

      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-4 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="relative">
          <h2 className="text-white font-bold text-lg">👥 오늘의 루틴 인증</h2>
          <p className="text-white/80 text-xs mt-1">서로의 건강 루틴을 응원해요!</p>
          <div className="mt-3 flex gap-3">
            {[
              { label: '오늘 인증', value: `${posts.length}명` },
              { label: '이번 주', value: '312명' },
              { label: '전체 회원', value: '1,204명' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/30 rounded-xl px-3 py-1.5 text-center">
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-white/80 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="px-4 py-3">
        <button
          onClick={handleWriteClick}
          className="w-full bg-white border-2 border-dashed border-yellow-400 rounded-2xl px-4 py-3 flex items-center gap-3 text-left hover:bg-lemon-50 transition-colors active:scale-[0.98]"
        >
          <span className="text-2xl">📸</span>
          <div>
            <p className="text-gray-600 text-sm font-medium">오늘의 루틴을 인증해보세요!</p>
            <p className="text-yellow-600 text-xs">
              {user ? `${nickname ?? '나'}님, 오늘 루틴 완료했나요? 📷` : '로그인 후 사진 + 글 작성 가능'}
            </p>
          </div>
          <span className="ml-auto text-yellow-400 text-lg">→</span>
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeFilter === filter.id
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {fetchLoading && (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">불러오는 중...</div>
      )}

      {/* 피드 */}
      {!fetchLoading && (
        <div className="px-4 space-y-3 pb-4">
          {filteredPosts.map((post) => {
            const isLiked = liked.includes(post.id)
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-lemon-100 overflow-hidden"
              >
                <div className="p-4 pb-2">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-lemon-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-800">{post.user}</span>
                        <span className="text-xs text-gray-500">{post.time}</span>
                      </div>
                      <span className="text-xs bg-lemon-100 text-yellow-700 font-medium px-2 py-0.5 rounded-full">
                        {post.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
                </div>

                {post.image && (
                  <div className="px-4 pb-3">
                    <img
                      src={post.image}
                      alt="루틴 인증 사진"
                      className="w-full rounded-xl object-cover max-h-64"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-all ${
                      isLiked ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>💬</span>
                    <span>응원</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
                    <span>📤</span>
                    <span>공유</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 max-w-[480px] mx-auto"
          onClick={(e) => e.target === e.currentTarget && setShowWriteModal(false)}
        >
          <div className="bg-white rounded-t-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">루틴 인증하기 📸</h3>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-gray-500 text-xl w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* 작성자 표시 */}
              <div className="flex items-center gap-2 bg-lemon-50 rounded-xl px-4 py-2.5">
                <span className="text-xl">🌿</span>
                <span className="font-semibold text-sm text-gray-700">
                  {nickname ?? user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-gray-500 ml-auto">로그인됨 ✓</span>
              </div>

              {/* 인증 유형 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">인증 유형</label>
                <div className="flex gap-2">
                  {postTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPostType(option.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        postType === option.value
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">내용</label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={currentPlaceholder}
                  rows={3}
                  maxLength={200}
                  className="w-full border-2 border-lemon-200 rounded-xl px-4 py-2.5 text-sm focus:border-yellow-400 focus:outline-none resize-none"
                />
                <p className="text-right text-xs text-gray-500 mt-1">{postText.length}/200</p>
              </div>

              {/* 사진 업로드 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  사진 첨부 <span className="text-gray-500 font-normal">(선택, 최대 5MB)</span>
                </label>

                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="선택된 사진"
                      className="w-full rounded-xl object-cover max-h-52"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white/90 text-gray-700 text-xs font-semibold rounded-full px-3 py-1"
                    >
                      바꾸기
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-lemon-300 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-500 hover:border-yellow-400 hover:bg-lemon-50 transition-colors"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-medium">사진 선택하기</span>
                    <span className="text-xs">갤러리에서 선택 또는 카메라로 촬영</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* 등록 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !postText.trim()}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-900 font-bold py-3.5 rounded-2xl transition-colors text-sm"
              >
                {isSubmitting ? '등록 중...' : '✅ 루틴 인증 등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
