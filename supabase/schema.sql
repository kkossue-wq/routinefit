-- =============================================
-- 루틴핏 Supabase DB 스키마
-- Supabase 대시보드 > SQL Editor에 붙여넣고 실행하세요
-- =============================================

-- 1. 사용자 프로필 테이블
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null,
  avatar_emoji text default '🌿',
  created_at timestamp with time zone default now()
);

-- 2. 커뮤니티 게시글 테이블
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  type text not null check (type in ('운동', '식단', '루틴')),
  image_url text,
  likes_count int default 0,
  created_at timestamp with time zone default now()
);

-- 3. 좋아요 테이블
create table if not exists post_likes (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- =============================================
-- 보안 정책 (RLS - Row Level Security)
-- =============================================

alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;

-- profiles: 누구나 읽기 가능, 본인만 수정
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- posts: 누구나 읽기 가능, 로그인 유저만 작성, 본인만 삭제
create policy "posts_select" on posts for select using (true);
create policy "posts_insert" on posts for insert with check (auth.role() = 'authenticated');
create policy "posts_delete" on posts for delete using (auth.uid() = user_id);

-- post_likes: 누구나 읽기 가능, 로그인 유저만 추가/삭제
create policy "likes_select" on post_likes for select using (true);
create policy "likes_insert" on post_likes for insert with check (auth.role() = 'authenticated');
create policy "likes_delete" on post_likes for delete using (auth.uid() = user_id);

-- =============================================
-- Storage 버킷 (사진 저장소)
-- =============================================

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Storage 정책
create policy "images_select" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "images_insert" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
  );

create policy "images_delete" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
