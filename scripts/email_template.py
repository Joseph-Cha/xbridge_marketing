"""
이메일 HTML 템플릿

업체명을 동적으로 삽입하여 개인화된 제안 이메일을 생성합니다.
"""


def build_email_html(company_name: str, landing_page_url: str) -> str:
    """HTML 이메일 본문을 생성합니다.

    Args:
        company_name: 수신 업체명
        landing_page_url: 랜딩 페이지 URL
    """
    return f"""\
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1E40AF 0%,#3B82F6 100%);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:-0.5px;">XBridge</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI 기반 K-Food 수출 플랫폼</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:40px;">

      <!-- Greeting -->
      <p style="margin:0 0 24px;font-size:16px;color:#1E293B;line-height:1.7;">
        안녕하세요, <strong>{company_name}</strong> 담당자님.<br>
        XBridge에 차동훈입니다.
      </p>

      <!-- Problem -->
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;">
        혹시 이런 경험 있으신가요?
      </p>

      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;">
        새로운 국가에 제품을 수출하려는데, 그 나라의 식품 규제가 어디에 정리되어 있는지조차 파악이 안 되는 상황.
        현지어로 된 규정을 하나하나 찾아보고, 우리 제품이 해당되는 건지 판단하는 데만 며칠이 걸리기도 합니다.
      </p>

      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.8;">
        저희도 K-Food 수출 현장에서 이 문제를 가까이에서 보면서,
        &ldquo;이 과정이 왜 이렇게 어려워야 하지?&rdquo;라는 질문에서 XBridge를 시작하게 되었습니다.
      </p>

      <!-- Solution intro -->
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.8;">
        <strong style="color:#1E40AF;">XBridge</strong>는 AI 기술을 활용해 수출 실무에서 가장 시간이 많이 드는 부분을 줄여드리는 플랫폼입니다.
      </p>

      <!-- Features -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background-color:#F8FAFC;border-radius:8px;padding:4px;">
        <tr><td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#1E293B;line-height:1.7;">
                <span style="color:#1E40AF;font-weight:700;margin-right:8px;">&#x1F50D;</span>
                목표 국가의 식품 규제&middot;인증 요건을 AI가 분석해, 우리 제품이 수출 가능한지 빠르게 확인해 드립니다.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#1E293B;line-height:1.7;">
                <span style="color:#1E40AF;font-weight:700;margin-right:8px;">&#x1F4CB;</span>
                필요한 서류와 인증 절차를 안내하고, 준비 과정을 함께 지원합니다.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#1E293B;line-height:1.7;">
                <span style="color:#1E40AF;font-weight:700;margin-right:8px;">&#x1F91D;</span>
                검증된 바이어 정보와 물류&middot;통관 파트너까지 연결해 드립니다.
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- Benefit highlight -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border-left:4px solid #F97316;background-color:#FFF7ED;border-radius:0 8px 8px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#9A3412;line-height:1.7;">
            현재 2026년 상반기 출시를 목표로 준비 중이며, 사전 신청해 주시면
            <strong>출시 시 우선 초대</strong>와 함께 <strong>초기 이용 혜택</strong>을 드리겠습니다.
          </p>
        </td></tr>
      </table>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:8px 0 32px;">
          <a href="{landing_page_url}?utm_source=email&utm_medium=outreach&utm_campaign=pre_launch"
             target="_blank"
             style="display:inline-block;background-color:#F97316;color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;box-shadow:0 4px 12px rgba(249,115,22,0.3);">
            사전 신청 페이지 바로가기 &rarr;
          </a>
        </td></tr>
      </table>

      <p style="margin:0 0 20px;font-size:14px;color:#64748B;line-height:1.7;">
        아직 준비 단계이기에, 오히려 현장의 목소리가 가장 중요한 시기입니다.
        수출 과정에서 겪고 계신 어려움이 있다면 편하게 알려주세요.
        저희가 풀어야 할 문제를 더 정확히 이해하는 데 큰 도움이 됩니다.
      </p>

      <p style="margin:0;font-size:14px;color:#64748B;line-height:1.7;">
        감사합니다.<br>
        <strong style="color:#1E293B;">XBridge팀</strong> 드림
      </p>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background-color:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;">
      <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;text-align:center;">
        본 메일은 K-Food 수출에 관심이 있으실 것으로 판단되는 기업에 발송되었습니다.<br>
        수신을 원치 않으시면 본 이메일에 &lsquo;수신거부&rsquo;로 회신해 주시면 즉시 발송 목록에서 제외됩니다.
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#CBD5E1;text-align:center;">
        &copy; 2026 XBridge. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>"""


def build_email_text(company_name: str, landing_page_url: str) -> str:
    """텍스트 전용 이메일 본문 (HTML 미지원 클라이언트용)."""
    return f"""\
안녕하세요, {company_name} 담당자님.
XBridge에 차동훈입니다.

혹시 이런 경험 있으신가요?

새로운 국가에 제품을 수출하려는데, 그 나라의 식품 규제가 어디에 정리되어 있는지조차 파악이 안 되는 상황. 현지어로 된 규정을 하나하나 찾아보고, 우리 제품이 해당되는 건지 판단하는 데만 며칠이 걸리기도 합니다.

저희도 K-Food 수출 현장에서 이 문제를 가까이에서 보면서, "이 과정이 왜 이렇게 어려워야 하지?"라는 질문에서 XBridge를 시작하게 되었습니다.

XBridge는 AI 기술을 활용해 수출 실무에서 가장 시간이 많이 드는 부분을 줄여드리는 플랫폼입니다.

• 목표 국가의 식품 규제·인증 요건을 AI가 분석해, 우리 제품이 수출 가능한지 빠르게 확인해 드립니다.
• 필요한 서류와 인증 절차를 안내하고, 준비 과정을 함께 지원합니다.
• 검증된 바이어 정보와 물류·통관 파트너까지 연결해 드립니다.

현재 2026년 상반기 출시를 목표로 준비 중이며, 사전 신청해 주시면 출시 시 우선 초대와 함께 초기 이용 혜택을 드리겠습니다.

사전 신청 페이지: {landing_page_url}?utm_source=email&utm_medium=outreach&utm_campaign=pre_launch

아직 준비 단계이기에, 오히려 현장의 목소리가 가장 중요한 시기입니다. 수출 과정에서 겪고 계신 어려움이 있다면 편하게 알려주세요. 저희가 풀어야 할 문제를 더 정확히 이해하는 데 큰 도움이 됩니다.

감사합니다.
XBridge팀 드림.

---
본 메일은 K-Food 수출에 관심이 있으실 것으로 판단되는 기업에 발송되었습니다.
수신을 원치 않으시면 본 이메일에 '수신거부'로 회신해 주시면 즉시 발송 목록에서 제외됩니다.
"""
