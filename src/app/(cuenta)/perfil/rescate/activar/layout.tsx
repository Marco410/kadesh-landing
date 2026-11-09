import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activar espacio de rescate",
  robots: { index: false, follow: false },
};

export default function ActivarRescateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
