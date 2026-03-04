"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import { DetailLeadSection } from "kadesh/components/profile/sales/detail_lead";

export default function LeadDetailPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <DetailLeadSection />
      <Footer />
    </div>
  );
}
