import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajustes de avisos",
  robots: { index: false, follow: false },
};

export default function AjustesAvisosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
