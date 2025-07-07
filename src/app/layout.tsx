"use client";
import "./globals.css";
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import ApolloProviderWrapper from '../components/ApolloProviderWrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Kadesh</title>
        <meta name="description" content="KADESH es una plataforma digital diseñada para transformar el bienestar animal en México. Conectamos personas que buscan adoptar, rescatar, o reunirse con sus mascotas perdidas, con refugios, veterinarias y tiendas especializadas en su zona." />
        <script async
          src="https://js.stripe.com/v3/buy-button.js">
        </script>
      </head>
      <body style={{ fontFamily: 'Poppins, Inter, sans-serif', background: '#fff', color: '#3B2C23' }}>
        <MantineProvider
          theme={{
            fontFamily: 'Poppins, Inter, sans-serif',
            primaryColor: 'green',
            colors: {
              green: [
                '#E6F4EA', '#CDE9D5', '#A8D5BA', '#7FC39C', '#5BAA7B',
                '#3B8C5A', '#2C6B44', '#1D4A2E', '#11301B', '#06170A',
              ],
              brown: [
                '#F5F3F1', '#E9E3DF', '#CFC0B7', '#B39C8C', '#8C6B4B',
                '#6B4B2C', '#4A2E1D', '#301B11', '#170A06', '#0A0603',
              ],
            },
            headings: { fontFamily: 'Poppins, Inter, sans-serif' },
          }}
        >
          <ApolloProviderWrapper>
            {children}
          </ApolloProviderWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
