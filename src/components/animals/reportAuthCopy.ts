import type { AuthGateCopy } from 'kadesh/components/auth/AuthGateModal';
import { getStatusColor } from './constants';

const WHY_ACCOUNT =
  'Pedimos una cuenta para que cada reporte tenga a alguien responsable detrás. Te toma un minuto y luego pasas directo al formulario.';

const COPY: Record<string, Omit<AuthGateCopy, 'description' | 'accentColor'>> = {
  lost: {
    title: 'Reporta a tu mascota perdida',
    reasons: [
      'Avisamos a quienes tienen alertas activadas en la zona donde se perdió.',
      'Quien la vea podrá contactarte con el teléfono que pongas en el reporte.',
      'Solo tú puedes actualizar el reporte y avisar cuando regrese a casa.',
    ],
  },
  found: {
    title: 'Reporta la mascota que encontraste',
    reasons: [
      'Avisamos a quienes tienen alertas activadas en esa zona, por si es de alguien cercano.',
      'Su familia podrá encontrarla en el mapa y contactarte.',
      'Solo tú puedes actualizar el reporte cuando vuelva con su familia.',
    ],
  },
  in_adoption: {
    title: 'Da en adopción',
    reasons: [
      'Tu publicación aparece en el directorio de mascotas en adopción.',
      'Quien quiera adoptar te contacta con el teléfono que pongas.',
      'Solo tú puedes actualizarla y marcarla cuando encuentre hogar.',
    ],
  },
  rescued: {
    title: 'Reporta un rescate',
    reasons: [
      'Tu reporte aparece en el mapa para que su familia o un adoptante la encuentre.',
      'Te contactan con el teléfono que pongas en el reporte.',
      'Solo tú puedes actualizar el reporte cuando cambie su situación.',
    ],
  },
};

const DEFAULT_COPY: Omit<AuthGateCopy, 'description' | 'accentColor'> = {
  title: 'Publica un reporte',
  reasons: [
    'Tu reporte aparece en el mapa y en el directorio de Kadesh Pet.',
    'Te contactan con el teléfono que pongas en el reporte.',
    'Solo tú puedes actualizarlo cuando cambie su situación.',
  ],
};

/** Textos del modal de cuenta según el tipo de reporte (`?status=` de /animales/nuevo). */
export function reportAuthCopy(status: string | null | undefined): AuthGateCopy {
  const copy = (status && COPY[status]) || DEFAULT_COPY;
  return {
    ...copy,
    description: WHY_ACCOUNT,
    accentColor: status && COPY[status] ? getStatusColor(status) : undefined,
  };
}
