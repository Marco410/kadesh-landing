"use client";
import "./globals.css";
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Kadesh</title>
        <meta name="description" content="KADESH es una plataforma digital diseñada para transformar el bienestar animal en México. Conectamos personas que buscan adoptar, rescatar, o reunirse con sus mascotas perdidas, con refugios, veterinarias y tiendas especializadas en su zona." />
        {/* Open Graph */}
        <meta property="og:title" content="KADESH - Conectando vidas, rescatando almas" />
        <meta property="og:description" content="KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México." />
        <meta property="og:image" content="https://www.kadesh.com.mx/og-image.png" />
        <meta property="og:url" content="https://www.kadesh.com.mx/" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KADESH - Conectando vidas, rescatando almas" />
        <meta name="twitter:description" content="KADESH es la plataforma para conectar adoptantes, rescatistas, veterinarias y tiendas para el bienestar animal real en México." />
        <meta name="twitter:image" content="https://www.kadesh.com.mx/og-image.png" />
      </head>
      <body className="font-sans bg-white text-brown-700">
        <ApolloProviderWrapper>
          {children}
          <SpeedInsights />
          <Analytics />
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
