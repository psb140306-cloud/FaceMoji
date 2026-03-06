export const FONTS = [
  { key: "pretendard", label: "둥근", family: "Pretendard" },
  { key: "nanum-pen", label: "손글씨", family: "Nanum Pen Script" },
  { key: "black-han-sans", label: "굵은", family: "Black Han Sans" },
] as const;

export const BUBBLE_STYLES = [
  { key: "basic", label: "기본", borderRadius: 12, tailType: "triangle" as const },
  { key: "round", label: "둥근", borderRadius: 999, tailType: "curve" as const },
  { key: "explosion", label: "폭발", borderRadius: 0, tailType: "spike" as const },
] as const;

export const TEXT_MAX_LENGTH = 10;

export const EDITOR_CANVAS_SIZE = { width: 740, height: 640 };
