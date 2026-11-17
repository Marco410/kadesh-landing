import {
  HeroSection,
  RecentReportsSection,
  ReunionsSection,
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
import {
  fetchPetLandingStats,
  fetchRecentReports,
  fetchRecentZoneAlerts,
  fetchReunionStories,
} from "kadesh/components/home/server";
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
  const [stats, recentReports, zoneAlerts, events, allies, reunionStories] = await Promise.all([
    fetchPetLandingStats(),
    fetchRecentReports(),
    fetchRecentZoneAlerts(),
    fetchHomeEvents(),
    fetchRescueAllies(HOME_ALLIES_MAX),
    fetchReunionStories(),
  ]);

  return (
    <>
      <HomeJsonLd />
      <main className="min-h-screen">
        <Navigation overDarkHero />
        <HeroSection
          stats={stats}
          events={events.publishedTotal > 0 ? { count: events.publishedTotal } : null}
          recentReports={recentReports}
        />
        {/*
          Orden (ver components/home/README.md): primero lo que sirve a quien perdió a su mascota
          (reportes, prueba de que funciona, alertas, qué hacer, dudas); después la comunidad
          (espacios, aliados), los servicios y el blog (veterinarias, historias, eventos) y lo que
          sostiene a Kadesh (donaciones, negocios). Fondos alternados: no muevas una sección sin revisar
          el de sus vecinas.
        */}
        <RecentReportsSection initialReports={recentReports} />
        <ReunionsSection stories={reunionStories} stats={stats} />
        <ZoneAlertsSection alerts={zoneAlerts} />
        <HowItWorksSection />
        <FirstHoursSection />
        <FaqSection />
        <RescueSpacesSection />
        <AlliesSection allies={allies} />
        <VeterinariansSection />
        <StoriesSection />
        <UpcomingEventsSection events={events} />
        <DonationsSection />
        <BusinessStrip />
        <ClosingSection />
        <NewsletterSubscription description="Recibe consejos y reencuentros de la comunidad, una vez por semana." />
        <Footer />
      </main>
    </>
  );
}
