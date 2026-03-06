import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Palette, Download, Sparkles, Zap, Shield } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    title: "셀카 촬영",
    description: "정면 셀카 1장만 업로드하세요",
  },
  {
    icon: Palette,
    title: "스타일 선택",
    description: "카툰, 플랫 등 원하는 스타일을 골라요",
  },
  {
    icon: Download,
    title: "다운로드",
    description: "24개 이모티콘 세트를 받아보세요",
  },
] as const;

const SAMPLE_EXPRESSIONS = [
  "😄 웃음",
  "😍 하트뿅",
  "😢 눈물",
  "😡 화남",
  "😲 놀람",
  "🤩 대박",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
            <div className="flex-1 space-y-6">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                OGQ 마켓 규격 자동 변환
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                셀카 한 장으로
                <br />
                <span className="text-primary">나만의 이모티콘</span> 만들기
              </h1>
              <p className="text-lg text-muted-foreground">
                AI가 내 얼굴을 분석해 24개 표정 이모티콘 세트를 자동 생성합니다.
                <br className="hidden md:block" />
                OGQ 마켓에 바로 등록할 수 있는 규격으로 변환해 드려요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="text-base font-semibold">
                  <Link href="/create">무료로 시작하기</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="#how-it-works">이용 방법 보기</Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual - 이모티콘 그리드 미리보기 */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_EXPRESSIONS.map((expr) => (
                  <div
                    key={expr}
                    className="flex aspect-square items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5 md:text-3xl"
                  >
                    {expr.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            3단계로 완성되는 이모티콘
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Card key={step.title} className="relative border-0 bg-muted/40 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">STEP {i + 1}</div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            왜 FaceMoji인가요?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "AI 자동 생성",
                desc: "셀카 1장으로 24개 표정 이모티콘을 자동 생성합니다.",
              },
              {
                icon: Zap,
                title: "빠른 생성",
                desc: "업로드부터 다운로드까지 5분이면 충분합니다.",
              },
              {
                icon: Shield,
                title: "개인정보 보호",
                desc: "얼굴 사진은 생성 즉시 삭제됩니다.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">심플한 가격</h2>
          <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
            <Card className="relative">
              <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <h3 className="text-lg font-bold">카툰 / 플랫</h3>
                <div className="text-3xl font-extrabold">
                  3,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">24개 이모티콘 세트</p>
                <Button asChild className="w-full">
                  <Link href="/create">만들기</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="relative ring-2 ring-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white">인기</Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <h3 className="text-lg font-bold">프리미엄 스타일</h3>
                <div className="text-3xl font-extrabold">
                  5,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">24개 + 고급 스타일</p>
                <Button asChild className="w-full">
                  <Link href="/create">만들기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-16 text-center text-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">지금 바로 만들어 보세요</h2>
          <p className="mb-8 text-white/80">미리보기는 무료! 결제는 마음에 들 때만.</p>
          <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
            <Link href="/create">무료로 시작하기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
