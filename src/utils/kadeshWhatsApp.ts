import { KADESH_WHATSAPP } from "kadesh/constants/constans";

export function kadeshWhatsAppUrl(text: string): string {
  return `https://wa.me/${KADESH_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export const KADESH_HELP_PROMPTS = [
  {
    id: "question",
    label: "Tengo una duda de KADESH",
    body: (pageUrl: string) =>
      `Hola, tengo una duda de KADESH.\nEstoy en: ${pageUrl}`,
  },
  {
    id: "error",
    label: "Encontré un error",
    body: (pageUrl: string) =>
      `Hola, encontré un error en KADESH.\nPágina: ${pageUrl}\n\nLo que pasó:`,
  },
  {
    id: "account",
    label: "No puedo entrar a mi cuenta",
    body: (pageUrl: string) =>
      `Hola, no puedo entrar a mi cuenta en KADESH.\nPágina: ${pageUrl}`,
  },
  {
    id: "report-animal",
    label: "Quiero reportar un animal",
    body: (_pageUrl: string) =>
      `Hola, quiero reportar un animal en KADESH. ¿Me orientan?`,
  },
  {
    id: "clinic",
    label: "Quiero dar de alta mi clínica",
    body: (_pageUrl: string) =>
      `Hola, quiero dar de alta o reclamar la ficha de mi clínica en KADESH.`,
  },
] as const;
