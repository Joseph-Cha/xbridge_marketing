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
const META_PIXEL_ID = "2014750879440558";

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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18094494786"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18094494786');
            ${GA_ID ? `gtag('config', '${GA_ID}');` : ''}
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
