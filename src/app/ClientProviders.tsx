"use client";

import ApolloProviderWrapper from '../providers/ApolloProviderWrapper';
import { ThemeProvider } from '../providers/ThemeProvider';
import { UserProvider } from "kadesh/utils/UserContext";
import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "sileo";
import { useTheme } from "next-themes";
import KadeshHelpWhatsApp from "kadesh/components/layout/KadeshHelpWhatsApp";
import { useClientErrorListener } from "kadesh/utils/activity";
import PetActivityTracker from "kadesh/components/shared/PetActivityTracker";

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
  // Errores de código que nadie atrapó → Operaciones → Actividad → Errores.
  useClientErrorListener();
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <ApolloProviderWrapper>
          <UserProvider>
            {children}
            {/* Pantallas que abre y tiempo activo, solo con sesión. */}
            <PetActivityTracker />
            <KadeshHelpWhatsApp />
            <ThemedToaster />
          </UserProvider>
        </ApolloProviderWrapper>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
