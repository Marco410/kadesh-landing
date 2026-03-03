"use client";

import ApolloProviderWrapper from '../providers/ApolloProviderWrapper';
import { ThemeProvider } from '../providers/ThemeProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "kadesh/utils/UserContext";
import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "sileo";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <ApolloProviderWrapper>
          <UserProvider>
            {children}
            <Toaster position="top-right" />
            <SpeedInsights />
            <Analytics />
          </UserProvider>
        </ApolloProviderWrapper>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
