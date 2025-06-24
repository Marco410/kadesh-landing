"use client";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

export default function MantineProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorSchemeScript />
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
        {children}
      </MantineProvider>
    </>
  );
} 