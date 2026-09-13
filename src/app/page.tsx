import {
  HeroSection,
  WhatIsKadesh,
  LostDogsSection,
  VeterinariansSection,
  StoriesSection,
  DonationsSection,
  HowItWorksSection,
  RoadmapSection,
} from 'kadesh/components/home';
import FaqSection from 'kadesh/components/home/FaqSection';
import HomeJsonLd from 'kadesh/components/home/HomeJsonLd';
import { HOME_DEFINITION, SITE_URL } from 'kadesh/components/home/constants';
import { Footer, Navigation } from 'kadesh/components/layout';
import { NewsletterSubscription } from 'kadesh/components/newsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KADESH — Conectando vidas, rescatando almas',
  description: HOME_DEFINITION,
  alternates: { canonical: SITE_URL },
};

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <main className="min-h-screen">
        <Navigation />
        <HeroSection />
        <WhatIsKadesh />
        <LostDogsSection />
        <VeterinariansSection />
        <StoriesSection />
        <DonationsSection />
        <HowItWorksSection />
        <RoadmapSection />
        <FaqSection />
        <NewsletterSubscription />
        <Footer />
      </main>
    </>
  );
}
