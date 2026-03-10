import dynamic from "next/dynamic";
import Header from "@/components/marketing/Header";
import HeroSection from "@/components/marketing/HeroSection";
import Footer from "@/components/marketing/Footer";
import TrackingProvider from "@/components/marketing/TrackingProvider";

const PainPointsSection = dynamic(
  () => import("@/components/marketing/PainPointsSection")
);
const FeaturesSection = dynamic(
  () => import("@/components/marketing/FeaturesSection")
);
const TrustSection = dynamic(
  () => import("@/components/marketing/TrustSection")
);
const BenefitsSection = dynamic(
  () => import("@/components/marketing/BenefitsSection")
);
const LeadCaptureForm = dynamic(
  () => import("@/components/marketing/LeadCaptureForm")
);
const FAQSection = dynamic(
  () => import("@/components/marketing/FAQSection")
);
const CTASection = dynamic(
  () => import("@/components/marketing/CTASection")
);

export default function Home() {
  return (
    <>
      <TrackingProvider />
      <Header />
      <main>
        <HeroSection />
        <PainPointsSection />
        <FeaturesSection />
        <TrustSection />
        <BenefitsSection />
        <LeadCaptureForm />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
