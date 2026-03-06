import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | FaceMoji",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">이용약관</h1>
      <p className="mb-6 text-sm text-muted-foreground">시행일: 2026년 3월 6일</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold">제1조 (목적)</h2>
          <p>
            이 약관은 FaceMoji(이하 &quot;서비스&quot;)가 제공하는 AI 이모티콘 생성 서비스의
            이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제2조 (정의)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>&quot;서비스&quot;란 FaceMoji가 제공하는 AI 기반 이모티콘 생성 및 관련 서비스를 말합니다.</li>
            <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
            <li>&quot;이모티콘 세트&quot;란 사용자의 사진을 기반으로 AI가 생성한 24개의 이모티콘 이미지를 말합니다.</li>
            <li>&quot;OGQ&quot;란 네이버 OGQ 마켓을 통한 이모티콘 판매 플랫폼을 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제3조 (서비스의 내용)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>셀카 사진을 기반으로 한 AI 이모티콘 세트 생성</li>
            <li>OGQ 마켓 규격(740x640px)에 맞는 자동 변환</li>
            <li>이모티콘 미리보기 및 다운로드</li>
            <li>OGQ 마켓 제출 가이드 제공</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제4조 (이용 계약의 성립)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>이용계약은 이용자가 약관에 동의하고 회원가입을 완료한 때에 성립합니다.</li>
            <li>서비스는 다음 각 호에 해당하는 경우 가입을 거절할 수 있습니다.
              <ul className="ml-4 mt-1 list-inside list-disc">
                <li>실명이 아니거나 타인의 정보를 이용한 경우</li>
                <li>필수 정보를 허위로 기재한 경우</li>
                <li>서비스의 기술적 장애 사유가 있는 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제5조 (서비스 이용료 및 결제)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>이모티콘 생성은 건당 결제 방식입니다.</li>
            <li>이용자는 생성된 이모티콘을 미리보기(워터마크 포함)로 확인한 후, 결제 시 고해상도 원본을 다운로드할 수 있습니다.</li>
            <li>결제는 토스페이먼츠를 통해 처리되며, 신용카드 및 간편결제를 지원합니다.</li>
            <li>결제 완료 후에는 디지털 콘텐츠의 특성상 환불이 제한됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제6조 (AI 생성물의 저작권)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>AI가 생성한 이모티콘의 저작권은 관련 법령에 따라 처리됩니다.</li>
            <li>이용자는 결제 완료한 이모티콘을 개인 사용, OGQ 마켓 판매, SNS 사용 등 자유롭게 이용할 수 있습니다.</li>
            <li>단, 이모티콘을 이용한 불법적 행위, 타인의 명예를 훼손하는 행위는 금지됩니다.</li>
            <li>서비스는 이용자가 생성한 이모티콘을 마케팅, 샘플 제공 등의 목적으로 사용할 수 있습니다. 이에 동의하지 않는 경우 별도로 알려주시기 바랍니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제7조 (사진 처리 및 삭제)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>업로드된 셀카 사진은 이모티콘 생성 목적으로만 사용됩니다.</li>
            <li>이모티콘 생성이 완료되면 원본 사진은 즉시 영구 삭제됩니다.</li>
            <li>삭제된 사진은 어떠한 방법으로도 복원할 수 없습니다.</li>
            <li>AI 모델 학습에 사용자의 사진을 사용하지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제8조 (환불 정책)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>디지털 콘텐츠의 특성상 다운로드 완료 후에는 환불이 불가합니다.</li>
            <li>다음의 경우에는 전액 환불이 가능합니다.
              <ul className="ml-4 mt-1 list-inside list-disc">
                <li>결제 후 다운로드 전 취소 요청</li>
                <li>서비스 오류로 이모티콘 생성이 완전히 실패한 경우</li>
                <li>생성된 이모티콘이 OGQ 규격에 맞지 않는 경우 (검증 후)</li>
              </ul>
            </li>
            <li>환불은 원래 결제 수단으로 진행되며, 영업일 기준 3~5일 소요될 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제9조 (서비스 이용 제한)</h2>
          <p>다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다.</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>타인의 사진을 무단으로 사용하는 경우</li>
            <li>부적절한 이미지(음란, 폭력 등)를 업로드하는 경우</li>
            <li>서비스 운영을 방해하는 경우</li>
            <li>자동화 도구를 이용한 대량 생성을 시도하는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제10조 (면책 조항)</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>서비스는 AI 기술의 특성상 생성 결과물의 품질을 보증하지 않습니다.</li>
            <li>OGQ 마켓 심사 통과 여부는 OGQ의 기준에 따르며, 서비스가 보장하지 않습니다.</li>
            <li>천재지변, 서비스 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">제11조 (분쟁 해결)</h2>
          <p>
            서비스 이용과 관련한 분쟁은 대한민국 법률에 따라 해결하며,
            관할 법원은 민사소송법에 따른 관할 법원으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">부칙</h2>
          <p>이 약관은 2026년 3월 6일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
