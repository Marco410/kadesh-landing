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
import { Footer, Navigation } from 'kadesh/components/layout';

export default function HomePage() {
  return (
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
      <Footer />
    </main>
  );
}

