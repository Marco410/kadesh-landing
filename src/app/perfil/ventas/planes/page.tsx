"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import PlansSection from "kadesh/components/profile/sales/planes/PlansSection";

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <PlansSection />
      </main>
      <Footer />
    </div>
  );
}
