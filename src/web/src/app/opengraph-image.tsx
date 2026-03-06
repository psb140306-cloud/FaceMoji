import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FaceMoji - AI 이모티콘 생성";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF1F0 0%, #FFFFFF 50%, #FFF1F0 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "72px", fontWeight: 800, color: "#FF4D3A" }}>Face</span>
          <span style={{ fontSize: "72px", fontWeight: 800, color: "#111" }}>Moji</span>
        </div>
        <div style={{ fontSize: "32px", color: "#666", marginBottom: "40px" }}>
          셀카 한 장으로 나만의 이모티콘 만들기
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {["😄", "😍", "😢", "😎", "🤩", "😤", "😭", "🥳"].map((emoji, i) => (
            <div
              key={i}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
