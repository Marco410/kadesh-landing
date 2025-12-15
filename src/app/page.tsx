"use client";

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
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KADESH',
    url: 'https://www.kadesh.com.mx',
    description: 'Plataforma digital para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal en México',
    publisher: {
      '@type': 'Organization',
      name: 'KADESH',
      url: 'https://www.kadesh.com.mx',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.kadesh.com.mx/logo.png',
      },
      founder: {
        '@type': 'Person',
        name: 'Marco Castañeda',
        jobTitle: 'Ingeniero',
      },
      areaServed: {
        '@type': 'Country',
        name: 'México',
      },
      sameAs: [
        // Aquí se pueden agregar las redes sociales cuando estén disponibles
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.kadesh.com.mx/blog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'KADESH',
      description: 'Plataforma digital para el bienestar animal en México',
      url: 'https://www.kadesh.com.mx',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Soporte al cliente',
        url: 'https://www.kadesh.com.mx/contacto',
        areaServed: 'MX',
        availableLanguage: 'Spanish',
      },
      offers: {
        '@type': 'Offer',
        category: 'Servicios para bienestar animal',
        description: 'Plataforma para adopción, rescate, donaciones y conexión con veterinarias',
      },
    },
  };

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KADESH',
    url: 'https://www.kadesh.com.mx',
    logo: 'https://www.kadesh.com.mx/logo.png',
    description: 'Plataforma digital para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal en México',
    founder: {
      '@type': 'Person',
      name: 'Marco Castañeda',
      jobTitle: 'Ingeniero',
    },
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    knowsAbout: [
      'Bienestar animal',
      'Adopción de mascotas',
      'Rescate de animales',
      'Veterinarias',
      'Donaciones para animales',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Soporte al cliente',
      url: 'https://www.kadesh.com.mx/contacto',
      areaServed: 'MX',
      availableLanguage: 'Spanish',
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
      
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
    </>
  );
}
