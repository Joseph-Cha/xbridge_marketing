import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XBridge - K-Food 수출 플랫폼 사전 신청",
  description:
    "AI 기반 K-Food 수출 플랫폼 XBridge가 곧 출시됩니다. 지금 사전 신청하고 특별 혜택을 받으세요.",
  keywords:
    "식품수출, K-Food, 수출플랫폼, 바이어매칭, 해외진출, 중소기업수출, 사전신청",
  openGraph: {
    title: "XBridge - K-Food 수출의 새로운 기준 (사전 신청 중)",
    description:
      "AI 분석 + 검증된 바이어 매칭. 지금 사전 신청하고 50% 할인 혜택을 받으세요.",
    type: "website",
    locale: "ko_KR",
    url: "https://xbridge.co.kr",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
