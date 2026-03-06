import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FaceMoji. All rights reserved.
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-foreground">
              이용약관
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground">
              개인정보처리방침
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
