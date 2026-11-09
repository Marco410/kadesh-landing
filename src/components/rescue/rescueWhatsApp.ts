import { kadeshWhatsAppUrl } from 'kadesh/utils/kadeshWhatsApp';
import { rescueTypeLabel } from './constants';

/** Mensaje al WhatsApp de KADESH para validar un espacio de rescate recién activado. */
export function rescueVerificationWhatsAppUrl(org: {
  id: string;
  name: string;
  type: string;
  city?: string | null;
  state?: string | null;
}): string {
  const place = [org.city, org.state].filter(Boolean).join(', ');
  const lines = [
    `Hola, activé el espacio de rescate «${org.name}» en KADESH y quiero verificarlo.`,
    '',
    `ID: ${org.id}`,
    `Tipo: ${rescueTypeLabel(org.type)}`,
  ];
  if (place) lines.push(`Zona: ${place}`);
  lines.push('', 'Les comparto nuestras redes y fotos de nuestros rescates para validarlo.');
  return kadeshWhatsAppUrl(lines.join('\n'));
}

/** WhatsApp público de la organización, con un mensaje que dice que viene de KADESH. */
export function rescueContactWhatsAppUrl(whatsapp: string, text: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  const number = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
