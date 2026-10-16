import {
  HeroSection,
  RecentReportsSection,
  HowItWorksSection,
  FirstHoursSection,
  StoriesSection,
  VeterinariansSection,
  DonationsSection,
  BusinessStrip,
  ClosingSection,
} from "kadesh/components/home";
import FaqSection from "kadesh/components/home/FaqSection";
import HomeJsonLd from "kadesh/components/home/HomeJsonLd";
import { fetchPetLandingStats } from "kadesh/components/home/server";
import { HOME_DEFINITION } from "kadesh/components/home/constants";
import { Footer, Navigation } from "kadesh/components/layout";
import { NewsletterSubscription } from "kadesh/components/newsletter";
import { ZoneAlertsInvite } from "kadesh/components/notifications";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KADESH — Conectando vidas, rescatando almas",
  description: HOME_DEFINITION,
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default async function HomePage() {
  const stats = await fetchPetLandingStats();

  return (
    <>
      <HomeJsonLd />
      <main className="min-h-screen">
        <Navigation overDarkHero />
        <HeroSection stats={stats} />
        <ZoneAlertsInvite />
        <RecentReportsSection />
        <HowItWorksSection />
        <FirstHoursSection />
        <StoriesSection />
        <VeterinariansSection />
        <DonationsSection />
        <BusinessStrip />
        <FaqSection />
        <ClosingSection />
        <NewsletterSubscription description="Recibe consejos y reencuentros de la comunidad, una vez por semana." />
        <Footer />
      </main>
    </>
  );
}
