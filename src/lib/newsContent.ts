// 날짜 기반으로 로테이션되는 건강 뉴스 콘텐츠
// Phase 3에서 Claude AI 또는 NewsAPI로 교체 예정

export type NewsArticle = {
  id: string
  title: string
  summary: string
  tag: string
  readTime: string
  date: string
  source: string
}

export type EcoArticle = {
  id: string
  title: string
  summary: string
  tag: string
  readTime: string
  date: string
  source: string
}

// 건강 뉴스 풀 (날짜에 따라 순환)
const healthArticlePool: Omit<NewsArticle, 'id' | 'date'>[] = [
  {
    title: '당뇨 전단계, 생활습관 교정만으로도 70% 예방 가능',
    summary: '규칙적인 운동(주 150분)과 체중 7% 감량만으로도 당뇨 전단계에서 진행되는 것을 70% 막을 수 있습니다.',
    tag: '당뇨 예방', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '아침 식사가 혈당 관리의 핵심인 이유',
    summary: '아침을 거르면 점심 식사 후 혈당이 더 급격히 상승합니다. 단백질과 식이섬유 풍부한 아침이 하루 혈당을 안정시킵니다.',
    tag: '혈당', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '직장인 허리 통증, 하루 2분 스트레칭으로 해결',
    summary: '1시간마다 2분의 간단한 의자 스트레칭이 허리 통증을 50% 이상 줄여준다는 연구 결과가 있습니다.',
    tag: '스트레칭', readTime: '1분', source: '루틴핏 건강 정보',
  },
  {
    title: '수면 부족이 체중에 미치는 영향',
    summary: '하루 6시간 미만 수면 시 식욕 억제 호르몬(렙틴)이 감소하고 식욕 촉진 호르몬(그렐린)이 증가합니다.',
    tag: '수면', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '걷기 운동, 하루 7,000보면 충분하다',
    summary: '10,000보가 아닌 7,000보만 걸어도 조기 사망 위험을 50~70% 줄일 수 있다는 연구 결과가 발표됐습니다.',
    tag: '운동', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '녹차의 혈당 조절 효과',
    summary: '녹차의 EGCG 성분이 인슐린 민감성을 높여 식후 혈당 급등을 억제한다는 연구가 확인됐습니다.',
    tag: '식이요법', readTime: '1분', source: '루틴핏 건강 정보',
  },
  {
    title: '스트레스와 혈압의 관계',
    summary: '만성 스트레스는 코르티솔 분비를 증가시켜 혈압을 높입니다. 하루 5분 심호흡만으로도 효과가 있습니다.',
    tag: '스트레스', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '눈 건강: 20-20-20 법칙의 과학적 근거',
    summary: '20분마다 20피트(6m) 거리를 20초간 바라보는 방법이 디지털 안구 피로 증상을 유의미하게 줄입니다.',
    tag: '눈 건강', readTime: '1분', source: '루틴핏 건강 정보',
  },
  {
    title: '장 건강이 면역력에 미치는 영향',
    summary: '장내 미생물의 70%는 면역계와 연결돼 있습니다. 발효식품과 식이섬유 섭취가 장 건강의 핵심입니다.',
    tag: '장 건강', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '마그네슘 부족, 현대인의 가장 흔한 영양 결핍',
    summary: '마그네슘은 수면, 근육, 혈당 조절 등 300가지 이상 신체 기능에 관여하지만 한국 성인의 60%가 부족합니다.',
    tag: '영양', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '식후 혈당 스파이크를 잡는 식사 순서',
    summary: '채소→단백질→탄수화물 순서로 먹으면 혈당이 천천히 오릅니다. 순서만 바꿔도 혈당 스파이크 40% 감소 효과가 있습니다.',
    tag: '혈당', readTime: '1분', source: '루틴핏 건강 정보',
  },
  {
    title: '하루 물 2리터, 정말 필요한가?',
    summary: '체중 기준 30ml/kg가 권장 수분량입니다. 체중 60kg 기준 1.8L. 커피나 주스는 수분으로 계산되지 않습니다.',
    tag: '수분', readTime: '1분', source: '루틴핏 건강 정보',
  },
  {
    title: '근력 운동이 혈당 관리에 효과적인 이유',
    summary: '근육은 포도당 저장 창고입니다. 근육량이 늘어날수록 혈당 조절 능력이 좋아지고 당뇨 위험이 낮아집니다.',
    tag: '운동', readTime: '2분', source: '루틴핏 건강 정보',
  },
  {
    title: '오메가3가 뇌 기능을 지키는 방법',
    summary: '뇌의 60%는 지방으로 이루어져 있으며, DHA(오메가3)는 신경 세포막의 핵심 성분입니다. 주 2~3회 생선 섭취를 권장합니다.',
    tag: '영양', readTime: '2분', source: '루틴핏 건강 정보',
  },
]

const ecoArticlePool: Omit<EcoArticle, 'id' | 'date'>[] = [
  {
    title: '건강식품 시장 급성장, 올해도 두 자릿수 성장 전망',
    summary: '프로바이오틱스, 오메가3, 저당 식품 수요가 급증하며 건강식품 시장이 올해 15% 이상 성장할 것으로 전망됩니다.',
    tag: '시장', readTime: '1분', source: '루틴핏 경제 정보',
  },
  {
    title: '2026년 경제 전망: 소비 심리 회복세',
    summary: '내수 소비 중심으로 회복세를 보이는 가운데 건강·웰니스 산업이 두드러진 성장세를 나타내고 있습니다.',
    tag: '경제', readTime: '1분', source: '루틴핏 경제 정보',
  },
  {
    title: '헬스케어 스타트업 투자 급증, 디지털 건강관리 주목',
    summary: '웨어러블 기기, 건강 앱, AI 진단 등 디지털 헬스케어 분야 투자가 전년 대비 35% 증가했습니다.',
    tag: '투자', readTime: '2분', source: '루틴핏 경제 정보',
  },
  {
    title: '저당 식품 트렌드, 편의점까지 확산',
    summary: '혈당 관리에 관심이 높아지면서 편의점 저당 도시락, 저당 음료 매출이 전년 대비 40% 증가했습니다.',
    tag: '트렌드', readTime: '1분', source: '루틴핏 경제 정보',
  },
  {
    title: '건강보험료 인상 예고, 예방적 건강관리 더 중요해져',
    summary: '내년도 건강보험료 인상이 예고되면서 사전 예방적 건강 관리의 중요성이 더욱 부각되고 있습니다.',
    tag: '의료', readTime: '2분', source: '루틴핏 경제 정보',
  },
  {
    title: '직장인 건강검진 수검률 역대 최고치',
    summary: '코로나19 이후 건강에 대한 관심이 높아지면서 직장인 건강검진 수검률이 89%로 역대 최고를 기록했습니다.',
    tag: '건강검진', readTime: '1분', source: '루틴핏 경제 정보',
  },
  {
    title: '운동 앱 시장, 5년간 3배 성장 전망',
    summary: '글로벌 피트니스 앱 시장이 2030년까지 현재의 3배 규모로 성장할 것으로 예측됩니다. 국내도 연 25% 성장세.',
    tag: '시장', readTime: '1분', source: '루틴핏 경제 정보',
  },
]

// 날짜 기반 인덱스 (매일 바뀜)
function getDayIndex(poolSize: number): number {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % poolSize
}

function getFormatDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

// 오늘 + 내일 건강 뉴스 2개 반환
export function getTodayHealthNews(): NewsArticle[] {
  const idx = getDayIndex(healthArticlePool.length)
  return [
    {
      id: `health_today_0`,
      date: getFormatDate(0),
      ...healthArticlePool[idx],
    },
    {
      id: `health_today_1`,
      date: getFormatDate(0),
      ...healthArticlePool[(idx + 1) % healthArticlePool.length],
    },
  ]
}

// 오늘 경제 뉴스 1개 반환
export function getTodayEcoNews(): EcoArticle[] {
  const idx = getDayIndex(ecoArticlePool.length)
  return [
    {
      id: `eco_today_0`,
      date: getFormatDate(0),
      ...ecoArticlePool[idx],
    },
  ]
}

// 지난 7일 기록 (저장된 것 + 풀에서 보충)
export function getWeeklyHealthNews(): NewsArticle[] {
  return Array.from({ length: 5 }, (_, i) => {
    const idx = (getDayIndex(healthArticlePool.length) - i + healthArticlePool.length * 10) % healthArticlePool.length
    return {
      id: `health_archive_${i}`,
      date: getFormatDate(-i),
      ...healthArticlePool[idx],
    }
  })
}
