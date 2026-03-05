"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import { ObtenerClientesSection } from "kadesh/components/profile/sales/obtener-clientes";

export default function ObtenerClientesPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
            Obtener clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona una zona en el mapa y sincroniza negocios desde Google Maps como leads.
          </p>
        </div>
        <ObtenerClientesSection />
      </div>
      <Footer />
    </div>
  );
}
