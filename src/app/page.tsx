import {
  Navigation,
  HeroSection,
  WhatIsKadesh,
  LostDogsSection,
  VeterinariansSection,
  StoriesSection,
  DonationsSection,
  HowItWorksSection,
  RoadmapSection,
  Footer,
} from 'kadesh/components/home';

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

