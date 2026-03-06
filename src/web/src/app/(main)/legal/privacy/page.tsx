import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | FaceMoji",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">개인정보 처리방침</h1>
      <p className="mb-6 text-sm text-muted-foreground">시행일: 2026년 3월 6일</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold">1. 개인정보 처리 목적</h2>
          <p>
            FaceMoji(이하 &quot;서비스&quot;)는 다음 목적을 위해 개인정보를 처리합니다.
            처리하는 개인정보는 다음 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
            변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행합니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 서비스 부정이용 방지</li>
            <li>서비스 제공: AI 이모티콘 생성, 결제 처리, 콘텐츠 제공</li>
            <li>고충 처리: 민원 처리, 분쟁 조정, 고지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. 처리하는 개인정보 항목</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">구분</th>
                <th className="py-2 text-left font-medium">항목</th>
                <th className="py-2 text-left font-medium">보유 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">필수</td>
                <td className="py-2">이메일, 비밀번호(해시), 소셜 로그인 식별자</td>
                <td className="py-2">회원 탈퇴 시까지</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">얼굴 사진 (민감정보)</td>
                <td className="py-2">셀카 이미지</td>
                <td className="py-2 font-semibold text-primary">
                  이모티콘 생성 완료 즉시 삭제
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">결제 정보</td>
                <td className="py-2">결제수단, 거래내역</td>
                <td className="py-2">전자상거래법에 따라 5년</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">동의 기록</td>
                <td className="py-2">동의 일시, IP, User-Agent</td>
                <td className="py-2">개인정보보호법에 따라 5년</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. 얼굴 사진(생체인식정보) 처리 특칙</h2>
          <p>
            본 서비스는 개인정보보호법 제23조(민감정보의 처리 제한) 및 PIPA(개인정보 보호법)에
            따라 얼굴 사진을 다음과 같이 엄격하게 처리합니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>명시적 동의</strong>: 업로드 전 별도의 동의 절차를 거칩니다.
            </li>
            <li>
              <strong>즉시 삭제</strong>: 이모티콘 생성이 완료되는 즉시 원본 사진을 영구
              삭제합니다. 삭제 후에는 어떠한 방법으로도 복원할 수 없습니다.
            </li>
            <li>
              <strong>제3자 미제공</strong>: 얼굴 사진은 AI 이모티콘 생성 목적으로만 처리되며,
              제3자에게 제공하지 않습니다.
            </li>
            <li>
              <strong>AI 처리</strong>: fal.ai API를 통해 이모티콘을 생성하며, fal.ai의
              데이터 처리 정책에 따라 입력 이미지는 처리 후 삭제됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. 개인정보 제3자 제공</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>fal.ai</strong>: AI 이모티콘 생성을 위한 이미지 처리 (처리 후 즉시 삭제)
            </li>
            <li>
              <strong>토스페이먼츠</strong>: 결제 처리를 위한 최소한의 정보 전달
            </li>
            <li>
              <strong>Supabase (AWS)</strong>: 데이터 저장 및 인증 서비스
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. 정보주체의 권리</h2>
          <p>이용자는 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
            <li>회원 탈퇴 (마이페이지에서 직접 처리 가능)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. 개인정보의 안전성 확보 조치</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>비밀번호 암호화 저장 (bcrypt)</li>
            <li>SSL/TLS 암호화 통신</li>
            <li>Row Level Security (RLS) 적용</li>
            <li>접근 권한 최소화</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. 개인정보 보호책임자</h2>
          <p>
            개인정보 보호에 관한 문의는 아래 연락처로 문의해 주시기 바랍니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>담당자: FaceMoji 운영팀</li>
            <li>이메일: privacy@facemoji.kr</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. 개인정보 처리방침 변경</h2>
          <p>
            이 개인정보 처리방침은 2026년 3월 6일부터 적용됩니다.
            변경 사항이 있을 경우 서비스 내 공지를 통해 안내드리겠습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
