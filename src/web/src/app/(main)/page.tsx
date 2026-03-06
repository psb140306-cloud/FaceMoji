import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Camera, Palette, Download, Sparkles, Zap, Shield } from "lucide-react";

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

const SAMPLE_GALLERY = [
  { style: "카툰", emojis: ["😄", "😍", "😢", "😎", "🤩", "😤"] },
  { style: "플랫", emojis: ["😊", "🥰", "😭", "😠", "😲", "🤗"] },
  { style: "애니메", emojis: ["😆", "💕", "😿", "👿", "🙀", "✨"] },
];

const FLOATING_EMOJIS = [
  { emoji: "😎", className: "top-[10%] left-[5%] animate-float-up text-3xl md:text-4xl", delay: "0s" },
  { emoji: "🥳", className: "top-[20%] right-[8%] animate-float-down text-2xl md:text-3xl", delay: "0.5s" },
  { emoji: "😍", className: "bottom-[25%] left-[10%] animate-float-down text-2xl md:text-3xl", delay: "1s" },
  { emoji: "🤩", className: "top-[15%] right-[25%] animate-float-up text-xl md:text-2xl", delay: "1.5s" },
  { emoji: "😆", className: "bottom-[15%] right-[5%] animate-float-up text-3xl md:text-4xl", delay: "0.8s" },
  { emoji: "✨", className: "top-[40%] left-[2%] animate-float-down text-xl", delay: "2s" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-primary-100/30">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-primary/8 blur-3xl" />

        {/* Floating emojis */}
        {FLOATING_EMOJIS.map(({ emoji, className, delay }, i) => (
          <div
            key={i}
            className={`pointer-events-none absolute hidden select-none opacity-0 md:block ${className}`}
            style={{ animationDelay: delay, animationFillMode: "backwards" }}
            aria-hidden="true"
          >
            {emoji}
          </div>
        ))}

        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-32">
          <div className="flex flex-col items-center gap-10 text-center md:flex-row md:gap-16 md:text-left">
            <div className="flex-1 space-y-6">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
                OGQ 마켓 규격 자동 변환
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                <span className="block">셀카 한 장으로</span>
                <span className="mt-1 block bg-gradient-to-r from-primary-600 via-primary to-primary-400 bg-clip-text text-transparent animate-shimmer">
                  나만의 이모티콘 만들기
                </span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                AI가 내 얼굴을 분석해 24개 표정 이모티콘 세트를
                자동 생성합니다. OGQ 마켓에 바로 등록할 수 있는
                규격으로 변환해 드려요.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group relative overflow-hidden text-base font-semibold shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30">
                  <Link href="/create">
                    내 이모티콘 만들어보기
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="#how-it-works">이용 방법 보기</Link>
                </Button>
              </div>
            </div>

            {/* Hero Visual - Before/After 변환 */}
            <div className="flex flex-1 items-center justify-center gap-5 md:gap-6">
              {/* Before: 셀카 */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/60 ring-4 ring-primary/10 md:h-36 md:w-36">
                    <Camera className="h-10 w-10 text-muted-foreground/60 md:h-12 md:w-12" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">셀카 1장</span>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-full bg-primary/10 p-2">
                  <ArrowRight className="h-5 w-5 text-primary animate-bounce-arrow md:h-6 md:w-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-primary">AI 변환</span>
              </div>

              {/* After: 이모티콘 그리드 */}
              <div className="flex flex-col items-center gap-2">
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  {["😄", "😍", "😢", "😎", "🤩", "😤", "😭", "🥳", "😊"].map((emoji, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-lg shadow-md ring-1 ring-black/5 transition-transform hover:scale-110 md:h-12 md:w-12 md:text-xl animate-scale-pop"
                      style={{ animationDelay: `${i * 0.08}s` }}
                      aria-hidden="true"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">24개 이모티콘</span>
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
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
            {STEPS.map((step, i) => (
              <Card key={step.title} className="min-w-[260px] shrink-0 snap-center border-0 bg-muted/40 shadow-none md:min-w-0">
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

      {/* Sample Gallery */}
      <section className="bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
            이런 이모티콘이 만들어져요
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            다양한 스타일로 나만의 표정을 담아보세요
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {SAMPLE_GALLERY.map((sample) => (
              <div key={sample.style} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                <h3 className="mb-4 text-center text-sm font-bold text-primary">{sample.style} 스타일</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sample.emojis.map((emoji, i) => (
                    <div
                      key={i}
                      className="flex aspect-square items-center justify-center rounded-xl bg-muted/50 text-2xl md:text-3xl"
                      aria-hidden="true"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  실제 서비스에서는 AI가 생성한 이모티콘이 표시됩니다
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
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
      <section className="bg-muted/30 py-16 md:py-24">
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
      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">지금 바로 만들어 보세요</h2>
          <p className="mb-8 opacity-80">미리보기는 무료! 결제는 마음에 들 때만.</p>
          <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
            <Link href="/create">내 이모티콘 만들어보기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
