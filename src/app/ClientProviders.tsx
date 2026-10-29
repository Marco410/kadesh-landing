"use client";

import ApolloProviderWrapper from '../providers/ApolloProviderWrapper';
import { ThemeProvider } from '../providers/ThemeProvider';
import { UserProvider } from "kadesh/utils/UserContext";
import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "sileo";
import { useTheme } from "next-themes";
import KadeshHelpWhatsApp from "kadesh/components/layout/KadeshHelpWhatsApp";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={(resolvedTheme === "dark" ? "dark" : "light") as "dark" | "light"}
    />
  );
}

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
            <KadeshHelpWhatsApp />
            <ThemedToaster />
          </UserProvider>
        </ApolloProviderWrapper>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
