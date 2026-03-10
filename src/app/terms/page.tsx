import Link from "next/link";

export const metadata = {
  title: "이용약관 - XBridge",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-[#64748B] hover:text-[#1E40AF]"
      >
        &larr; 홈으로
      </Link>

      <h1 className="text-3xl font-bold text-[#1E293B]">이용약관</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#64748B]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            제1조 (목적)
          </h2>
          <p>
            이 약관은 XBridge(이하 &quot;회사&quot;)가 제공하는 사전 신청 서비스의
            이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            제2조 (사전 신청)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>사전 신청은 무료이며, 서비스 이용 의무를 발생시키지 않습니다.</li>
            <li>
              사전 신청 시 제공하는 정보는 정확해야 하며, 허위 정보 제공 시 혜택이
              제한될 수 있습니다.
            </li>
            <li>
              사전 신청 혜택은 정식 출시일로부터 3개월간 유효합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            제3조 (혜택)
          </h2>
          <p>사전 신청자에게는 다음과 같은 혜택이 제공됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>정식 출시 시 우선 초대</li>
            <li>유료 플랜 첫 3개월 50% 할인</li>
            <li>수출 전문가 1:1 무료 상담 1회</li>
            <li>베타 테스트 참여 기회 (선착순)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            제4조 (책임 제한)
          </h2>
          <p>
            회사는 사전 신청 서비스의 변경, 중단에 대해 사전 공지하며, 불가항력에
            의한 서비스 중단에 대해서는 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            제5조 (기타)
          </h2>
          <p>
            이 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
          </p>
        </section>

        <p className="pt-4 text-xs text-[#94A3B8]">
          시행일: 2026년 3월 10일
        </p>
      </div>
    </div>
  );
}
