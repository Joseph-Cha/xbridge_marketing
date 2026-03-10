import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 - XBridge",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-[#64748B] hover:text-[#1E40AF]"
      >
        &larr; 홈으로
      </Link>

      <h1 className="text-3xl font-bold text-[#1E293B]">
        개인정보처리방침
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#64748B]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            1. 수집하는 개인정보 항목
          </h2>
          <p>
            회사는 사전 신청 서비스 제공을 위해 다음과 같은 개인정보를
            수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              필수항목: 회사명, 업종, 담당자명, 이메일, 연락처, 관심 수출국,
              수출 경험
            </li>
            <li>선택항목: 사업자등록번호, 직책, 연 매출 규모, 추가 문의사항</li>
            <li>자동수집: 방문 일시, IP 주소, 브라우저 정보, 유입 경로</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            2. 수집 및 이용 목적
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>서비스 출시 안내 및 사전 신청 혜택 제공</li>
            <li>고객 문의 응대 및 서비스 개선</li>
            <li>마케팅 정보 발송 (동의 시)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            3. 보유 및 이용 기간
          </h2>
          <p>
            서비스 종료 시 또는 동의 철회 시까지 보유합니다. 다만, 관련 법령에
            따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            4. 동의 거부 권리
          </h2>
          <p>
            개인정보 수집 및 이용에 대한 동의를 거부할 수 있으나, 이 경우 사전
            신청이 불가합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            5. 개인정보 처리 위탁
          </h2>
          <p>
            회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고
            있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Google Sheets: 데이터 저장 및 관리</li>
            <li>Vercel: 웹 호스팅</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">
            6. 문의
          </h2>
          <p>
            개인정보 관련 문의사항은{" "}
            <a
              href="mailto:donghun.cha@xbridge.kr"
              className="text-[#1E40AF] underline"
            >
              donghun.cha@xbridge.kr
            </a>
            로 연락해주세요.
          </p>
        </section>

        <p className="pt-4 text-xs text-[#94A3B8]">
          시행일: 2026년 3월 10일
        </p>
      </div>
    </div>
  );
}
