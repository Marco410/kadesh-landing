import {
  HeroSection,
  RecentReportsSection,
  ZoneAlertsSection,
  UpcomingEventsSection,
  HowItWorksSection,
  FirstHoursSection,
  StoriesSection,
  RescueSpacesSection,
  AlliesSection,
  HOME_ALLIES_MAX,
  VeterinariansSection,
  DonationsSection,
  BusinessStrip,
  ClosingSection,
} from "kadesh/components/home";
import FaqSection from "kadesh/components/home/FaqSection";
import HomeJsonLd from "kadesh/components/home/HomeJsonLd";
import { fetchPetLandingStats, fetchRecentReports, fetchRecentZoneAlerts } from "kadesh/components/home/server";
import { fetchHomeEvents } from "kadesh/components/events/server";
import { fetchRescueAllies } from "kadesh/components/rescue/server";
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
  const [stats, recentReports, zoneAlerts, events, allies] = await Promise.all([
    fetchPetLandingStats(),
    fetchRecentReports(),
    fetchRecentZoneAlerts(),
    fetchHomeEvents(),
    fetchRescueAllies(HOME_ALLIES_MAX),
  ]);

  return (
    <>
      <HomeJsonLd />
      <main className="min-h-screen">
        <Navigation overDarkHero />
        <HeroSection
          stats={stats}
          events={events.publishedTotal > 0 ? { count: events.publishedTotal } : null}
        />
        <RecentReportsSection initialReports={recentReports} />
        <ZoneAlertsSection alerts={zoneAlerts} />
        <VeterinariansSection />
        <UpcomingEventsSection events={events} />
        <HowItWorksSection />
        <FirstHoursSection />
        <StoriesSection />
        <RescueSpacesSection />
        <AlliesSection allies={allies} />
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
