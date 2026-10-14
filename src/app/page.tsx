import {
  HeroSection,
  WhatIsKadesh,
  LostDogsSection,
  VeterinariansSection,
  StoriesSection,
  DonationsSection,
  HowItWorksSection,
  RoadmapSection,
  KadeshFamilySection,
  AdvertiseSection,
} from "kadesh/components/home";
import FaqSection from "kadesh/components/home/FaqSection";
import HomeJsonLd from "kadesh/components/home/HomeJsonLd";
import { fetchPetLandingStats } from "kadesh/components/home/server";
import { HOME_DEFINITION } from "kadesh/components/home/constants";
import { Footer, Navigation } from "kadesh/components/layout";
import { NewsletterSubscription } from "kadesh/components/newsletter";
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
        <Navigation />
        <HeroSection stats={stats} />
        <WhatIsKadesh />
        <LostDogsSection />
        <VeterinariansSection />
        <StoriesSection />
        <DonationsSection />
        <HowItWorksSection />
        <RoadmapSection />
        <FaqSection />
        <AdvertiseSection />
        <KadeshFamilySection />
        <NewsletterSubscription />
        <Footer />
      </main>
    </>
  );
}
