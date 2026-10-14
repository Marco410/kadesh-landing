import { DEFAULT_RADIUS_VETERINARIES } from 'kadesh/constants/constans';

export { SITE_URL } from 'kadesh/core/site';

export const HOME_DEFINITION =
  'KADESH es una plataforma digital de bienestar animal en México que conecta a personas que buscan adoptar, rescatar o reunirse con mascotas perdidas, con rescatistas, veterinarias y refugios de su zona. Reúne reportes, directorio veterinario, historias y donaciones en un solo santuario digital.';

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
      'Cualquier persona que entre al mapa: vecinos, rescatistas y veterinarias de tu zona. También lo compartimos en la página de Facebook de Kadesh Pet.',
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
