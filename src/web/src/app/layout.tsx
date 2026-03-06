import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FaceMoji - 셀카로 나만의 이모티콘 만들기",
    template: "%s | FaceMoji",
  },
  description: "셀카 1장으로 24개 이모티콘 세트를 자동 생성. OGQ 마켓 규격으로 즉시 판매 가능.",
  keywords: ["이모티콘", "AI", "셀카", "OGQ", "스티커", "이모지", "FaceMoji"],
  metadataBase: new URL("https://facemoji-psi.vercel.app"),
  openGraph: {
    title: "FaceMoji - 셀카로 나만의 이모티콘 만들기",
    description: "셀카 1장으로 24개 이모티콘 세트를 자동 생성. OGQ 마켓 규격으로 즉시 판매 가능.",
    locale: "ko_KR",
    type: "website",
    siteName: "FaceMoji",
  },
  twitter: {
    card: "summary_large_image",
    title: "FaceMoji - 셀카로 나만의 이모티콘 만들기",
    description: "셀카 1장으로 24개 이모티콘 세트를 자동 생성.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
