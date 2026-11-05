import { DEFAULT_RADIUS_VETERINARIES } from 'kadesh/constants/constans';
import { ALERT_RADIUS_OPTIONS, MAX_DAILY_ALERTS } from 'kadesh/components/notifications/constants';

export { SITE_URL } from 'kadesh/core/site';

export const HOME_DEFINITION =
  'KADESH es una plataforma digital de bienestar animal en México que conecta a personas que buscan adoptar, rescatar o reunirse con mascotas perdidas, con rescatistas, veterinarias y refugios de su zona. Reúne reportes, alertas de zona, directorio veterinario, historias y donaciones en un solo santuario digital.';

const MIN_ALERT_RADIUS_KM = ALERT_RADIUS_OPTIONS[0];
const MAX_ALERT_RADIUS_KM = ALERT_RADIUS_OPTIONS[ALERT_RADIUS_OPTIONS.length - 1];

/**
 * Respuesta directa bajo el H2 de alertas (GEO): se entiende sola, sin el resto de la página.
 * Los canales dicen lo mismo que la pantalla de alertas (`AlertSettingsForm`).
 */
export const ZONE_ALERTS_ANSWER = `Las alertas de zona de Kadesh Pet son gratis. Eliges un punto en el mapa y un radio de ${MIN_ALERT_RADIUS_KM} a ${MAX_ALERT_RADIUS_KM} km, y cada vez que alguien reporta una mascota perdida o encontrada dentro de esa zona te avisamos en tus notificaciones, en la app si la tienes y, si lo activas, por WhatsApp.`;

/** Reglas reales del envío (kadesh-back `utils/notifications/nearbyAnimalAlerts.ts`). */
export const ZONE_ALERTS_FACTS = [
  {
    id: 'zone',
    title: 'Tú eliges la zona',
    text: `Un punto en el mapa, como tu casa o tu trabajo, y un radio de ${MIN_ALERT_RADIUS_KM} a ${MAX_ALERT_RADIUS_KM} km.`,
  },
  {
    id: 'now',
    title: 'Llegan al momento',
    text: 'En cuanto se publica el reporte, cuando las primeras horas cuentan más.',
  },
  {
    id: 'quiet',
    title: 'Sin ruido',
    text: `Máximo ${MAX_DAILY_ALERTS} al día y solo de mascotas perdidas o encontradas. Las apagas cuando quieras.`,
  },
] as const;

/** Modal de cuenta del botón «Activar alertas de mi zona». */
export const ZONE_ALERTS_AUTH_REASONS = [
  'Te avisamos cuando reporten una mascota perdida o encontrada cerca de ti.',
  `Tú eliges el punto y el radio, de ${MIN_ALERT_RADIUS_KM} a ${MAX_ALERT_RADIUS_KM} km.`,
  `Máximo ${MAX_DAILY_ALERTS} al día. Las apagas cuando quieras.`,
] as const;

/** Empieza por lo que frena a quien quiere reportar. */
export const HOME_FAQS = [
  {
    question: '¿Cuánto cuesta reportar?',
    answer:
      'Nada. Reportar, buscar animales y consultar veterinarias es gratis, siempre. Las donaciones y los anuncios son opcionales y no bloquean nada.',
  },
  {
    question: '¿Por qué tengo que crear una cuenta?',
    answer:
      'Para que solo tú puedas editar o cerrar el reporte de tu mascota, y para que quien la encuentre pueda contactarte. Toma 1 minuto.',
  },
  {
    question: '¿Quién ve mi reporte?',
    answer:
      'Cualquier persona que entre al mapa: vecinos, rescatistas y veterinarias de tu zona. Además avisamos a quienes tienen alertas de zona activas donde se perdió o apareció, y lo compartimos en la página de Facebook de Kadesh Pet.',
  },
  {
    question: '¿Cómo me entero si se pierde una mascota cerca de mí?',
    answer: `Activa las alertas de zona: eliges un punto en el mapa y un radio de ${MIN_ALERT_RADIUS_KM} a ${MAX_ALERT_RADIUS_KM} km. Cada vez que alguien reporta una mascota perdida o encontrada en esa zona, te avisamos en tus notificaciones y, si quieres, por WhatsApp. Son gratis y llegan máximo ${MAX_DAILY_ALERTS} al día.`,
  },
  {
    question: '¿Se muestra mi teléfono?',
    answer:
      'Sí. El teléfono que pongas en el reporte aparece en la ficha de tu mascota con un botón para llamarte, para que quien la vea te avise de inmediato. Puedes usar un número distinto al de tu cuenta.',
  },
  {
    question: '¿Cómo encuentro veterinarias cercanas?',
    answer: `Permite tu ubicación en el directorio y verás las que están a menos de ${DEFAULT_RADIUS_VETERINARIES} km, con su contacto.`,
  },
  {
    question: '¿A qué se destina una donación?',
    answer:
      'A servidores, dominios, herramientas, difusión, casos urgentes y a las personas que operan el proyecto. El recuento está en la página de donaciones.',
  },
  {
    question: '¿Quién creó Kadesh Pet?',
    answer:
      'El ingeniero Marco Castañeda, en México. La misión es unir tecnología y comunidad para encontrar, atender y reubicar animales, no solo darles visibilidad en redes.',
  },
] as const;
