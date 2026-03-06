export const EXPRESSIONS = [
  { key: "smile", label: "웃음", emoji: "😄" },
  { key: "heart", label: "하트뿅", emoji: "😍" },
  { key: "cry", label: "눈물", emoji: "😢" },
  { key: "angry", label: "화남", emoji: "😡" },
  { key: "surprise", label: "놀람", emoji: "😲" },
  { key: "sigh", label: "아이고", emoji: "😩" },
  { key: "wow", label: "대박", emoji: "🤩" },
  { key: "huh", label: "헐", emoji: "😑" },
  { key: "sleepy", label: "잘자", emoji: "😴" },
  { key: "fighting", label: "화이팅", emoji: "✊" },
  { key: "thanks", label: "감사", emoji: "🙏" },
  { key: "sorry", label: "미안", emoji: "🙇" },
  { key: "ok", label: "OK", emoji: "👍" },
  { key: "no", label: "No", emoji: "🙅" },
  { key: "thinking", label: "생각중", emoji: "🤔" },
  { key: "cake", label: "케이크", emoji: "🎂" },
  { key: "excited", label: "꺄아", emoji: "🥳" },
  { key: "panic", label: "멘붕", emoji: "🤯" },
  { key: "cheer_up", label: "힘내", emoji: "💪" },
  { key: "drowsy", label: "졸림", emoji: "🥱" },
  { key: "shy", label: "부끄", emoji: "🫣" },
  { key: "hungry", label: "배고파", emoji: "🤤" },
  { key: "cold", label: "추워", emoji: "🥶" },
  { key: "happy", label: "신남", emoji: "🤗" },
] as const;

export const STYLES = [
  {
    key: "cartoon" as const,
    label: "카툰",
    description: "깔끔한 만화 스타일",
    premium: false,
  },
  {
    key: "flat" as const,
    label: "플랫",
    description: "심플한 플랫 디자인",
    premium: false,
  },
  {
    key: "anime" as const,
    label: "애니메",
    description: "일본 애니메이션 스타일",
    premium: true,
  },
  {
    key: "watercolor" as const,
    label: "수채화",
    description: "부드러운 수채화 느낌",
    premium: true,
  },
  {
    key: "3d" as const,
    label: "3D",
    description: "입체적인 3D 캐릭터",
    premium: true,
  },
  {
    key: "manga" as const,
    label: "만화",
    description: "한국 만화 스타일",
    premium: true,
  },
] as const;

export const PRICING = {
  basic: 3000,
  premium: 5000,
} as const;

export const SUBSCRIPTION_PLANS = [
  {
    key: "basic" as const,
    label: "베이직",
    price: 9900,
    credits: 10,
    features: ["월 10세트 생성", "기본 스타일 2종", "OGQ 변환", "마켓플레이스 판매"],
  },
  {
    key: "pro" as const,
    label: "프로",
    price: 19900,
    credits: -1, // unlimited
    features: [
      "무제한 생성",
      "전체 스타일 6종",
      "OGQ 변환",
      "마켓플레이스 판매",
      "텍스트 편집기",
      "우선 생성 큐",
    ],
  },
] as const;

export const OGQ_SPEC = {
  sticker: { width: 740, height: 640 },
  main: { width: 240, height: 240 },
  tab: { width: 96, height: 74 },
  maxFileSize: 1024 * 1024, // 1MB
  stickerCount: 24,
} as const;
