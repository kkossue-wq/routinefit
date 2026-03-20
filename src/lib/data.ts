// 루틴 데이터 타입
export interface Routine {
  id: string
  emoji: string
  title: string
  description: string
  duration: string
  category: 'morning' | 'work' | 'evening' | 'health'
  tip?: string
}

// 아침 루틴
export const morningRoutines: Routine[] = [
  {
    id: 'morning-water',
    emoji: '💧',
    title: '물 한잔 마시기',
    description: '일어나자마자 공복에 물 한잔 (200~300ml)',
    duration: '1분',
    category: 'morning',
    tip: '공복 물 한잔은 신진대사를 깨워주고 독소 배출에 도움이 됩니다.',
  },
  {
    id: 'morning-stretch',
    emoji: '🧘',
    title: '5분 아침 스트레칭',
    description: '기지개 켜기, 목·어깨·허리 스트레칭',
    duration: '5분',
    category: 'morning',
    tip: '아침 스트레칭은 혈액순환을 개선하고 하루 활력을 높여줍니다.',
  },
  {
    id: 'morning-news',
    emoji: '📰',
    title: '오늘의 뉴스 읽기',
    description: '경제 & 건강 뉴스 요약 읽기',
    duration: '3분',
    category: 'morning',
    tip: '아침에 뉴스를 읽으면 하루 대화 주제가 풍부해집니다.',
  },
  {
    id: 'morning-breakfast',
    emoji: '🥗',
    title: '건강한 아침 식사',
    description: '혈당이 천천히 오르는 균형잡힌 식사',
    duration: '15분',
    category: 'morning',
    tip: '아침 식사를 거르면 점심에 폭식하게 됩니다. 가볍게라도 드세요!',
  },
]

// 직장 루틴
export const workRoutines: Routine[] = [
  {
    id: 'work-desk-stretch',
    emoji: '🪑',
    title: '의자 스트레칭',
    description: '목 돌리기, 어깨 으쓱, 허리 비틀기',
    duration: '2분',
    category: 'work',
    tip: '1시간마다 2분 스트레칭이 헬스장 1시간보다 혈액순환에 효과적입니다.',
  },
  {
    id: 'work-eye-rest',
    emoji: '😌',
    title: '눈 휴식 20-20-20',
    description: '20분 일하면 20초간 먼 곳 보기',
    duration: '20초',
    category: 'work',
    tip: '20-20-20 법칙은 눈 피로도를 50% 이상 줄여주는 검증된 방법입니다.',
  },
  {
    id: 'work-water',
    emoji: '💧',
    title: '수분 보충',
    description: '커피 대신 물이나 녹차 한잔',
    duration: '1분',
    category: 'work',
    tip: '카페인 음료는 수분 손실을 가져옵니다. 물로 대체해보세요!',
  },
  {
    id: 'work-walk',
    emoji: '🚶',
    title: '점심 후 산책',
    description: '식후 10-15분 가벼운 걷기',
    duration: '10분',
    category: 'work',
    tip: '식후 걷기는 혈당 스파이크를 30% 이상 줄여줍니다!',
  },
]

// 저녁 루틴
export const eveningRoutines: Routine[] = [
  {
    id: 'evening-no-sugar',
    emoji: '🚫',
    title: '야식 & 당 음료 끊기',
    description: '저녁 8시 이후 단 음료, 야식 참기',
    duration: '의지력',
    category: 'evening',
    tip: '저녁 이후 인슐린 분비가 낮아져 당이 체지방으로 직행합니다.',
  },
  {
    id: 'evening-stretch',
    emoji: '🌙',
    title: '저녁 스트레칭',
    description: '하루 피로를 푸는 전신 스트레칭',
    duration: '10분',
    category: 'evening',
    tip: '잠들기 1~2시간 전 스트레칭이 수면의 질을 높여줍니다.',
  },
  {
    id: 'evening-phone',
    emoji: '📵',
    title: '취침 전 스마트폰 금지',
    description: '블루라이트 차단으로 수면의 질 향상',
    duration: '30분',
    category: 'evening',
    tip: '블루라이트는 멜라토닌 분비를 방해해 수면을 방해합니다.',
  },
]

// 건강 관리 팁
export const healthTips = [
  {
    id: 'tip-1',
    emoji: '🩸',
    title: '혈당 스파이크 예방법',
    content: '식사 순서가 중요합니다. 채소 → 단백질 → 탄수화물 순으로 먹으면 혈당이 천천히 오릅니다.',
    tag: '혈당 관리',
  },
  {
    id: 'tip-2',
    emoji: '🍚',
    title: '흰쌀밥 대신 잡곡밥',
    content: '잡곡밥은 흰쌀밥보다 혈당지수(GI)가 낮아 혈당을 안정적으로 유지해줍니다.',
    tag: '식단',
  },
  {
    id: 'tip-3',
    emoji: '🚶',
    title: '식후 걷기의 효과',
    content: '식후 10~15분 걷기만 해도 혈당 스파이크를 30% 이상 줄일 수 있습니다.',
    tag: '운동',
  },
  {
    id: 'tip-4',
    emoji: '💧',
    title: '하루 물 2리터 마시기',
    content: '충분한 수분 섭취는 인슐린 민감성을 높이고 당뇨 위험을 낮춰줍니다.',
    tag: '수분',
  },
  {
    id: 'tip-5',
    emoji: '😴',
    title: '수면 부족이 혈당에 미치는 영향',
    content: '하루 6시간 미만 수면은 인슐린 저항성을 높여 당뇨 위험을 2배 높입니다.',
    tag: '수면',
  },
  {
    id: 'tip-6',
    emoji: '🥦',
    title: '브로콜리의 놀라운 효과',
    content: '브로콜리의 설포라판 성분이 혈당 조절에 도움을 준다는 연구 결과가 있습니다.',
    tag: '식단',
  },
  {
    id: 'tip-7',
    emoji: '🧘',
    title: '스트레스와 혈당의 관계',
    content: '스트레스 호르몬(코르티솔)은 혈당을 높입니다. 하루 5분 명상이 혈당 관리에 도움됩니다.',
    tag: '스트레스',
  },
]

// 커뮤니티 목업 데이터
export const communityPosts = [
  {
    id: '1',
    user: '건강마니아',
    avatar: '🏃',
    text: '오늘 아침 스트레칭 완료! 어깨가 훨씬 가벼워졌어요 😊 벌써 2주째 하고있는데 확실히 다르네요',
    type: '운동',
    likes: 12,
    time: '방금 전',
  },
  {
    id: '2',
    user: '혈당관리중',
    avatar: '🥗',
    text: '점심에 당 들어간 음료 참았어요! 물만 마셨습니다 💪 오후에 졸리지 않고 집중이 더 잘 되는 것 같아요',
    type: '식단',
    likes: 8,
    time: '15분 전',
  },
  {
    id: '3',
    user: '아침형인간되기',
    avatar: '🌅',
    text: '공복 물 한잔으로 하루 시작! 벌써 7일째에요 🌅 피부도 맑아진 것 같고 속이 편해요',
    type: '루틴',
    likes: 21,
    time: '1시간 전',
  },
  {
    id: '4',
    user: '직장인건강',
    avatar: '💼',
    text: '점심 식후 산책 10분 완료! 오후에 졸음이 싹 가시네요. 동료들한테도 추천했어요 ㅋㅋ',
    type: '운동',
    likes: 15,
    time: '2시간 전',
  },
  {
    id: '5',
    user: '건강습관만들기',
    avatar: '🥦',
    text: '오늘 밥 먹을 때 채소 먼저, 단백질, 탄수화물 순서 지켰어요! 혈당 관리 시작 3일차',
    type: '식단',
    likes: 7,
    time: '3시간 전',
  },
]

// 뉴스 목업 데이터
export const newsData = {
  economy: [
    {
      id: 'eco-1',
      title: '2026년 경제 전망: 소비 심리 회복세',
      summary:
        '한국 경제가 내수 소비 중심으로 회복세를 보이고 있습니다. 특히 건강·웰니스 산업이 두드러진 성장세를 나타내고 있어 관련 주식과 ETF에 관심이 집중되고 있습니다.',
      source: 'AI 요약',
      readTime: '1분',
      tag: '경제',
    },
    {
      id: 'eco-2',
      title: '건강식품 시장 급성장... 올해도 두 자릿수 성장 전망',
      summary:
        '프로바이오틱스, 오메가3, 저당 식품 수요가 급증하며 건강식품 시장이 올해도 15% 이상 성장할 것으로 예측됩니다.',
      source: 'AI 요약',
      readTime: '1분',
      tag: '시장',
    },
  ],
  health: [
    {
      id: 'health-1',
      title: '당뇨 전단계, 생활습관 교정만으로도 70% 예방 가능',
      summary:
        '규칙적인 운동(주 150분)과 체중 7% 감량만으로도 당뇨 전단계에서 당뇨로 진행되는 것을 70% 막을 수 있다고 밝혔습니다.',
      source: 'AI 요약',
      readTime: '2분',
      tag: '당뇨 예방',
    },
    {
      id: 'health-2',
      title: '아침 식사가 혈당 관리의 핵심인 이유',
      summary:
        '아침을 거르면 점심 식사 후 혈당이 더 급격히 상승합니다. 단백질과 식이섬유가 풍부한 아침 식사가 하루 혈당 변동성을 낮추는 데 핵심적인 역할을 합니다.',
      source: 'AI 요약',
      readTime: '2분',
      tag: '혈당',
    },
    {
      id: 'health-3',
      title: '직장인 허리 통증, 하루 2분 스트레칭으로 해결',
      summary:
        '장시간 앉아있는 직장인의 80%가 허리 통증을 경험합니다. 1시간마다 2분의 간단한 의자 스트레칭이 허리 통증을 50% 이상 줄여준다는 연구 결과가 발표됐습니다.',
      source: 'AI 요약',
      readTime: '1분',
      tag: '스트레칭',
    },
  ],
}

// 🏆 챌린지 데이터
export const challenges = [
  {
    id: 'challenge-blood-sugar',
    emoji: '🩸',
    title: '30일 혈당 관리 챌린지',
    subtitle: '현대인의 혈당을 잡아라!',
    description: '매일 식사 순서 지키기 + 식후 10분 걷기로 혈당을 정복해요',
    duration: 30,
    participants: 2847,
    color: 'coral',
    bgClass: 'from-coral-400 to-pink-400',
    tasks: ['🥗 채소 먼저 먹기', '🚶 식후 10분 걷기', '🚫 당 음료 끊기', '⏰ 규칙적인 식사'],
    badge: '🩸 혈당지킴이',
  },
  {
    id: 'challenge-morning',
    emoji: '🌅',
    title: '7일 아침 루틴 챌린지',
    subtitle: '아침형 인간 되기 프로젝트!',
    description: '7일 연속 아침 루틴 4가지를 모두 완료해보세요',
    duration: 7,
    participants: 5123,
    color: 'lemon',
    bgClass: 'from-lemon-400 to-amber-300',
    tasks: ['💧 물 한잔 마시기', '🧘 5분 스트레칭', '📰 뉴스 읽기', '🥗 건강한 아침 식사'],
    badge: '🌅 아침형인간',
  },
  {
    id: 'challenge-water',
    emoji: '💧',
    title: '14일 수분 충전 챌린지',
    subtitle: '물이 최고의 약이에요!',
    description: '14일 동안 하루 8잔 물 마시기 목표 달성',
    duration: 14,
    participants: 3891,
    color: 'sky',
    bgClass: 'from-sky-400 to-blue-400',
    tasks: ['💧 하루 8잔 물 마시기', '☕ 커피 2잔 이하', '🫖 녹차로 대체하기'],
    badge: '💧 수분왕',
  },
]

// 💊 건강 제품 추천 (제휴 마케팅용)
export const healthProducts = [
  {
    id: 'prod-omega3',
    emoji: '🐟',
    name: '오메가3',
    description: '혈중 중성지방 감소, 혈관 건강에 도움',
    tag: '혈관 건강',
    price: '월 15,000원~',
    rating: 4.8,
    reviews: 2341,
  },
  {
    id: 'prod-probiotics',
    emoji: '🫙',
    name: '프로바이오틱스',
    description: '장 건강 & 면역력 향상, 혈당 조절 도움',
    tag: '장 건강',
    price: '월 20,000원~',
    rating: 4.7,
    reviews: 1892,
  },
  {
    id: 'prod-magnesium',
    emoji: '💊',
    name: '마그네슘',
    description: '수면 개선 & 근육 피로 회복, 스트레스 완화',
    tag: '수면 & 근육',
    price: '월 12,000원~',
    rating: 4.9,
    reviews: 3104,
  },
  {
    id: 'prod-berberine',
    emoji: '🌿',
    name: '베르베린',
    description: '혈당 조절에 도움, 당뇨 전단계에 주목받는 성분',
    tag: '혈당 관리',
    price: '월 25,000원~',
    rating: 4.6,
    reviews: 987,
  },
]
